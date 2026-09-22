let photographerList = [];
let photographer = null;
const slug = document.body.dataset.photographer || new URLSearchParams(window.location.search).get('tho') || 'cat';

function setText(selector, value, fallback = '') {
  document.querySelectorAll(selector).forEach(el => { el.textContent = value || fallback; });
}

function photographerImagePath(slugValue, filename) {
  if (!filename) return '';
  return /^https?:\/\//i.test(String(filename || '')) ? filename : '';
}

function renderGallery(items) {
  const gallery = document.querySelector('[data-profile="photos"]');
  if (!gallery || !photographer) return;
  const photos = items && items.length ? items : [1, 2, 3, 4].map((_, i) => `${photographer.name.toUpperCase()} · PHOTO 0${i + 1}`);
  gallery.innerHTML = photos.map(photo => {
    const src = photographerImagePath(photographer.slug, photo);
    const isImage = typeof photo === 'string' && /\.(jpe?g|png|webp|gif|avif)$/i.test(photo);
    return isImage
      ? `<div class="gallery-item"><img src="${src}" alt="Ảnh của ${photographer.name}" loading="lazy"></div>`
      : `<div class="gallery-item"><div class="gallery-placeholder">${photo}</div></div>`;
  }).join('');
}

function renderProfileVisuals() {
  const cover = document.querySelector('[data-profile="cover"]');
  const avatar = document.querySelector('[data-profile="avatar"]');
  if (!photographer) return;
  const coverSrc = photographerImagePath(photographer.slug, photographer.cover);
  const avatarSrc = photographerImagePath(photographer.slug, photographer.avatar);
  if (cover) {
    cover.style.backgroundImage = coverSrc ? `url("${coverSrc}")` : '';
    cover.classList.toggle('has-image', !!coverSrc);
  }
  if (avatar) {
    if (avatarSrc) {
      avatar.src = avatarSrc;
      avatar.alt = `Ảnh đại diện của ${photographer.name}`;
      avatar.classList.add('has-image');
      avatar.onerror = () => { avatar.classList.remove('has-image'); avatar.removeAttribute('src'); };
    } else {
      avatar.classList.remove('has-image');
      avatar.removeAttribute('src');
    }
  }
}

function renderServices() {
  const container = document.querySelector('[data-profile="services"]');
  if (!container || !photographer) return;
  const services = Array.isArray(photographer.services) ? photographer.services : [];
  if (!services.length) { container.innerHTML = ''; return; }
  container.innerHTML = `<h2 class="services-title">Dịch vụ đi kèm</h2><div class="services-list">${services.map(item => `<div class="service-row"><span class="service-name">${item.name}</span><span class="service-value">${item.value}</span></div>`).join('')}</div>`;
}

function renderAlbum() {
  const album = document.querySelector('[data-profile="album"]');
  if (!album || !photographer) return;
  if (photographer.albumUrl) {
    album.href = photographer.albumUrl;
    album.target = '_blank';
    album.rel = 'noopener noreferrer';
    album.onclick = null;
    album.textContent = `Xem album đầy đủ của ${photographer.name} trên Google Drive ↗`;
  } else {
    album.href = '#';
    album.onclick = () => { alert(`Chưa có link album của ${photographer.name}.`); return false; };
    album.textContent = `Xem album đầy đủ của ${photographer.name} ↗`;
  }
}

function renderProfile(data) {
  photographerList = Array.isArray(data) ? data : [];
  photographer = photographerList.find(p => p.slug === slug);
  if (!photographer) {
    document.querySelector('main').innerHTML = '<div class="container"><p>Không tìm thấy photographer.</p></div>';
    return;
  }
  document.title = `${photographer.name} — thợ chụp ${photographer.city} · demo studio`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = `Thông tin photographer ${photographer.name} của demo studio.`;
  setText('[data-profile="name"]', photographer.name);
  setText('[data-profile="level"]', photographer.level);
  setText('[data-profile="meta"]', `${photographer.city} · ★ ${photographer.rating}${photographer.shoots ? ` · ${photographer.shoots} buổi đã chụp` : ''}`);
  setText('[data-profile="price"]', photographer.price);
  setText('[data-profile="style"]', photographer.style, 'Phong cách riêng của photographer sẽ được cập nhật tại đây.');
  setText('[data-profile="description"]', photographer.description, 'Thông tin chi tiết của photographer sẽ được cập nhật.');
  setText('[data-profile="breadcrumb"]', photographer.name);
  document.querySelectorAll('[data-profile="tags"]').forEach(el => { el.innerHTML = (photographer.tags || []).map(t => `<span class="tag">${t}</span>`).join(''); });
  renderProfileVisuals();
  renderGallery(photographer.gallery);
  renderServices();
  renderAlbum();
  const bookingUrl = `../lien-he.html?tho=${encodeURIComponent(photographer.slug)}`;
  document.querySelectorAll('[data-profile="booking"]').forEach(el => { el.href = bookingUrl; });
}

if (window.DEMO_DATA?.ready) {
  window.DEMO_DATA.ready.then(({ photographers: data }) => renderProfile(data));
}
window.addEventListener('demo:data-updated', event => renderProfile(event.detail.photographers));
