#!/usr/bin/env python3
import json, os, sys, urllib.request

API_URL = os.environ.get('GOOGLE_SHEETS_API_URL', '').strip()
OUTPUT = 'data/latest.json'

if not API_URL:
    print('ERROR: GOOGLE_SHEETS_API_URL is not set.')
    sys.exit(1)

try:
    req = urllib.request.Request(API_URL, headers={'User-Agent': 'NAGIH-GoogleSheet-Sync/1.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f'HTTP {response.status}')
        payload = json.loads(response.read().decode('utf-8'))
except Exception as exc:
    print(f'ERROR: cannot fetch Google Sheets API: {exc}')
    sys.exit(1)

if not isinstance(payload, dict) or not isinstance(payload.get('photographers'), list):
    print('ERROR: API response does not contain photographers[].')
    sys.exit(1)

# Keep the API payload as the static snapshot. The website consumes this file.
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)
    f.write('\n')

print(f'Synced {len(payload["photographers"])} photographers to {OUTPUT}')
