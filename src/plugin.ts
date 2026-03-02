import streamDeck from "@elgato/streamdeck";

import { MuteAction } from "./actions/mute";
import { PluginsAction } from "./actions/plugins";
import { UnisonAction } from "./actions/unison";
import { MasterAction } from "./actions/master";

streamDeck.actions.registerAction(new MuteAction());
streamDeck.actions.registerAction(new PluginsAction());
streamDeck.actions.registerAction(new UnisonAction());
streamDeck.actions.registerAction(new MasterAction());

streamDeck.connect();
