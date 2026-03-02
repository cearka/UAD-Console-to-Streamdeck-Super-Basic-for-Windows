import { action, KeyDownEvent, KeyAction, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { getPluginState, togglePlugins } from "../ua-client";

type PluginsSettings = {
	inputIndex: number;
};

@action({ UUID: "com.cearka.uad-console-hotkeys.plugins" })
export class PluginsAction extends SingletonAction<PluginsSettings> {

	override async onWillAppear(ev: WillAppearEvent<PluginsSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const enabled = await getPluginState(index);
			await (ev.action as KeyAction<PluginsSettings>).setState(enabled ? 0 : 1);
		} catch {
			await (ev.action as KeyAction<PluginsSettings>).setState(0);
		}
	}

	override async onKeyDown(ev: KeyDownEvent<PluginsSettings>): Promise<void> {
		const index = ev.payload.settings.inputIndex ?? 0;
		try {
			const nowEnabled = await togglePlugins(index);
			await (ev.action as KeyAction<PluginsSettings>).setState(nowEnabled ? 0 : 1);
		} catch {
			// leave state as-is on error
		}
	}
}
