#!/usr/bin/env python3
"""
UA Console Plugin Power Control
Toggles all 4 insert slots on a channel on or off.

Note: true = enabled, false = bypassed (opposite of mute)

Usage:
    python ua_plugins.py <index> <action>

Index:   0-9
Action:  enable | bypass | toggle | status

Examples:
    python ua_plugins.py 0 toggle
    python ua_plugins.py 7 bypass
    python ua_plugins.py 3 status
"""

import socket
import json
import sys

HOST = '127.0.0.1'
PORT = 4710
DEVICE = 0
NUM_SLOTS = 4

def send_recv(sock, cmd):
    sock.sendall((cmd + '\x00').encode())
    buf = b''
    while b'\x00' not in buf:
        chunk = sock.recv(4096)
        if not chunk:
            break
        buf += chunk
    return buf.split(b'\x00')[0].decode(errors='replace')

def get_slot_state(sock, input_index, slot):
    response = send_recv(sock, f"get /devices/{DEVICE}/inputs/{input_index}/effects/{slot}/Power/value")
    return json.loads(response)['data']

def set_slot(sock, input_index, slot, state):
    value = "true" if state else "false"
    send_recv(sock, f"set /devices/{DEVICE}/inputs/{input_index}/effects/{slot}/Power/value {value}")

def get_all_slots(sock, input_index):
    """Returns list of 4 booleans, one per slot."""
    return [get_slot_state(sock, input_index, slot) for slot in range(NUM_SLOTS)]

def set_all_slots(sock, input_index, state):
    for slot in range(NUM_SLOTS):
        set_slot(sock, input_index, slot, state)
    label = "ENABLED" if state else "BYPASSED"
    print(f"Input {input_index}: all plugins {label}")

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    input_index = sys.argv[1]
    action = sys.argv[2].lower()

    if not input_index.isdigit() or int(input_index) not in range(10):
        print("Index must be 0-9")
        sys.exit(1)

    if action not in ('enable', 'bypass', 'toggle', 'status'):
        print("Action must be: enable | bypass | toggle | status")
        sys.exit(1)

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(5)
        try:
            s.connect((HOST, PORT))
        except ConnectionRefusedError:
            print("Could not connect — is Console running?")
            sys.exit(1)

        if action == 'status':
            states = get_all_slots(s, input_index)
            for slot, state in enumerate(states):
                print(f"Input {input_index} slot {slot}: {'enabled' if state else 'BYPASSED'}")

        elif action == 'enable':
            set_all_slots(s, input_index, True)

        elif action == 'bypass':
            set_all_slots(s, input_index, False)

        elif action == 'toggle':
            # If any slot is enabled, bypass all. If all bypassed, enable all.
            states = get_all_slots(s, input_index)
            any_enabled = any(states)
            set_all_slots(s, input_index, not any_enabled)

if __name__ == '__main__':
    main()
