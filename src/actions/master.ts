import { action, KeyDownEvent, KeyAction, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { getMasterState, toggleMaster } from "../ua-client";

type MasterSettings = {
	inputIndex: number;
};

@action({ UUID: "com.cearka.uad-console-hotkeys.master" })
export class MasterAction extends SingletonAction<MasterSettings> {

	override async onWillAppear(ev: WillAppearEvent<MasterSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const isOn = await getMasterState(index);
			await (ev.action as KeyAction<MasterSettings>).setState(isOn ? 0 : 1);
		} catch {
			await (ev.action as KeyAction<MasterSettings>).setState(0);
		}
	}

	override async onKeyDown(ev: KeyDownEvent<MasterSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const nowOn = await toggleMaster(index);
			await (ev.action as KeyAction<MasterSettings>).setState(nowOn ? 0 : 1);
		} catch {
			// leave state as-is on error
		}
	}
}
