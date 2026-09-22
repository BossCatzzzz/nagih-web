# NAGIH Clone — Migration Step 1

- Homepage stats now calculate from photographer data.
- Homepage featured photographers use `featured: true` and take the first four matching records.
- A data-source adapter was added at `data/data-source.js`.
- All page scripts now read through the adapter, preparing the project for a remote JSON source.
- The current adapter still uses local `photographers.js`; Google Sheets is NOT connected yet.

Correction in v9: the local adapter now reads the top-level `photographers` data correctly. The CSV template was also corrected to use valid CSV quoting and explicit field-type rules.\n\nNext step after testing: create and deploy a Google Apps Script endpoint that returns normalized photographer JSON, then switch only the adapter to that endpoint.
