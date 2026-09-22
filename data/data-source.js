/*
 * NAGIH data source — hybrid production flow.
 * Fast path: data/latest.json -> render immediately.
 * Freshness path: Google Sheets Apps Script API -> compare -> update UI.
 */
(function () {
  const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzrsEcjNERb_s7jj1XLGZDXPA7COSaWBXDCSwxG7TABxRtNo6nE3JPk_jqyYpqbsCn_/exec';

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
    return Array.isArray(list) ? list.map(normalizePhotographer).filter(Boolean) : [];
  }

  function normalizePriceTiers(list) {
    return Array.isArray(list) ? list.map(item => ({
      category: String(item?.category || ''),
      kind: String(item?.kind || 'tier'),
      level: String(item?.level || ''),
      title: String(item?.title || ''),
      price: Number(item?.price) || 0,
      description: String(item?.description || ''),
      peopleLabel: String(item?.peopleLabel || 'thợ'),
      linkText: String(item?.linkText || 'Xem thợ →'),
      sort: Number(item?.sort) || 999
    })).filter(item => item.title).sort((a,b) => a.sort-b.sort) : [];
  }

  function normalizeTravelFees(list) {
    return Array.isArray(list) ? list.map(item => ({
      place: String(item?.place || ''),
      fee: Number(item?.fee) || 0,
      displayFee: String(item?.displayFee || ''),
      note: String(item?.note || ''),
      sort: Number(item?.sort) || 999
    })).filter(item => item.place).sort((a,b) => a.sort-b.sort) : [];
  }

  function normalizePayload(data, fallback = {}) {
    return {
      photographers: normalizeList(data?.photographers),
      priceTiers: normalizePriceTiers(data?.priceTiers?.length ? data.priceTiers : fallback.priceTiers),
      travelFees: normalizeTravelFees(data?.travelFees?.length ? data.travelFees : fallback.travelFees)
    };
  }

  function latestDataUrl() {
    const script = document.currentScript;
    return script ? new URL('latest.json', script.src).href : './data/latest.json';
  }

  async function loadStaticSnapshot() {
    const response = await fetch(latestDataUrl(), { method: 'GET', cache: 'no-cache' });
    if (!response.ok) throw new Error(`latest.json HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.photographers)) throw new Error('latest.json không chứa photographers[] hợp lệ.');
    return normalizePayload(data);
  }

  async function loadGoogleSheets(fallback) {
    const separator = GOOGLE_SHEETS_API_URL.includes('?') ? '&' : '?';
    const response = await fetch(`${GOOGLE_SHEETS_API_URL}${separator}_=${Date.now()}`, { method: 'GET', cache: 'no-store' });
    if (!response.ok) throw new Error(`Google Sheets API HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.photographers)) throw new Error('Google Sheets API không trả photographers[] hợp lệ.');
    return normalizePayload(data, fallback);
  }

  function fingerprint(payload) { return JSON.stringify(payload); }

  const snapshotReady = loadStaticSnapshot()
    .then(snapshot => ({ source: 'static-json', ...snapshot }))
    .catch(error => {
      console.warn('[NAGIH DATA] Không tải được latest.json:', error);
      return { source: 'empty-fallback', photographers: [], priceTiers: [], travelFees: [] };
    });

  window.NAGIH_DATA = {
    source: 'loading', photographers: [], priceTiers: [], travelFees: [],
    ready: snapshotReady, refresh: Promise.resolve(null)
  };

  snapshotReady.then(snapshot => {
    window.NAGIH_DATA.source = snapshot.source;
    window.NAGIH_DATA.photographers = snapshot.photographers;
    window.NAGIH_DATA.priceTiers = snapshot.priceTiers;
    window.NAGIH_DATA.travelFees = snapshot.travelFees;
    console.info(`[NAGIH DATA] initial=${snapshot.source}, photographers=${snapshot.photographers.length}, priceTiers=${snapshot.priceTiers.length}, travelFees=${snapshot.travelFees.length}`);

    if (!GOOGLE_SHEETS_API_URL.trim()) return;
    const before = fingerprint(snapshot);
    window.NAGIH_DATA.refresh = loadGoogleSheets(snapshot).then(fresh => {
      const after = fingerprint(fresh);
      if (after === before) {
        console.info('[NAGIH DATA] Google Sheets: không có thay đổi.');
        return;
      }
      window.NAGIH_DATA.source = 'google-sheets-live';
      window.NAGIH_DATA.photographers = fresh.photographers;
      window.NAGIH_DATA.priceTiers = fresh.priceTiers;
      window.NAGIH_DATA.travelFees = fresh.travelFees;
      console.info(`[NAGIH DATA] Google Sheets có dữ liệu mới: photographers=${fresh.photographers.length}, priceTiers=${fresh.priceTiers.length}, travelFees=${fresh.travelFees.length}`);
      window.dispatchEvent(new CustomEvent('nagih:data-updated', { detail: fresh }));
    }).catch(error => {
      console.warn('[NAGIH DATA] Google Sheets background refresh thất bại; giữ latest.json:', error);
    });
  });
})();
