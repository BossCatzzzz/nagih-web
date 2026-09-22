/* =========================================================
   BẢNG GIÁ — dữ liệu từ Google Sheet / latest.json
========================================================= */
let photographers = [];
let priceTiers = [];
let travelFees = [];

function formatMoney(value) { return new Intl.NumberFormat('vi-VN').format(Number(value) || 0) + 'đ'; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

function getRealPhotographers(category) {
  return photographers.filter(p => p && p.profile && p.active !== false && !p.placeholder && Array.isArray(p.categories) && p.categories.includes(category));
}

function renderPriceCards() {
  const grid = document.getElementById('priceGrid');
  if (!grid) return;
  const tiers = priceTiers.filter(t => t.kind === 'tier');
  grid.innerHTML = tiers.map(tier => {
    const people = getRealPhotographers(tier.category);
    const count = people.length;
    const names = people.map(p => p.name).join(' · ');
    return `<article class="price-card">
      <div class="price-level">${escapeHtml(tier.level)}</div>
      <h2 class="price-card-title">${escapeHtml(tier.title)}</h2>
      <div class="price-number">${formatMoney(tier.price)}</div>
      <p class="price-card-description">${escapeHtml(tier.description)}</p>
      <div class="price-card-footer">
        <div>
          <span class="people-count"><strong>${count}</strong> ${escapeHtml(tier.peopleLabel || 'thợ')}</span>
          ${names ? `<div class="people-names">${escapeHtml(names)}</div>` : ''}
        </div>
        <a href="./tho.html?category=${encodeURIComponent(tier.category)}" class="price-link">${escapeHtml(tier.linkText || 'Xem thợ →')}</a>
      </div>
    </article>`;
  }).join('');
}

const locationSelect = document.getElementById('locationSelect');
const photographerCount = document.getElementById('photographerCount');
const resultPlace = document.getElementById('resultPlace');
const resultNote = document.getElementById('resultNote');
const resultPrice = document.getElementById('resultPrice');
const travelTableBody = document.getElementById('travelTableBody');

function renderTravelOptions() {
  if (!locationSelect) return;
  locationSelect.innerHTML = '<option value="">Chọn nơi chụp</option>' + travelFees.map(item => `<option value="${item.fee}">${escapeHtml(item.place)}</option>`).join('');
}

function renderTravelTable() {
  if (!travelTableBody) return;
  travelTableBody.innerHTML = travelFees.map(item => `<tr><td>${escapeHtml(item.place)}</td><td>${escapeHtml(item.displayFee || formatMoney(item.fee))}</td><td>${escapeHtml(item.note)}</td></tr>`).join('');
}

function renderEvening() {
  const priceEl = document.getElementById('eveningPrice');
  const textEl = document.getElementById('eveningText');
  const item = priceTiers.find(t => t.kind === 'addon' && t.category === 'evening');
  if (priceEl) priceEl.textContent = item ? `+${formatMoney(item.price)}` : '—';
  if (textEl) textEl.textContent = item?.description || '';
}

function updateTravelPrice() {
  if (!locationSelect || !photographerCount) return;
  const option = locationSelect.options[locationSelect.selectedIndex];
  const baseFee = Number(locationSelect.value);
  const people = Number(photographerCount.value) || 1;
  if (!baseFee) {
    resultPlace.textContent = 'Chọn địa điểm'; resultNote.textContent = 'Chưa chọn địa điểm'; resultPrice.textContent = '—'; return;
  }
  resultPlace.textContent = option.textContent;
  resultNote.textContent = `${formatMoney(baseFee)} / 1 thợ × ${people} thợ`;
  resultPrice.textContent = formatMoney(baseFee * people);
}

function renderAll(data) {
  photographers = data.photographers || [];
  priceTiers = data.priceTiers || [];
  travelFees = data.travelFees || [];
  renderPriceCards(); renderTravelOptions(); renderTravelTable(); renderEvening(); updateTravelPrice();
}

locationSelect?.addEventListener('change', updateTravelPrice);
photographerCount?.addEventListener('change', updateTravelPrice);

if (window.DEMO_DATA?.ready) window.DEMO_DATA.ready.then(renderAll);
window.addEventListener('demo:data-updated', event => renderAll(event.detail));
