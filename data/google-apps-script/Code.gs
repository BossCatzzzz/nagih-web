/**
 * NAGIH GRAPHY — Google Sheets → JSON API
 * Sheets: Photographers, PriceTiers, TravelFees
 */
const SHEET_NAMES = { photographers: 'Photographers', priceTiers: 'PriceTiers', travelFees: 'TravelFees' };

function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return jsonResponse({
      version: 2,
      source: 'google-sheets',
      photographers: readPhotographers(ss),
      priceTiers: readPriceTiers(ss),
      travelFees: readTravelFees(ss)
    });
  } catch (error) {
    return jsonResponse({ error: String(error.message || error) });
  }
}

function readRows(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(normalizeHeader);
  return values.slice(1).filter(row => row.some(v => String(v).trim() !== '')).map(row => {
    const raw = {}; headers.forEach((h,i) => raw[h] = row[i]); return raw;
  });
}

function readPhotographers(ss) {
  return readRows(ss, SHEET_NAMES.photographers).map(rowToPhotographer).filter(p => p.slug && p.name);
}
function readPriceTiers(ss) {
  return readRows(ss, SHEET_NAMES.priceTiers).map(rowToPriceTier).filter(p => p.title);
}
function readTravelFees(ss) {
  return readRows(ss, SHEET_NAMES.travelFees).map(rowToTravelFee).filter(p => p.place);
}

function normalizeHeader(value) { return String(value).trim(); }
function rowToPhotographer(raw) {
  return { slug:text(raw.slug), name:text(raw.name), level:text(raw.level), rating:number(raw.rating), shoots:integer(raw.shoots), city:text(raw.city), price:number(raw.price), featured:boolean(raw.featured), active:boolean(raw.active), profile:booleanWithDefault(raw.profile,true), placeholder:boolean(raw.placeholder), categories:splitList(raw.categories), style:text(raw.style), description:text(raw.description), tags:splitList(raw.tags), avatar:text(raw.avatar), cover:text(raw.cover), gallery:splitList(raw.gallery), albumUrl:text(raw.albumUrl), zalo:text(raw.zalo), facebook:text(raw.facebook), instagram:text(raw.instagram), services:parseServices(raw.services) };
}
function rowToPriceTier(raw) { return { category:text(raw.category), kind:text(raw.kind || 'tier'), level:text(raw.level), title:text(raw.title), price:number(raw.price), description:text(raw.description), peopleLabel:text(raw.peopleLabel || 'thợ'), linkText:text(raw.linkText || 'Xem thợ →'), sort:integer(raw.sort) }; }
function rowToTravelFee(raw) { return { place:text(raw.place), fee:number(raw.fee), displayFee:text(raw.displayFee || formatMoney(raw.fee)), note:text(raw.note), sort:integer(raw.sort) }; }
function text(value) { return value == null ? '' : String(value).trim(); }
function number(value) { if (typeof value === 'number') return value; const cleaned=text(value).replace(/[^0-9.-]/g,''); const result=Number(cleaned); return Number.isFinite(result)?result:0; }
function integer(value) { return Math.round(number(value)); }
function boolean(value) { if (typeof value === 'boolean') return value; return ['TRUE','true','1','YES','yes'].includes(text(value)); }
function booleanWithDefault(value, def) { const t=text(value); return t ? boolean(value) : def; }
function splitList(value) { const t=text(value); return t ? t.split('|').map(x=>x.trim()).filter(Boolean) : []; }
function parseServices(value) { const t=text(value); if(!t) return []; try { const parsed=JSON.parse(t); if(Array.isArray(parsed)) return parsed; } catch(e) {} return t.split('|').map(item=>{const [name,...rest]=item.split(':'); return {name:(name||'').trim(),value:rest.join(':').trim()};}).filter(item=>item.name); }
function formatMoney(value) { return Math.round(Number(value)||0).toLocaleString('vi-VN') + 'đ'; }
function jsonResponse(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
