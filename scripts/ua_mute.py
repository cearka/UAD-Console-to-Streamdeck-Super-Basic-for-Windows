#!/usr/bin/env python3
"""
UA Console Mute Control

Usage:
    python ua_mute.py <index> <action>

Index:   0-9
Action:  mute | unmute | toggle | status

Examples:
    python ua_mute.py 0 toggle
    python ua_mute.py 7 mute
    python ua_mute.py 3 status
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

def get_mute_state(sock, index):
    response = send_recv(sock, f"get /devices/{DEVICE}/inputs/{index}/Mute/value")
    return json.loads(response)['data']

def set_mute(sock, index, state):
    value = "true" if state else "false"
    response = send_recv(sock, f"set /devices/{DEVICE}/inputs/{index}/Mute/value {value}")
    actual = json.loads(response)['data']
    print(f"Input {index}: {'MUTED' if actual else 'UNMUTED'}")

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    index = sys.argv[1]
    action = sys.argv[2].lower()

    if not index.isdigit() or int(index) not in range(10):
        print("Index must be 0-9")
        sys.exit(1)

    if action not in ('mute', 'unmute', 'toggle', 'status'):
        print("Action must be: mute | unmute | toggle | status")
        sys.exit(1)

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(5)
        try:
            s.connect((HOST, PORT))
        except ConnectionRefusedError:
            print("Could not connect — is Console running?")
            sys.exit(1)

        if action == 'status':
            state = get_mute_state(s, index)
            print(f"Input {index}: {'MUTED' if state else 'UNMUTED'}")
        elif action == 'mute':
            set_mute(s, index, True)
        elif action == 'unmute':
            set_mute(s, index, False)
        elif action == 'toggle':
            current = get_mute_state(s, index)
            set_mute(s, index, not current)

if __name__ == '__main__':
    main()
