const featuredGrid = document.getElementById('featuredPhotographers');

function featuredImagePath(p) {
  if (!p.avatar) return '';
  if (/^(https?:\/\/|\.\.\/|\.\/|\/)/.test(p.avatar)) return p.avatar;
  return `./assets/images/photographers/${p.slug}/${p.avatar}`;
}

function featuredHref(p) {
  return p.profile ? (p.slug === 'cat' ? './tho/cat.html' : `./tho/profile.html?tho=${encodeURIComponent(p.slug)}`) : './tho.html';
}

function renderStats(photographers) {
  const active = photographers.filter(p => p && p.profile && !p.placeholder && p.active !== false);
  const totalPhotographers = active.length;
  const totalShoots = active.reduce((sum, p) => sum + (Number(p.shoots) || 0), 0);
  const prices = active
    .map(p => Number(String(p.price ?? '').replace(/\D/g, '')))
    .filter(price => price > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;

  const photographerEl = document.getElementById('stat-photographers');
  const shootsEl = document.getElementById('stat-shoots');
  const priceEl = document.getElementById('stat-price');

  if (photographerEl) photographerEl.textContent = totalPhotographers.toLocaleString('vi-VN');
  if (shootsEl) shootsEl.textContent = totalShoots.toLocaleString('vi-VN');
  if (priceEl) priceEl.textContent = minPrice ? `${minPrice.toLocaleString('vi-VN')}đ` : '—';
}

function renderFeatured(photographers) {
  if (!featuredGrid) return;
  const list = photographers.filter(p => p && p.featured === true).slice(0, 4);

  featuredGrid.innerHTML = list.map(p => {
    const src = featuredImagePath(p);
    const image = src
      ? `<img src="${src}" alt="${p.name}" loading="lazy" data-featured-image="${p.slug}"><div class="image-placeholder" hidden>${p.name.toUpperCase()}</div>`
      : `<div class="image-placeholder">${p.name.toUpperCase()}</div>`;
    return `<a href="${featuredHref(p)}" class="photographer-card">
      <div class="photographer-image">${image}</div>
      <div class="photographer-info">
        <div class="photographer-level">${p.level}</div>
        <div class="photographer-top"><div class="photographer-name">${p.name}</div><div>★ ${p.rating}</div></div>
        <div class="photographer-meta">${p.shoots ? `${p.shoots} buổi đã chụp` : ''}</div>
        <div class="photographer-tags">${(p.tags || []).slice(0,2).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="photographer-price">Từ ${p.price}</div>
        <div class="photographer-action">Nhắn để hỏi lịch →</div>
      </div>
    </a>`;
  }).join('');

  featuredGrid.querySelectorAll('img[data-featured-image]').forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      const placeholder = img.parentElement.querySelector('.image-placeholder');
      if (placeholder) placeholder.hidden = false;
    }, { once: true });
  });
}

function renderHome(photographers) {
  renderStats(photographers);
  renderFeatured(photographers);
}

if (window.NAGIH_DATA?.ready) {
  window.NAGIH_DATA.ready.then(({ photographers }) => renderHome(photographers));
}
window.addEventListener('nagih:data-updated', event => renderHome(event.detail.photographers));
