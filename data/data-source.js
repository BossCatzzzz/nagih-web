/*
 * NAGIH data source — hybrid production flow.
 *
 * Fast path:
 *   data/latest.json -> render immediately
 *
 * Freshness path (background):
 *   Google Sheets Apps Script API -> compare -> update UI if changed
 *
 * The browser never waits for Google Sheets before rendering the snapshot.
 * The Apps Script Web App URL is public (read-only endpoint), so it may be
 * configured here. Do NOT put private credentials in this file.
 */
(function () {
  // Paste the SAME public Apps Script /exec URL used by GitHub Actions.
  // Example: https://script.google.com/macros/s/XXXXXXXX/exec
  const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzrsEcjNERb_s7jj1XLGZDXPA7COSaWBXDCSwxG7TABxRtNo6nE3JPk_jqyYpqbsCn_/exec';

  const localPhotographers = (typeof photographers !== 'undefined' && Array.isArray(photographers))
    ? photographers
    : [];

  function normalizePhotographer(p) {
    if (!p || typeof p !== 'object') return null;
    return {
      ...p,
      rating: Number(p.rating) || 0,
      shoots: Number(p.shoots) || 0,
      price: p.price == null ? '' : String(p.price),
      featured: p.featured === true || String(p.featured).toUpperCase() === 'TRUE',
      active: !(p.active === false || String(p.active).toUpperCase() === 'FALSE'),
      profile: !(p.profile === false || String(p.profile).toUpperCase() === 'FALSE'),
      placeholder: p.placeholder === true || String(p.placeholder).toUpperCase() === 'TRUE',
      categories: Array.isArray(p.categories) ? p.categories : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      services: Array.isArray(p.services) ? p.services : []
    };
  }

  function normalizeList(list) {
    return Array.isArray(list)
      ? list.map(normalizePhotographer).filter(Boolean)
      : [];
  }

  function latestDataUrl() {
    const script = document.currentScript;
    return script ? new URL('latest.json', script.src).href : './data/latest.json';
  }

  async function loadStaticSnapshot() {
    const response = await fetch(latestDataUrl(), {
      method: 'GET',
      cache: 'no-cache'
    });
    if (!response.ok) throw new Error(`latest.json HTTP ${response.status}`);

    const data = await response.json();
    if (!data || !Array.isArray(data.photographers)) {
      throw new Error('latest.json không chứa photographers[] hợp lệ.');
    }

    return normalizeList(data.photographers);
  }

  async function loadGoogleSheets() {
    if (!GOOGLE_SHEETS_API_URL.trim()) {
      throw new Error('GOOGLE_SHEETS_API_URL chưa được cấu hình trong data-source.js');
    }

    const separator = GOOGLE_SHEETS_API_URL.includes('?') ? '&' : '?';
    const response = await fetch(`${GOOGLE_SHEETS_API_URL}${separator}_=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`Google Sheets API HTTP ${response.status}`);

    const data = await response.json();
    if (!data || !Array.isArray(data.photographers)) {
      throw new Error('Google Sheets API không trả photographers[] hợp lệ.');
    }

    return normalizeList(data.photographers);
  }

  function dataFingerprint(list) {
    return JSON.stringify(list);
  }

  const snapshotReady = loadStaticSnapshot()
    .then(snapshot => ({
      source: 'static-json',
      photographers: snapshot
    }))
    .catch(error => {
      console.warn('[NAGIH DATA] Không tải được latest.json, dùng photographers.js fallback:', error);
      return {
        source: 'local-fallback',
        photographers: normalizeList(localPhotographers)
      };
    });

  window.NAGIH_DATA = {
    source: 'loading',
    photographers: normalizeList(localPhotographers),
    ready: snapshotReady,
    refresh: Promise.resolve(null)
  };

  // Fast path: publish snapshot as soon as it arrives. This is what all pages
  // render first; the Google API is deliberately not awaited here.
  snapshotReady.then(({ source, photographers: snapshot }) => {
    window.NAGIH_DATA.source = source;
    window.NAGIH_DATA.photographers = snapshot;
    console.info(`[NAGIH DATA] initial=${source}, photographers=${snapshot.length}`);

    // Freshness path starts only after the initial snapshot is available.
    if (!GOOGLE_SHEETS_API_URL.trim()) {
      console.warn('[NAGIH DATA] Google Sheets API chưa được cấu hình; đang dùng latest.json.');
      return;
    }

    const before = dataFingerprint(snapshot);

    window.NAGIH_DATA.refresh = loadGoogleSheets()
      .then(fresh => {
        const after = dataFingerprint(fresh);

        if (after === before) {
          console.info('[NAGIH DATA] Google Sheets: không có thay đổi.');
          return;
        }

        window.NAGIH_DATA.source = 'google-sheets-live';
        window.NAGIH_DATA.photographers = fresh;
        console.info(`[NAGIH DATA] Google Sheets có dữ liệu mới: photographers=${fresh.length}`);

        window.dispatchEvent(new CustomEvent('nagih:data-updated', {
          detail: {
            source: 'google-sheets-live',
            photographers: fresh
          }
        }));
      })
      .catch(error => {
        console.warn('[NAGIH DATA] Google Sheets background refresh thất bại; giữ latest.json:', error);
      });
  });
})();
