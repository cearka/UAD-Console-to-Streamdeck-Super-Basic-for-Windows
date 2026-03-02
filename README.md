# UAD Console Hotkeys

plugin for controlling Universal Audio Apollo Console directly from elgato streamdeck. toggles channel mutes, bypass plugin inserts, toggles the unison slot (I seperated that out), and combine mute + bypass into a single master button.  
in my setup, I got a preamp with 8 channels going to my apollot over adat, so I need to quick toggles to mute and unmute, but also to bypass plugins in order to manage that valuable D. S. P. (oh yeah!).

you can also just use the python script with something like autohotkey or whatever if you don't have a stream deck.  I wrote them for AHK first before converting it to a plugin.  (they're standalone, so editting theese are easier but they DO NOT effect the plugin for stream deck)

if you want more features, just get wire shark, sniff port tcp port 4710, click some buttons in console, and you can figure out what the commands that need to be sent are.

I've wrapped this up to the point that it does what I need to do, so I probably won't be updating this anymore (I have to many other projects to work on).  leaving this here for anyone else that work use this as is, or fork and add to it for they're own needs.  us windows users very much get little love from uad lol.

---

## Actions

| Action | Description |
|--------|-------------|
| **UA Mute** | Toggle mute on a channel. States: `LIVE` / `MUTED` |
| **UA Plugins** | Toggle all 4 insert slots on a channel. States: `FX ON` / `BYPASSED` |
| **UA Unison** | Toggle the Unison slot (inputs 0 and 1 only). States: `UNISON ON` / `UNISON OFF` |
| **UA Master** | Toggle mute + all plugins together on a channel. States: `ON` / `OFF` |

the buttons are pretty self explanatory.  if you wanna have a button that can do individual slots on the bypass, you'll have to update the code.  mine's an all or nothin'

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- Stream Deck software v6.9 or higher
- UA Console installed and running (the UA Mixer Engine must be active on port 4710)

---

## Installation

1. Clone the repo:
   ```
   git clone https://github.com/YOUR_USERNAME/uad-console-hotkeys.git
   cd uad-console-hotkeys
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the plugin:
   ```
   npm run build
   ```

4. Restart Stream Deck software if the plugin doesn't appear automatically. Look for **UAD Console Hotkeys** in the actions panel.

## How It Works

UA Console runs a local TCP server on `127.0.0.1:4710` that the Console app uses internally to communicate with the UA Mixer Engine. This plugin just kinda hijacks that a lil bit.

---

## Standalone Python Scripts

The `scripts/` folder contains standalone Python utilities for the same functions, useful for testing or wiring up whatever.  you can run them from command line.

| Script | Description |
|--------|-------------|
| `ua_mute.py` | Mute control for inputs 0–9 |
| `ua_plugins.py` | Plugin bypass control for inputs 0–9 |
| `ua_unison.py` | Unison slot control for inputs 0–1 |

```
python scripts/ua_mute.py 7 toggle
python scripts/ua_plugins.py 4 bypass
python scripts/ua_unison.py 0 status
```

---

## Tested On

- apollo twin usb
- Windows 10
- Stream Deck software 6.9. (nice!) I think...
- UA Console (latest.  probably)

---

## License
I dunno whatever open source non commercial.  GNU public 3 sounds about right.
