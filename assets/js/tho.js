const searchInput = document.getElementById('searchInput');
const resetButton = document.getElementById('resetButton');
const filterButtons = document.querySelectorAll('.filter-chip');
const grid = document.getElementById('photographerGrid');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');

const requestedCategory = new URLSearchParams(window.location.search).get('category');
const validCategories = new Set([...filterButtons].map(button => button.dataset.filter));
let activeFilter = validCategories.has(requestedCategory) ? requestedCategory : 'all';
let photographers = [];

function photographerHref(p) {
  return p.profile
    ? (p.slug === 'cat' ? './tho/cat.html' : `./tho/profile.html?tho=${encodeURIComponent(p.slug)}`)
    : './tho.html';
}

function photographerImagePath(p, filename) {
  if (!filename) return '';
  if (/^(https?:\/\/|\.\.\/|\.\/|\/)/.test(filename)) return filename;
  return `./assets/images/photographers/${p.slug}/${filename}`;
}

function renderCardImage(p) {
  const src = photographerImagePath(p, p.avatar);
  if (!src) return `<div class="photographer-image"><div class="image-placeholder">${p.name.toUpperCase()}</div></div>`;
  return `<div class="photographer-image">
    <img src="${src}" alt="${p.name}" loading="lazy" data-photographer-image="${p.slug}">
    <div class="image-placeholder" hidden>${p.name.toUpperCase()}</div>
  </div>`;
}

function attachImageFallbacks() {
  grid.querySelectorAll('img[data-photographer-image]').forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      const placeholder = img.parentElement.querySelector('.image-placeholder');
      if (placeholder) placeholder.hidden = false;
    }, { once: true });
  });
}

function renderPhotographers(list) {
  grid.innerHTML = list.map(p => `
    <a href="${photographerHref(p)}" class="photographer-card" data-name="${p.name.toLowerCase()}" data-category="${p.categories.join(' ')}">
      ${renderCardImage(p)}
      <div class="photographer-info">
        <div class="level">${p.level}</div>
        <div class="name-row"><div class="name">${p.name}</div><div class="rating">★ ${p.rating}</div></div>
        <div class="meta">${p.shoots ? `${p.shoots} buổi · ` : ''}${p.city}</div>
        <div class="price">Từ ${p.price}</div>
      </div>
    </a>
  `).join('');
  attachImageFallbacks();
}

function filterPhotographers() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = photographers.filter(p => {
    const matchSearch = !keyword || p.name.toLowerCase().includes(keyword);
    const matchFilter = activeFilter === 'all' || p.categories.includes(activeFilter);
    return matchSearch && matchFilter;
  });
  renderPhotographers(filtered);
  resultCount.textContent = `${filtered.length} photographer`;
  emptyState.classList.toggle('show', filtered.length === 0);
}

filterButtons.forEach(button => {
  button.classList.toggle('active', button.dataset.filter === activeFilter);
  button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    filterPhotographers();
  });
});

searchInput.addEventListener('input', filterPhotographers);
resetButton.addEventListener('click', () => {
  searchInput.value = '';
  activeFilter = 'all';
  filterButtons.forEach(button => button.classList.toggle('active', button.dataset.filter === 'all'));
  filterPhotographers();
});

if (window.NAGIH_DATA?.ready) {
  window.NAGIH_DATA.ready.then(({ photographers: data }) => {
    photographers = data;
    filterPhotographers();
  });
}
window.addEventListener('nagih:data-updated', event => {
  photographers = event.detail.photographers;
  filterPhotographers();
});
