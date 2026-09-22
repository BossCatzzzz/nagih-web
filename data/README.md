# NAGIH data flow

## Runtime

```text
Google Sheet → Apps Script API → GitHub Actions → data/latest.json → Netlify
```

The browser uses `latest.json` for the initial render, then `data-source.js` can refresh from the public Apps Script API in the background.

## Photographer data

The Google Sheet is the source of truth. Runtime pages do not use a legacy hard-coded photographer dataset.

Supported photographer fields include:

- identity: `slug`, `name`, `level`, `city`
- metrics: `rating`, `shoots`, `price`
- state: `featured`, `active`, `profile`, `placeholder`
- classification: `categories`, `tags`
- profile: `style`, `description`, `services`, `albumUrl`
- images: `avatar`, `cover`, `gallery`
- contacts: `zalo`, `facebook`, `instagram`

See `assets/images/photographers/README.md` for image rules.

## Important

Do not put private API credentials in frontend files. The Apps Script `/exec` URL is public/read-only.
## V14 data architecture

Runtime pages no longer load `data/photographers.js`. The legacy hard-coded photographer dataset has been removed to prevent duplicate global declarations and conflicting data sources.

Runtime flow:
1. `latest.json` is loaded first for the fast initial render.
2. Google Sheets Apps Script API is requested in the background.
3. If the live data differs, `nagih:data-updated` refreshes the current page.

Keep the public Apps Script `/exec` URL configured in `data/data-source.js` when deploying. Do not put private credentials in client-side code.



## V15 — thêm dữ liệu bảng giá và phụ phí

Google Sheet dùng 3 tab:

1. `Photographers` — dữ liệu photographer.
2. `PriceTiers` — bảng giá + phụ phí buổi tối.
3. `TravelFees` — phụ phí đi tỉnh.

Các file `price-tiers-sheet-template.csv` và `travel-fees-sheet-template.csv` là mẫu để copy vào tab tương ứng.

Ảnh photographer: ưu tiên dùng URL `https://...` trong các ô `avatar`, `cover`, `gallery`; không dùng tên file local như `avatar.jpg`. `gallery` dùng dấu `|` để ngăn cách nhiều URL.
