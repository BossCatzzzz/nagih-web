# Google Sheets migration — Step 1

## Current status

This step introduces a **data-source adapter** without changing the visible data source yet.
The website still reads `data/photographers.js`, but page scripts now consume data through `data/data-source.js`.

## Why this step exists

The next migration step can replace only `data/data-source.js` with a Google Apps Script JSON fetch.
The page UI should not need to know whether data came from a local JS file or Google Sheets.

## Test before continuing

1. Open the website locally.
2. Check the homepage featured photographers.
3. Check homepage statistics.
4. Check photographer filtering/search.
5. Open a photographer profile.
6. From a profile, click booking and confirm the photographer is selected.
7. Check the pricing page counts.

If all seven behave exactly as before, Step 1 is complete.

## Important

Google Sheets is **not connected yet** in this step. Do not edit or delete `photographers.js` yet.


## CSV field rules (Step 1 correction)

- `price`: store as a number only, e.g. `2200000`; the website formats it as `2.200.000đ`.
- `rating`: store as a number, e.g. `5.0`.
- `shoots`: store as an integer, e.g. `323`.
- `featured`, `active`, `profile`: store `TRUE` or `FALSE`.
- `categories`, `tags`, `gallery`: use `|` as the separator inside one cell.
- Text containing commas must be normal CSV text inside quotes; do not use a backslash to escape commas. Example: `"Ekip 2, 3"`.
- `avatar` and `cover` contain filenames or URLs; for local images use the photographer folder convention documented in `assets/images/photographers/README.md`.
