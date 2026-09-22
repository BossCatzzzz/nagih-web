/* =========================================================
   LIÊN HỆ / ĐẶT LỊCH
   Uses the same central data source as the rest of the site.
   The initial snapshot renders first; a live API refresh can
   repopulate the photographer list without reloading the page.
========================================================= */

const photographer = document.getElementById('photographer');
const shootDate = document.getElementById('shootDate');
const province = document.getElementById('province');
const specificLocation = document.getElementById('specificLocation');
const concept = document.getElementById('concept');
const customerName = document.getElementById('customerName');
const phone = document.getElementById('phone');
const website = document.getElementById('website');
const evening = document.getElementById('evening');
const messageBox = document.getElementById('messageBox');
const copyButton = document.getElementById('copyButton');
let photographers = [];
let duration = 'Cả ngày';
let people = 1;

function populatePhotographerOptions(data) {
  if (!photographer) return;
  photographers = data || [];
  const selectedSlug = new URLSearchParams(window.location.search).get('tho')?.trim().toLowerCase() || '';
  const currentValue = photographer.value;
  const options = photographers.filter(p => p && p.profile).map(p => `<option value="${p.slug}">${p.name}</option>`).join('');
  photographer.innerHTML = `<option value="">Nhờ studio gợi ý</option>${options}`;
  const desired = selectedSlug || currentValue;
  if (desired && photographers.some(p => p.profile && p.slug.toLowerCase() === desired.toLowerCase())) {
    photographer.value = desired.toLowerCase();
  }
}

function formatDate(value) {
  if (!value) return 'chưa chốt';
  return new Date(value + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getPeopleText() { return people === 1 ? '1 người (gói lẻ)' : `${people} người (gói nhóm)`; }

function buildMessage() {
  const photographerValue = photographer.value || 'nhờ studio gợi ý';
  const dateValue = formatDate(shootDate.value);
  const provinceValue = province.value || 'chưa chọn';
  const locationValue = specificLocation.value.trim() || 'chưa chọn';
  const conceptValue = concept.value.trim();
  const nameValue = customerName.value.trim();
  const phoneValue = phone.value.trim();
  const websiteValue = website.value.trim();
  return `Chào demo studio, mình muốn đặt lịch chụp.\n\n- Thợ: ${photographerValue}\n- Chụp: ${duration}\n- Số người chụp: ${getPeopleText()}\n- Ngày chụp dự kiến: ${dateValue}\n- Tỉnh / thành: ${provinceValue}\n- Địa điểm: ${locationValue}\n- Chụp tối đến 20h: ${evening.checked ? 'Có' : 'Không'}\n- Concept mong muốn: ${conceptValue || 'chưa có'}\n\n- Tên: ${nameValue || 'chưa cung cấp'}\n- Số điện thoại: ${phoneValue || 'chưa cung cấp'}\n- Website: ${websiteValue || 'không có'}`;
}

function updateMessage() { if (messageBox) messageBox.textContent = buildMessage(); }

document.querySelectorAll('.segment').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.segment').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    duration = button.dataset.duration;
    updateMessage();
  });
});

document.querySelectorAll('.people-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.people-button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    people = Number(button.dataset.people);
    updateMessage();
  });
});

[photographer, shootDate, province, specificLocation, concept, customerName, phone, website, evening].forEach(element => {
  if (!element) return;
  element.addEventListener('input', updateMessage);
  element.addEventListener('change', updateMessage);
});

copyButton?.addEventListener('click', async () => {
  const message = buildMessage();
  try {
    await navigator.clipboard.writeText(message);
    copyButton.textContent = 'Đã sao chép ✓';
    copyButton.classList.add('copied');
    setTimeout(() => { copyButton.textContent = 'Sao chép'; copyButton.classList.remove('copied'); }, 1800);
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    copyButton.textContent = 'Đã sao chép ✓';
    setTimeout(() => { copyButton.textContent = 'Sao chép'; }, 1800);
  }
});

if (window.DEMO_DATA?.ready) {
  window.DEMO_DATA.ready.then(({ photographers: data }) => {
    populatePhotographerOptions(data);
    updateMessage();
  });
}
window.addEventListener('demo:data-updated', event => {
  populatePhotographerOptions(event.detail.photographers);
  updateMessage();
});
