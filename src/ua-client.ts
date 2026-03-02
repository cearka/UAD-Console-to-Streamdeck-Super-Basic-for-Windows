import * as net from "net";

const HOST = "127.0.0.1";
const PORT = 4710;
const DEVICE = 0;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendRecv(cmd: string): Promise<any> {
	return new Promise((resolve, reject) => {
		const client = new net.Socket();
		let buf = "";

		client.setTimeout(5000);

		client.connect(PORT, HOST, () => {
			client.write(cmd + "\x00");
		});

		client.on("data", (data) => {
			buf += data.toString();
			if (buf.includes("\x00")) {
				const msg = buf.split("\x00")[0];
				client.destroy();
				try {
					resolve(JSON.parse(msg));
				} catch (e) {
					reject(new Error(`Failed to parse response: ${msg}`));
				}
			}
		});

		client.on("timeout", () => {
			client.destroy();
			reject(new Error("Connection timed out"));
		});

		client.on("error", (err) => {
			reject(err);
		});
	});
}

// ── Mute ──────────────────────────────────────────────────────────────────────

export async function getMuteState(inputIndex: number): Promise<boolean> {
	const res = await sendRecv(`get /devices/${DEVICE}/inputs/${inputIndex}/Mute/value`);
	return res.data as boolean;
}

export async function setMute(inputIndex: number, state: boolean): Promise<boolean> {
	const res = await sendRecv(`set /devices/${DEVICE}/inputs/${inputIndex}/Mute/value ${state}`);
	return res.data as boolean;
}

export async function toggleMute(inputIndex: number): Promise<boolean> {
	const current = await getMuteState(inputIndex);
	return await setMute(inputIndex, !current);
}

// ── Plugin inserts ─────────────────────────────────────────────────────────────

const NUM_SLOTS = 4;

export async function getPluginState(inputIndex: number): Promise<boolean> {
	const states = await Promise.all(
		Array.from({ length: NUM_SLOTS }, (_, slot) =>
			sendRecv(`get /devices/${DEVICE}/inputs/${inputIndex}/effects/${slot}/Power/value`)
				.then((r) => r.data as boolean)
		)
	);
	return states.some((s) => s);
}

export async function setAllPlugins(inputIndex: number, state: boolean): Promise<void> {
	for (let slot = 0; slot < NUM_SLOTS; slot++) {
		await sendRecv(`set /devices/${DEVICE}/inputs/${inputIndex}/effects/${slot}/Power/value ${state}`);
		await sleep(100);
	}
}

export async function togglePlugins(inputIndex: number): Promise<boolean> {
	const anyEnabled = await getPluginState(inputIndex);
	await setAllPlugins(inputIndex, !anyEnabled);
	return !anyEnabled;
}

// ── Unison ────────────────────────────────────────────────────────────────────

export async function getUnisonState(inputIndex: number): Promise<boolean> {
	const res = await sendRecv(`get /devices/${DEVICE}/inputs/${inputIndex}/preamps/0/effects/0/Power/value`);
	return res.data as boolean;
}

export async function setUnison(inputIndex: number, state: boolean): Promise<boolean> {
	const res = await sendRecv(`set /devices/${DEVICE}/inputs/${inputIndex}/preamps/0/effects/0/Power/value ${state}`);
	return res.data as boolean;
}

export async function toggleUnison(inputIndex: number): Promise<boolean> {
	const current = await getUnisonState(inputIndex);
	return await setUnison(inputIndex, !current);
}

// ── Master (mute + plugins combined) ─────────────────────────────────────────

export async function getMasterState(inputIndex: number): Promise<boolean> {
	// Returns true if channel is "on" (not muted)
	const muted = await getMuteState(inputIndex);
	return !muted;
}

export async function toggleMaster(inputIndex: number): Promise<boolean> {
	const muted = await getMuteState(inputIndex);
	// If currently muted, turn everything on. If live, turn everything off.
	const newState = muted; // true = turn on, false = turn off
	await setMute(inputIndex, !newState);
	await setAllPlugins(inputIndex, newState);
	return newState; // true = now ON, false = now OFF
}
