# NAGIH — V12 Hybrid Data Loading

## Mục tiêu

Website không chờ Google Sheets API để render lần đầu.

Luồng:

1. `data/latest.json` trên Netlify/CDN được tải trước.
2. Website render ngay từ snapshot này.
3. Sau khi snapshot đã sẵn sàng, browser gọi Google Apps Script API ở background.
4. Nếu API trả dữ liệu khác snapshot, website cập nhật dữ liệu đang hiển thị mà không reload trang.
5. Nếu API lỗi/chậm, snapshot vẫn được giữ nguyên và website vẫn hoạt động.

## Cấu hình API cho browser

Mở:

`data/data-source.js`

Tìm:

```js
const GOOGLE_SHEETS_API_URL = '';
```

Dán **cùng URL `/exec`** đang dùng trong GitHub Secret `GOOGLE_SHEETS_API_URL`:

```js
const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

Đây là URL Web App đọc dữ liệu công khai, không phải secret/password. Không đặt API key hoặc thông tin bí mật vào file này.

## Cách test V12

### Test 1 — snapshot tải trước

Mở website Netlify, F12 → Network → reload.

Phải thấy `data/latest.json` trả `200`.

Website phải hiển thị dữ liệu snapshot ngay cả khi API Google Sheets chậm.

### Test 2 — API nền

Trong Google Sheet sửa một giá trị dễ nhận biết, ví dụ `shoots` của Cat.

Không cần chờ GitHub Actions.

Mở/reload website và theo dõi Console/Network.

Sau khi snapshot hiển thị, API được gọi ở background. Nếu API trả giá trị mới, giao diện phải cập nhật mà không reload trang.

Console dự kiến:

- `[NAGIH DATA] initial=static-json, photographers=N`
- Nếu không thay đổi: `[NAGIH DATA] Google Sheets: không có thay đổi.`
- Nếu có thay đổi: `[NAGIH DATA] Google Sheets có dữ liệu mới: photographers=N`

### Test 3 — API lỗi

Nếu API không truy cập được, website vẫn phải giữ dữ liệu từ `latest.json` và không được trắng trang.

## Lưu ý

GitHub Actions vẫn tiếp tục cập nhật `data/latest.json` định kỳ. Nó là snapshot dự phòng và là dữ liệu initial cho người dùng mới.
