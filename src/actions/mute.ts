import { action, KeyDownEvent, KeyAction, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { getMuteState, toggleMute } from "../ua-client";

type MuteSettings = {
	inputIndex: number;
};

@action({ UUID: "com.cearka.uad-console-hotkeys.mute" })
export class MuteAction extends SingletonAction<MuteSettings> {

	override async onWillAppear(ev: WillAppearEvent<MuteSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const muted = await getMuteState(index);
			await (ev.action as KeyAction<MuteSettings>).setState(muted ? 1 : 0);
		} catch {
			await (ev.action as KeyAction<MuteSettings>).setState(0);
		}
	}

	override async onKeyDown(ev: KeyDownEvent<MuteSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const nowMuted = await toggleMute(index);
			await (ev.action as KeyAction<MuteSettings>).setState(nowMuted ? 1 : 0);
		} catch {
			// leave state as-is on error
		}
	}
}
