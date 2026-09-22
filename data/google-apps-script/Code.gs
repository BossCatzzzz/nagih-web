/**
 * NAGIH GRAPHY — Google Sheets → JSON API
 *
 * Spreadsheet structure:
 * Sheet name: Photographers
 * Row 1: headers
 * Row 2+: photographer data
 *
 * Deploy as: Web app
 * Execute as: Me
 * Who has access: Anyone
 */

const SHEET_NAME = 'Photographers';

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ error: `Không tìm thấy sheet: ${SHEET_NAME}` }, 500);
    }

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      return jsonResponse({ photographers: [] });
    }

    const headers = values[0].map(normalizeHeader);
    const photographers = values.slice(1)
      .filter(row => row.some(value => String(value).trim() !== ''))
      .map(row => rowToPhotographer(headers, row))
      .filter(p => p.slug && p.name);

    return jsonResponse({
      version: 1,
      source: 'google-sheets',
      photographers
    });
  } catch (error) {
    return jsonResponse({ error: String(error.message || error) }, 500);
  }
}

function normalizeHeader(value) {
  return String(value).trim();
}

function rowToPhotographer(headers, row) {
  const raw = {};
  headers.forEach((header, index) => raw[header] = row[index]);

  return {
    slug: text(raw.slug),
    name: text(raw.name),
    level: text(raw.level),
    rating: number(raw.rating),
    shoots: integer(raw.shoots),
    city: text(raw.city),
    price: number(raw.price),

    featured: boolean(raw.featured),
    active: boolean(raw.active),
    profile: booleanWithDefault(raw.profile, true),
    placeholder: boolean(raw.placeholder),

    categories: splitList(raw.categories),
    style: text(raw.style),
    description: text(raw.description),
    tags: splitList(raw.tags),

    avatar: text(raw.avatar),
    cover: text(raw.cover),
    gallery: splitList(raw.gallery),
    albumUrl: text(raw.albumUrl),
    zalo: text(raw.zalo),
    facebook: text(raw.facebook),
    instagram: text(raw.instagram),

    services: parseServices(raw.services)
  };
}

function text(value) {
  return value == null ? '' : String(value).trim();
}

function number(value) {
  if (typeof value === 'number') return value;
  const cleaned = text(value).replace(/[^0-9.-]/g, '');
  const result = Number(cleaned);
  return Number.isFinite(result) ? result : 0;
}

function integer(value) {
  return Math.round(number(value));
}

function boolean(value) {
  if (typeof value === 'boolean') return value;
  return ['TRUE', 'true', '1', 'YES', 'yes'].includes(text(value));
}

function booleanWithDefault(value, defaultValue) {
  const valueText = text(value);
  if (!valueText) return defaultValue;
  return boolean(value);
}

function splitList(value) {
  const valueText = text(value);
  if (!valueText) return [];
  return valueText
    .split('|')
    .map(item => item.trim())
    .filter(Boolean);
}

function parseServices(value) {
  const valueText = text(value);
  if (!valueText) return [];

  // Preferred format: JSON, e.g.
  // [{"name":"Đèn","value":"Có sẵn trong gói"}]
  try {
    const parsed = JSON.parse(valueText);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    // Fall through to simple name:value pairs.
  }

  // Optional simple format:
  // Đèn:Có sẵn trong gói|Trợ lý:Không có
  return valueText.split('|').map(item => {
    const [name, ...rest] = item.split(':');
    return {
      name: (name || '').trim(),
      value: rest.join(':').trim()
    };
  }).filter(item => item.name);
}

function jsonResponse(payload, statusCode) {
  // Apps Script ContentService does not expose a configurable HTTP status.
  // The payload still carries an error field for the client to inspect.
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
