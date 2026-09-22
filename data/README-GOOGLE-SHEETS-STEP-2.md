# NAGIH — Google Sheets migration / Step 2

Mục tiêu: thay nguồn dữ liệu photographer từ `photographers.js` bằng Google Sheets, nhưng giữ nguyên UI và logic website.

## File trong bước này

- `data/google-apps-script/Code.gs`: API đọc tab `Photographers` và trả JSON.
- `data/google-apps-script/appsscript.json`: cấu hình Web App.
- `data/photographers-sheet-template.csv`: header + toàn bộ dữ liệu photographer hiện tại.
- `data/data-source.js`: nơi dán URL Web App.

## Chuẩn bị Google Sheet

1. Tạo Google Spreadsheet mới.
2. Tạo tab tên chính xác `Photographers`.
3. Mở `photographers-sheet-template.csv` và copy toàn bộ dữ liệu vào tab này.
4. Giữ nguyên tên header ở dòng 1.

## Quy tắc dữ liệu

- `slug`: duy nhất, không dấu, ví dụ `cat`, `wolf`.
- `name`: tên hiển thị.
- `level`: text, ví dụ `Ekip 2, 3`.
- `rating`: số, ví dụ `5.0`.
- `shoots`: số nguyên, ví dụ `323`.
- `price`: số nguyên, ví dụ `2200000`; không nhập `2.200.000đ`.
- `featured`, `active`, `profile`, `placeholder`: `TRUE` hoặc `FALSE`. `placeholder=TRUE` dùng cho các photographer mẫu và không được tính vào thống kê thợ thực.
- `categories`: nhiều giá trị, phân cách bằng `|`, ví dụ `ekip23|group|province`.
- `tags`: nhiều giá trị, phân cách bằng `|`.
- `gallery`: nhiều tên file/URL, phân cách bằng `|`.
- `avatar`, `cover`: tên file hoặc URL.
- `services`: JSON array gồm các object `name` và `value`.

## Tạo API

1. Mở Google Apps Script từ spreadsheet hoặc tạo Apps Script project mới.
2. Chép nội dung `data/google-apps-script/Code.gs` vào editor.
3. Kiểm tra tab trong spreadsheet tên đúng `Photographers`.
4. Deploy → New deployment → Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Copy URL kết thúc bằng `/exec`.

## Kết nối website

Mở `data/data-source.js` và sửa:

`const GOOGLE_SHEETS_API_URL = '';`

thành URL `/exec` vừa nhận được.

Khi URL khác rỗng, website sẽ lấy photographer từ Google Sheets. Khi URL rỗng, website vẫn dùng dữ liệu local để tránh làm hỏng quá trình phát triển.

## Lưu ý khi test local

Nếu mở HTML trực tiếp bằng `file:///...`, trình duyệt có thể chặn request cross-origin tới Google Apps Script. Nếu gặp lỗi CORS/network, hãy chạy website qua một static server hoặc deploy lên Netlify/GitHub Pages rồi test lại. Đây không phải lỗi dữ liệu Sheet.

## API trả về

API có dạng:

`{ version: 1, source: "google-sheets", photographers: [...] }`

Website tự chuẩn hóa `rating`, `shoots`, `price`, boolean, categories, tags, gallery và services trước khi đưa vào UI.
