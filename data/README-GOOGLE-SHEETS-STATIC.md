# NAGIH — Google Sheet → static JSON sync

This version does **not** make website visitors wait for the Google Sheets API.

Flow:

Google Sheet → Apps Script API → GitHub Actions (every 15 minutes) → `data/latest.json` → Netlify

The browser reads `data/latest.json` from Netlify. The Google API is only used by GitHub Actions.

## One-time setup

1. Keep the existing Google Apps Script Web App and `/exec` URL.
2. Put this project in a GitHub repository connected to Netlify.
3. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
4. Secret name:

   `GOOGLE_SHEETS_API_URL`

5. Secret value: your Apps Script `/exec` URL.
6. Open **Actions → Sync Google Sheet data → Run workflow** once manually.
7. Check that `data/latest.json` changes and contains the current photographer data.
8. Netlify will deploy the GitHub commit automatically if the repository is already connected to Netlify.

## Schedule

The workflow runs every 15 minutes. GitHub's scheduled workflows are not guaranteed to start at the exact minute, so treat 15 minutes as an approximate maximum sync interval, not a strict SLA.

## Important

`data/latest.json` is the production snapshot served to visitors. Do not edit it manually. Change the Google Sheet instead.

The existing `data/photographers.js` remains as a development/fallback dataset for now. The website data source prioritizes `data/latest.json`.
