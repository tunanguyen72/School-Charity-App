# Thiết kế Cơ sở dữ liệu — "Cùng em đến trường"

> Bản nháp để **AnhNT duyệt** trước khi triển khai backend.
> Dựa trên PRD (§6 Yêu cầu chức năng, §8 Mô hình dữ liệu) và các quyết định đã chốt.
> DDL viết theo **PostgreSQL** (đề xuất); có ghi chú khác biệt nếu dùng SQLite.

## Nguyên tắc thiết kế (bám PRD)

1. **Tiền & hiện vật tách biệt** (Quyết định #11): tiền nằm ở `donations`/`expenses` (kiểu `BIGINT`, đơn vị **đồng** — VND không có phần thập phân); hiện vật nằm ở `inkind_batches`/`distributions` (đếm theo số lượng + đơn vị). Không quy đổi gộp.
2. **Minh bạch & không xóa cứng** (NFR-Trust): không `DELETE` bản ghi giao dịch/chi phí — chỉ chuyển trạng thái `voided` và ghi vết vào `audit_logs`. Mọi khoản chi phải có chứng từ (`media_assets`) mới được `verified`.
3. **Beneficiary = điểm trường** (Quyết định #12): bảng `beneficiaries` ở mức điểm trường, không tới từng học sinh.
4. **Phân quyền 3 vai trò** ngay trên `users.role`.
5. **"Sổ quỹ / Giao dịch"** trong app là **VIEW hợp nhất** từ `donations` + `expenses` + `inkind_batches`, không phải bảng riêng (tránh trùng dữ liệu).
6. **Ảnh dùng chung** qua `media_assets` (đa hình — gắn vào nhiều loại thực thể) thay vì rải cột ảnh khắp nơi.

---

## Bảng dữ liệu

### 1. `users` — tài khoản & phân quyền
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| full_name | VARCHAR(120) | |
| email | VARCHAR(160) UNIQUE | đăng nhập |
| phone | VARCHAR(20) | |
| password_hash | VARCHAR(255) | NULL nếu đăng nhập Google/FB |
| oauth_provider | VARCHAR(20) | 'google' \| 'facebook' \| NULL |
| role | user_role | 'donor' \| 'tnv' \| 'admin' (mặc định 'donor') |
| avatar_url | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### 2. `beneficiaries` — điểm trường thụ hưởng
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| name | VARCHAR(160) | "Điểm trường Bản Mo" |
| province | VARCHAR(80) | "Hà Giang" |
| location | VARCHAR(200) | xã/huyện |
| description | TEXT | |
| created_at | TIMESTAMPTZ | |

### 3. `campaigns` — chiến dịch
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| title | VARCHAR(200) | |
| slug | VARCHAR(200) UNIQUE | dùng cho URL |
| location | VARCHAR(200) | |
| status | campaign_status | 'urgent' \| 'active' \| 'done' |
| story | TEXT | câu chuyện |
| goal_amount | BIGINT | mục tiêu tiền (đồng) |
| raised_amount | BIGINT | tiền đã nhận — cộng dồn (cache) |
| donor_count | INT | số nhà hảo tâm — cache |
| inkind_received | INT | tổng hiện vật đã nhận — cache |
| inkind_given | INT | tổng hiện vật đã trao — cache |
| start_date | DATE | |
| end_date | DATE | tính "ngày còn lại" |
| banner_emoji | VARCHAR(8) | (tạm thời thay ảnh banner) |
| is_verified | BOOLEAN | badge "Đã xác thực" |
| created_by | BIGINT FK→users | admin tạo |
| created_at / updated_at | TIMESTAMPTZ | |

> Các cột `*_amount`, `*_count`, `inkind_*` là **giá trị cache** để dashboard nhanh; được cập nhật bằng trigger hoặc tại tầng service khi có giao dịch mới. Nguồn sự thật vẫn là các bảng giao dịch.

### 4. `campaign_milestones` — lộ trình triển khai
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| campaign_id | BIGINT FK→campaigns | ON DELETE CASCADE |
| label | VARCHAR(160) | "Khai mạc gây quỹ" |
| date_label | VARCHAR(40) | "06/2024" |
| description | TEXT | |
| state | milestone_state | 'done' \| 'now' \| 'todo' |
| order_index | INT | thứ tự hiển thị |

### 5. `donations` — quyên góp tiền (luồng QR giả lập)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| txn_code | VARCHAR(24) UNIQUE | "CE-1455126" — mã in trên QR |
| campaign_id | BIGINT FK→campaigns | |
| donor_id | BIGINT FK→users | người góp |
| amount | BIGINT | số tiền (đồng) |
| message | TEXT | lời nhắn |
| is_anonymous | BOOLEAN | công khai/ẩn danh |
| payment_method | VARCHAR(20) | 'qr_fake' (MVP) |
| status | donation_status | 'pending' → 'success' (sau khi trang giả lập xác nhận) \| 'failed' |
| created_at | TIMESTAMPTZ | lúc tạo QR |
| confirmed_at | TIMESTAMPTZ | lúc trang thanh toán xác nhận |

### 6. `inkind_batches` — lô hiện vật nhận vào kho
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| name | VARCHAR(160) | "Sách giáo khoa" |
| category | inkind_category | 'book' \| 'clothing' \| 'supplies' \| 'other' |
| donor_name | VARCHAR(160) | người tặng (tự do — vd "Công ty TechCloud") |
| donor_id | BIGINT FK→users NULL | nếu là người dùng trong hệ thống |
| campaign_id | BIGINT FK→campaigns | |
| unit | VARCHAR(20) | 'bộ' \| 'cái' \| 'kg' |
| quantity_total | INT | số lượng nhận |
| quantity_remaining | INT | tồn kho (giảm dần khi phân phối) |
| condition | inkind_condition | 'new' \| 'used_good' |
| estimated_value | BIGINT NULL | giá trị ước tính — chỉ tham khảo nội bộ |
| status | inkind_status | 'stored' \| 'partial' \| 'given' |
| received_by | BIGINT FK→users | TNV ghi nhận |
| received_at | TIMESTAMPTZ | |

### 7. `distributions` — lần phân phối hiện vật cho điểm trường
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| batch_id | BIGINT FK→inkind_batches | lô nguồn |
| beneficiary_id | BIGINT FK→beneficiaries | điểm trường nhận |
| quantity | INT | số lượng trao |
| note | TEXT | |
| distributed_by | BIGINT FK→users | TNV thực hiện |
| distributed_at | TIMESTAMPTZ | |

### 8. `expenses` — giải ngân (admin) & chi phí thực địa (TNV)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| campaign_id | BIGINT FK→campaigns | |
| title | VARCHAR(200) | "Mua vật liệu xây móng" |
| amount | BIGINT | số tiền chi (đồng, > 0) |
| type | expense_type | 'disbursement' (admin) \| 'field_expense' (TNV) |
| status | expense_status | 'pending' → 'verified' \| 'rejected' \| 'voided' |
| submitted_by | BIGINT FK→users | TNV hoặc admin |
| approved_by | BIGINT FK→users NULL | admin duyệt |
| spent_at | DATE | |
| created_at / approved_at | TIMESTAMPTZ | |

> **Quy tắc minh bạch:** một `expense` chỉ được chuyển `verified` khi đã có ≥1 `media_assets` kiểu `receipt` (chứng từ). Không xóa — chỉ `voided` kèm bản ghi `audit_logs`.

### 9. `media_assets` — ảnh chứng từ / ảnh thực tế (đa hình)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| url | TEXT | đường dẫn ảnh |
| kind | media_kind | 'receipt' \| 'field_photo' \| 'item_photo' \| 'distribution_photo' |
| owner_type | media_owner | 'donation' \| 'expense' \| 'inkind_batch' \| 'distribution' \| 'campaign' |
| owner_id | BIGINT | id của thực thể tương ứng |
| uploaded_by | BIGINT FK→users | |
| created_at | TIMESTAMPTZ | |

> Liên kết đa hình (`owner_type` + `owner_id`). Index `(owner_type, owner_id)` để truy ảnh nhanh. Ảnh phân phối tự lên mục "Hình ảnh thực tế" của chiến dịch (FR9).

### 10. `notifications` — thông báo
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| user_id | BIGINT FK→users | người nhận |
| type | notif_type | 'donation_success' \| 'campaign_update' \| 'txn_verified' \| 'report' \| 'system' |
| title | VARCHAR(200) | |
| body | TEXT | |
| is_read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | |

### 11. `audit_logs` — nhật ký kiểm toán (NFR-Trust)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | BIGSERIAL PK | |
| actor_id | BIGINT FK→users | ai thực hiện |
| action | VARCHAR(20) | 'create' \| 'update' \| 'verify' \| 'void' \| 'reject' |
| entity_type | VARCHAR(40) | bảng bị tác động |
| entity_id | BIGINT | |
| changes | JSONB | trước/sau (SQLite: TEXT chứa JSON) |
| reason | TEXT | lý do (vd lý do thu hồi) |
| created_at | TIMESTAMPTZ | |

---

## Quan hệ chính (cardinality)

```
users (admin)   1───*  campaigns
campaigns       1───*  campaign_milestones
campaigns       1───*  donations          *───1  users (donor)
campaigns       1───*  inkind_batches      *───1  users (TNV, received_by)
inkind_batches  1───*  distributions       *───1  beneficiaries
campaigns       1───*  expenses            *───1  users (submitted_by / approved_by)
media_assets    *───1  (donation|expense|inkind_batch|distribution|campaign)   ← đa hình
users           1───*  notifications
users           1───*  audit_logs
```

## VIEW "Sổ quỹ" (gợi ý) — hợp nhất cho màn Giao dịch
```sql
CREATE VIEW ledger AS
  SELECT 'donation' AS kind, txn_code AS code, campaign_id, amount,        status::text, confirmed_at AS at FROM donations
  UNION ALL
  SELECT 'expense',          'EXP-'||id,        campaign_id, -amount,      status::text, approved_at        FROM expenses
  UNION ALL
  SELECT 'inkind',           'IK-'||id,         campaign_id, 0,            status::text, received_at        FROM inkind_batches;
```

## Enum (PostgreSQL)
```sql
CREATE TYPE user_role        AS ENUM ('donor','tnv','admin');
CREATE TYPE campaign_status  AS ENUM ('urgent','active','done');
CREATE TYPE milestone_state  AS ENUM ('done','now','todo');
CREATE TYPE donation_status  AS ENUM ('pending','success','failed');
CREATE TYPE inkind_category  AS ENUM ('book','clothing','supplies','other');
CREATE TYPE inkind_condition AS ENUM ('new','used_good');
CREATE TYPE inkind_status    AS ENUM ('stored','partial','given');
CREATE TYPE expense_type     AS ENUM ('disbursement','field_expense');
CREATE TYPE expense_status   AS ENUM ('pending','verified','rejected','voided');
CREATE TYPE media_kind       AS ENUM ('receipt','field_photo','item_photo','distribution_photo');
CREATE TYPE media_owner      AS ENUM ('donation','expense','inkind_batch','distribution','campaign');
CREATE TYPE notif_type       AS ENUM ('donation_success','campaign_update','txn_verified','report','system');
```
> **SQLite:** không có ENUM/JSONB → dùng `TEXT` + `CHECK(... IN (...))` và `TEXT` cho JSON; `BIGSERIAL` → `INTEGER PRIMARY KEY AUTOINCREMENT`; `TIMESTAMPTZ` → `TEXT` (ISO 8601).
