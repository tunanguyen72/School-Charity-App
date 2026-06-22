# 🎒 Cùng em đến trường (School-Charity-App)

Nền tảng quyên góp giáo dục **minh bạch** — quản lý dòng tiền và đồ vật từ thiện cho hành trình đưa trẻ em vùng khó đến trường. Đồ án tốt nghiệp.

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 (giao diện mobile-first)
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** SQLite (một file, không cần cài server)
- **Xác thực:** JWT + phân quyền 3 vai trò (Nhà hảo tâm / Tình nguyện viên / Admin)

> 💡 Thanh toán dùng **luồng QR giả lập** (không kết nối ngân hàng thật) — phù hợp môi trường đồ án.

---

## 📁 Cấu trúc dự án

```
School-Charity-App/
├── app/         # Frontend — React + Vite (chạy ở cổng 5173)
├── server/      # Backend  — Express + Prisma + SQLite (chạy ở cổng 4000)
│   └── prisma/  # schema.prisma, migrations, seed.ts
├── docs/        # Tài liệu — thiết kế cơ sở dữ liệu
├── prototype/   # Bản mẫu HTML tĩnh ban đầu (tham khảo)
└── README.md
```

---

## ⚙️ Yêu cầu môi trường

- **Node.js ≥ 18** (khuyến nghị 20+). Kiểm tra: `node --version`
- npm (đi kèm Node)

---

## 🚀 Cài đặt & chạy

Cần **2 cửa sổ terminal**: một cho backend, một cho frontend.

### 1) Backend (API + Database)

```bash
cd server
npm install              # cài thư viện
npm run migrate          # tạo database SQLite + sinh Prisma Client
npm run seed             # nạp dữ liệu mẫu (3 tài khoản, chiến dịch, giao dịch...)
npm run dev              # chạy API tại http://localhost:4000
```

> Nếu `npm run migrate` hỏi tên migration, gõ: `init`.
> Muốn xem dữ liệu trực quan: `npm run studio` (mở Prisma Studio).

### 2) Frontend (Web app)

Mở terminal thứ hai:

```bash
cd app
npm install
npm run dev              # chạy web tại http://localhost:5173
```

Mở trình duyệt vào **http://localhost:5173**.

> ⚠️ Phải chạy **cả hai** server. Nếu chỉ chạy frontend, các lời gọi API sẽ lỗi.

---

## 👤 Tài khoản demo

Mật khẩu chung: **`123456`** (hoặc dùng 3 nút "Đăng nhập nhanh" ngay trên màn đăng nhập).

| Vai trò | Email | Quyền |
|---------|-------|-------|
| Nhà hảo tâm | `huong@example.com` | Xem chiến dịch, quyên góp, xem lịch sử |
| Tình nguyện viên | `khai@example.com` | + Nhận / phân phối hiện vật |
| Admin | `lan@example.com` | + Giải ngân, duyệt chi phí, xác minh chứng từ |

---

## 🔄 Luồng quyên góp (QR giả lập)

1. Chọn chiến dịch → **Quyên góp** → chọn số tiền.
2. App hiện **mã QR giả lập**.
3. Bấm *"Mô phỏng: Quét QR"* → mở **trang thanh toán giả lập**.
4. Bấm *"Xác nhận đã chuyển khoản"* → backend ghi nhận → app báo **thành công** và quỹ chiến dịch tự tăng.

---

## 🧰 Lệnh hữu ích

| Lệnh (trong `server/`) | Tác dụng |
|------------------------|----------|
| `npm run dev` | Chạy API (tự reload khi sửa code) |
| `npm run migrate` | Tạo/cập nhật database theo schema |
| `npm run seed` | Reset dữ liệu mẫu về trạng thái gốc |
| `npm run studio` | Mở giao diện xem/sửa database |

| Lệnh (trong `app/`) | Tác dụng |
|---------------------|----------|
| `npm run dev` | Chạy web (dev) |
| `npm run build` | Build production |
| `npm run preview` | Xem bản build |

---

## 🗄️ Cơ sở dữ liệu

Thiết kế chi tiết 11 bảng xem tại [`docs/database-schema.md`](docs/database-schema.md).
Nguyên tắc: tiền & hiện vật tách biệt, không xóa cứng giao dịch (có `audit_logs`),
khoản chi phải có chứng từ mới được xác minh.
