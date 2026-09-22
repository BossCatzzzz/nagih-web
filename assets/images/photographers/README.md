# Photographer images

Mỗi photographer có một thư mục theo `slug`, ví dụ:

```text
assets/images/photographers/cat/
├── avatar.jpg
├── cover.jpg
├── gallery-01.jpg
├── gallery-02.jpg
├── gallery-03.jpg
└── gallery-04.jpg
```

## 1. Dùng ảnh trong project

Trong Google Sheet điền đúng tên file:

- `avatar` → `avatar.jpg`
- `cover` → `cover.jpg`
- `gallery` → `gallery-01.jpg|gallery-02.jpg|...`

Website tự ghép đường dẫn:

```text
assets/images/photographers/<slug>/<filename>
```

## 2. Dùng ảnh từ bên ngoài

Các trường `avatar`, `cover` và từng phần tử trong `gallery` cũng chấp nhận **URL ảnh trực tiếp**:

```text
https://example.com/cat/avatar.jpg
https://example.com/cat/cover.jpg
https://example.com/cat/gallery-01.jpg
```

Không dùng link trang xem ảnh/album như Google Drive `/file/d/.../view`; phải là URL trả trực tiếp về file ảnh hoặc một CDN ảnh.

Ví dụ `gallery` trong Sheet:

```text
https://cdn.example.com/cat/01.jpg|https://cdn.example.com/cat/02.jpg|https://cdn.example.com/cat/03.jpg
```

## 3. Quy trình thêm photographer

1. Tạo `slug` duy nhất.
2. Tạo thư mục `assets/images/photographers/<slug>/` nếu dùng ảnh local.
3. Đặt ảnh vào đó **hoặc** dùng URL ảnh trực tiếp trong Sheet.
4. Điền `avatar`, `cover`, `gallery` trong Sheet.
5. Chạy sync để `latest.json` nhận dữ liệu.
6. Website sẽ dùng cùng dữ liệu cho card, landing page và profile.

`avatar` dùng cho card; `cover` dùng cho profile; `gallery` dùng cho portfolio.
