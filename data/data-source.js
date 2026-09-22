/*
 * NAGIH data source — static production snapshot.
 *
 * Production flow:
 *   Google Sheet -> Apps Script API -> GitHub Actions -> data/latest.json -> Netlify/CDN -> visitor
 *
 * The browser does NOT call Google Sheets. GitHub Actions refreshes latest.json every 15 minutes.
 * photographers.js is kept only as a local fallback while migrating/testing.
 */
(function () {
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
      categories: Array.isArray(p.categories) ? p.categories : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      services: Array.isArray(p.services) ? p.services : []
    };
  }

  function latestDataUrl() {
    // Resolve relative to this script so the project also works under a Netlify sub-path.
    const script = document.currentScript;
    return script ? new URL('latest.json', script.src).href : './data/latest.json';
  }

  async function loadStaticSnapshot() {
    const response = await fetch(latestDataUrl(), {
      method: 'GET',
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error(`latest.json HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.photographers)) {
      throw new Error('latest.json không chứa photographers[] hợp lệ.');
    }
    return data.photographers.map(normalizePhotographer).filter(Boolean);
  }

  const ready = loadStaticSnapshot()
    .then(photographers => ({
      source: 'static-json',
      photographers
    }))
    .catch(error => {
      console.warn('[NAGIH DATA] Không tải được latest.json, dùng photographers.js fallback:', error);
      return {
        source: 'local-fallback',
        photographers: localPhotographers.map(normalizePhotographer).filter(Boolean)
      };
    });

  window.NAGIH_DATA = {
    source: 'loading',
    photographers: localPhotographers,
    ready
  };

  ready.then(({ source, photographers: data }) => {
    window.NAGIH_DATA.source = source;
    window.NAGIH_DATA.photographers = data;
    console.info(`[NAGIH DATA] source=${source}, photographers=${data.length}`);
  });
})();
