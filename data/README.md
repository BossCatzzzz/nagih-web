# NAGIH data flow

## Runtime

```text
Google Sheet → Apps Script API → GitHub Actions → data/latest.json → Netlify
```

The browser uses `latest.json` for the initial render, then `data-source.js` can refresh from the public Apps Script API in the background.

## Photographer data

The Google Sheet is the source of truth. `data/photographers.js` is only a local fallback if `latest.json` cannot be loaded.

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
