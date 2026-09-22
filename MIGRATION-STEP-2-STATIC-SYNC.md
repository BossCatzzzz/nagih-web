# NAGIH — STEP 3: Static data sync

This version changes the visitor data path:

`Google Sheet → Apps Script → GitHub Actions → data/latest.json → Netlify → visitor`

The browser no longer waits for the Google Sheets API.

## Before testing

The bundled `data/latest.json` is only an initial snapshot copied from the local photographer data. It is **not** the production source of truth.

After putting the project in GitHub:

1. Connect the repository to Netlify.
2. In GitHub → Settings → Secrets and variables → Actions, create:
   - Name: `GOOGLE_SHEETS_API_URL`
   - Value: the same Apps Script `/exec` URL that already returned valid JSON in the previous step.
3. GitHub → Actions → `Sync Google Sheet data` → `Run workflow`.
4. Open the workflow run and confirm it says `Synced N photographers to data/latest.json`.
5. Confirm the GitHub repository shows a changed `data/latest.json`.
6. Wait for Netlify to finish the resulting deploy.
7. Open the live Netlify site and check that the data comes from the current Sheet.

## Test

Change one harmless value in Google Sheet, e.g. Cat's `shoots`.

Then manually run the workflow once instead of waiting 15 minutes.

Expected:

`Sheet value changed → workflow runs → latest.json changes → Netlify deploys → website shows new value.`

Once this works, we can enable/keep the 15-minute schedule and remove remaining hard-coded data gradually.
