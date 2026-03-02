#!/usr/bin/env python3
"""
UA Console Unison Slot Control
Controls the Unison plugin slot on inputs 0 and 1 only.

Note: true = enabled, false = bypassed

Usage:
    python ua_unison.py <index> <action>

Index:   0 or 1 only
Action:  enable | bypass | toggle | status

Examples:
    python ua_unison.py 0 toggle
    python ua_unison.py 1 bypass
    python ua_unison.py 0 status
"""

import socket
import json
import sys

HOST = '127.0.0.1'
PORT = 4710
DEVICE = 0

def send_recv(sock, cmd):
    sock.sendall((cmd + '\x00').encode())
    buf = b''
    while b'\x00' not in buf:
        chunk = sock.recv(4096)
        if not chunk:
            break
        buf += chunk
    return buf.split(b'\x00')[0].decode(errors='replace')

def get_unison_state(sock, input_index):
    response = send_recv(sock, f"get /devices/{DEVICE}/inputs/{input_index}/preamps/0/effects/0/Power/value")
    return json.loads(response)['data']

def set_unison(sock, input_index, state):
    value = "true" if state else "false"
    send_recv(sock, f"set /devices/{DEVICE}/inputs/{input_index}/preamps/0/effects/0/Power/value {value}")
    print(f"Input {input_index} Unison: {'ENABLED' if state else 'BYPASSED'}")

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    input_index = sys.argv[1]
    action = sys.argv[2].lower()

    if not input_index.isdigit() or int(input_index) not in (0, 1):
        print("Index must be 0 or 1 (Unison only exists on inputs 0 and 1)")
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
            state = get_unison_state(s, input_index)
            print(f"Input {input_index} Unison: {'enabled' if state else 'BYPASSED'}")
        elif action == 'enable':
            set_unison(s, input_index, True)
        elif action == 'bypass':
            set_unison(s, input_index, False)
        elif action == 'toggle':
            current = get_unison_state(s, input_index)
            set_unison(s, input_index, not current)

if __name__ == '__main__':
    main()
