/* Demo studio shared bootstrap — v.20. */
(function () {
  const VERSION = 'v.20';
  document.documentElement.classList.add('js');
  document.documentElement.dataset.siteVersion = VERSION;
  window.DEMO_STUDIO_VERSION = VERSION;
  console.info(`%c[DEMO STUDIO] ${VERSION}`, 'font-weight:700');
  document.querySelectorAll('[data-site-version]').forEach(el => el.textContent = VERSION);
})();
