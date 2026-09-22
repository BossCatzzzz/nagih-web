# Photographer images

Mỗi photographer có một thư mục theo `slug`: `cat`, `bear`, `wolf`, ...

## Cấu trúc chuẩn

```text
assets/images/photographers/cat/
├── avatar.jpg
├── cover.jpg
├── gallery-01.jpg
├── gallery-02.jpg
├── gallery-03.jpg
└── gallery-04.jpg
```

- `avatar.jpg`: ảnh đại diện nhỏ, dùng trên card chọn thợ và card photographer nổi bật ở landing page.
- `cover.jpg`: ảnh cover/banner ở đầu trang profile.
- `gallery-01.jpg`, `gallery-02.jpg`, ...: ảnh portfolio trong profile.

Đổi photographer chỉ cần đổi tên thư mục theo `slug` và cập nhật `data/photographers.js`.

Nếu chưa có ảnh, để `avatar` hoặc `cover` rỗng trong data để giao diện dùng placeholder.


## Cat hiện tại

Cat dùng 6 file ảnh theo chuẩn:

- avatar.jpg — ảnh đại diện card photographer
- cover.jpg — ảnh cover đầu trang profile
- gallery-01.jpg ... gallery-04.jpg — 4 ảnh portfolio

Các photographer khác dùng cùng quy tắc.
