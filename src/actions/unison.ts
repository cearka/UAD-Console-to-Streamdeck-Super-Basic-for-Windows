import { action, KeyDownEvent, KeyAction, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { getUnisonState, toggleUnison } from "../ua-client";

type UnisonSettings = {
	inputIndex: number;
};

@action({ UUID: "com.cearka.uad-console-hotkeys.unison" })
export class UnisonAction extends SingletonAction<UnisonSettings> {

	override async onWillAppear(ev: WillAppearEvent<UnisonSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const enabled = await getUnisonState(index);
			await (ev.action as KeyAction<UnisonSettings>).setState(enabled ? 0 : 1);
		} catch {
			await (ev.action as KeyAction<UnisonSettings>).setState(0);
		}
	}

	override async onKeyDown(ev: KeyDownEvent<UnisonSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const nowEnabled = await toggleUnison(index);
			await (ev.action as KeyAction<UnisonSettings>).setState(nowEnabled ? 0 : 1);
		} catch {
			// leave state as-is on error
		}
	}
}
