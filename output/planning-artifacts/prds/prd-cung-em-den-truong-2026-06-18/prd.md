---
title: "PRD — Cùng em đến trường"
status: final
created: 2026-06-18
updated: 2026-06-18
project: cung-em-den-truong
author: AnhNT
---

# PRD — Cùng em đến trường

> Nền tảng quyên góp giáo dục **minh bạch**: quản lý dòng tiền và đồ vật từ thiện cho hành trình đưa trẻ em vùng khó đến trường.
> **Bối cảnh:** Đồ án tốt nghiệp — phạm vi đủ thể hiện năng lực, không tích hợp ngân hàng/cổng thanh toán thật.

---

## 1. Tổng quan & Vấn đề

Người Việt sẵn lòng làm từ thiện nhưng **mất niềm tin** vì thiếu minh bạch: không biết tiền/đồ mình cho đã đi đâu, đến tay ai. Các nhóm thiện nguyện nhỏ thì quản lý thủ công (Excel, tin nhắn, ảnh rời rạc), khó tổng hợp và khó chứng minh.

**"Cùng em đến trường"** giải quyết bằng một nền tảng nơi:
- Nhà hảo tâm thấy rõ **dòng tiền và đồ vật** đến tận điểm trường, kèm chứng từ và ảnh thực tế.
- Tình nguyện viên ghi nhận hiện trường nhanh, ngay trên điện thoại.
- Ban điều hành quản lý quỹ, giải ngân có chứng từ, và xuất báo cáo công khai.

**Tuyên ngôn giá trị:** *Mỗi đồng tiền, mỗi món đồ — đều truy được dấu vết đến tận tay các em.*

---

## 2. Mục tiêu sản phẩm

| # | Mục tiêu | 
|---|----------|
| G1 | Cho nhà hảo tâm **niềm tin** qua minh bạch end-to-end (chứng từ thu – chi – trao tặng). |
| G2 | Số hóa việc **quản lý dòng tiền** của tổ chức (thu, giải ngân, đối soát). |
| G3 | Số hóa **vòng đời đồ vật từ thiện** (nhận → lưu kho → phân phối) — phần các app khác bỏ trống. |
| G4 | Trải nghiệm quyên góp **nhanh, mượt** (luồng QR giả lập trong phạm vi đồ án). |
| G5 | (Đồ án) Thể hiện đủ 3 vai trò và một kiến trúc phân quyền rõ ràng. |

---

## 3. Đối tượng người dùng & Vai trò

| Vai trò | Mô tả | Quyền chính |
|---------|-------|-------------|
| **Nhà hảo tâm (Donor)** | Người quyên góp tiền/hiện vật. Mặc định khi đăng ký. | Xem chiến dịch, quyên góp, xem minh bạch, xem lịch sử của mình |
| **Tình nguyện viên (TNV)** | Người đi thực địa, do Admin cấp quyền. | Quyền Donor + ghi nhận/phân phối hiện vật, ghi chi phí thực địa, upload ảnh |
| **Admin / Điều phối** | Ban điều hành tổ chức. | Toàn quyền: duyệt chiến dịch, giải ngân, duyệt chi phí, báo cáo, phân quyền |

*Người dùng công khai (chưa đăng nhập): chỉ xem được trang minh bạch & danh sách chiến dịch (read-only).*

---

## 4. Phạm vi (Scope)

**Trong phạm vi (MVP đồ án):**
- 3 vai trò Donor / TNV / Admin với phân quyền.
- Quản lý chiến dịch, quyên góp tiền (QR giả lập), kho hiện vật, dòng tiền & giải ngân, minh bạch & báo cáo, hồ sơ, thông báo.

**Nền tảng:** App **Android native** (Kotlin). Không làm iOS (giới hạn thiết bị). Trang "thanh toán giả lập" (FR13) là một **trang web** mở bằng trình duyệt khi quét QR; cần một **backend/API** dùng chung cho app và trang này.

**Ngoài phạm vi (Out of scope):**
- Tích hợp cổng thanh toán/ngân hàng thật (dùng QR + trang xác nhận **giả lập**).
- Tuân thủ pháp lý gây quỹ, hóa đơn thuế, KYC.
- Bản iOS.
- Đa ngôn ngữ (chỉ tiếng Việt).

---

## 5. User Journeys

### UJ-1 — Nhà hảo tâm (cô Hương, 38t, NV văn phòng)
*Động cơ: muốn cho đi nhưng sợ "tiền không đến tay tụi nhỏ".*
1. Đăng nhập (Google/email) → Trang chủ thấy chiến dịch nổi bật + badge **Đã xác thực**.
2. Vào chi tiết → đọc câu chuyện, xem **lộ trình**, tab **Chi phí** (đợt trước chi vào đâu), **ảnh thực tế** → tin tưởng.
3. Bấm **Quyên góp** → chọn 500K → lời nhắn → chọn công khai/ẩn danh.
4. App hiện **QR giả lập** (gắn mã giao dịch + số tiền).
5. Quét QR → mở **trang web "thanh toán giả lập"** báo *"Chuyển khoản thành công — 500.000đ"* → bấm xác nhận.
6. App **tự phát hiện** trạng thái → màn **Quyên góp thành công** (mã giao dịch).
7. Hồ sơ cập nhật tổng đóng góp + huy hiệu; đóng góp hiện trong danh sách nhà hảo tâm của chiến dịch.

### UJ-2 — Tình nguyện viên (anh Khải, SV tình nguyện, thực địa Hà Giang)
1. Đăng nhập (vai trò TNV do Admin cấp).
2. Nhận 100 bộ sách từ Công ty TechCloud → **Kho hiện vật → Nhận hiện vật**: tên đồ, số lượng, tình trạng, người tặng, **ảnh**, gắn chiến dịch → trạng thái *Đang lưu kho*.
3. Trao cho các em → **Phân phối**: chọn điểm trường/lớp, số lượng, **ảnh trao tặng** → trạng thái *Đã trao tặng*.
4. Ảnh tự động lên mục **Hình ảnh thực tế** của chiến dịch.
5. Ghi **chi phí thực địa** (thuê xe chở đồ) → upload hóa đơn → chờ Admin duyệt.

### UJ-3 — Admin / Điều phối (chị Lan, ban điều hành)
1. Đăng nhập admin → **Dashboard tổng quỹ** (tổng thu, đã giải ngân, số trẻ hỗ trợ).
2. **Tạo/duyệt chiến dịch**: mục tiêu tiền, câu chuyện, lộ trình, ảnh.
3. **Giải ngân**: chuyển quỹ cho hoạt động → bản ghi chi + **chứng từ** → trạng thái *Đã xác minh* (hiện ở tab Chi phí công khai).
4. **Duyệt chi phí** TNV gửi lên.
5. **Xuất báo cáo minh bạch** (PDF/biểu đồ) để công khai.
6. **Quản lý người dùng & phân quyền** (cấp quyền TNV).

---

## 6. Yêu cầu chức năng (Functional Requirements)

> FR có ID toàn cục ổn định. `[D]`=Donor `[T]`=TNV `[A]`=Admin cho biết vai trò liên quan.

### Nhóm A — Xác thực & Phân quyền
- **FR1** Đăng ký/đăng nhập bằng email–mật khẩu, Google, Facebook. `[D]`
- **FR2** Quên mật khẩu / đặt lại mật khẩu. `[D]`
- **FR3** Phân quyền 3 cấp (Donor/TNV/Admin); mọi màn & API kiểm tra quyền. `[A]`
- **FR4** Admin nâng/hạ quyền một tài khoản (cấp TNV). `[A]`
- **FR5** Khách chưa đăng nhập xem được chiến dịch & trang minh bạch ở chế độ read-only.

### Nhóm B — Chiến dịch
- **FR6** Danh sách chiến dịch có tìm kiếm + lọc theo trạng thái (Tất cả / Khẩn cấp / Đang gây quỹ / Đã hoàn thành).
- **FR7** Chi tiết chiến dịch: mục tiêu tiền & % tiến độ, số nhà hảo tâm, số ngày còn lại, câu chuyện, **lộ trình triển khai** (timeline mốc), badge xác thực.
- **FR8** Tab **Quyên góp** (danh sách người góp) và tab **Chi phí** (các khoản đã giải ngân, có chứng từ) trong chi tiết chiến dịch.
- **FR9** Mục **Hình ảnh thực tế** tổng hợp ảnh từ phân phối hiện vật & cập nhật của TNV.
- **FR10** Admin tạo/sửa/đóng chiến dịch; đặt nhãn "Khẩn cấp", mục tiêu, mốc lộ trình. `[A]`

### Nhóm C — Quyên góp tiền (luồng QR giả lập)
- **FR11** Chọn số tiền nhanh (100K–5M) hoặc nhập tùy ý; thêm lời nhắn; chọn **công khai/ẩn danh**. `[D]`
- **FR12** Sinh **mã giao dịch** + **QR giả lập** mã hóa URL trang thanh toán giả lập kèm mã giao dịch & số tiền. `[D]`
- **FR13** Trang web "thanh toán giả lập": hiển thị số tiền, nút **Xác nhận đã chuyển** → cập nhật trạng thái giao dịch ở backend.
- **FR14** App **tự phát hiện** trạng thái (polling/realtime) → chuyển sang màn **Quyên góp thành công** với mã giao dịch & thời gian. `[D]`
- **FR15** Cộng số tiền vào tiến độ chiến dịch + tổng quỹ + hồ sơ người góp ngay khi xác nhận.
- *(Không upload biên lai, không Admin duyệt thủ công cho luồng tiền Donor — xem Quyết định #6.)*

### Nhóm D — Kho hiện vật *(module bổ sung)*
- **FR16** **Nhận hiện vật**: tên đồ, loại, số lượng, đơn vị (bộ/cái/kg), tình trạng, người tặng, ảnh, gắn chiến dịch. `[T][A]`
- **FR17** Trạng thái vòng đời: *Đang lưu kho → Đã trao tặng* (và *Một phần* khi phân phối lẻ). `[T][A]`
- **FR18** **Phân phối**: chọn điểm trường/người thụ hưởng, số lượng, ảnh trao tặng; trừ tồn kho tương ứng. `[T][A]`
- **FR19** Xem tồn kho theo chiến dịch & toàn tổ chức; tổng "đã nhận / đã trao".
- **FR20** Tiền và hiện vật **hiển thị tách riêng** xuyên suốt (vd "1.250.000.000đ + 450 bộ hiện vật"); KHÔNG quy đổi hiện vật thành tiền để gộp tổng. Giá trị ước tính của hiện vật (nếu nhập) chỉ để tham khảo nội bộ. `[A]`

### Nhóm E — Dòng tiền & Giải ngân
- **FR21** Sổ quỹ: mọi giao dịch thu (quyên góp) và chi (giải ngân) với ngày, loại, số tiền, chiến dịch, người liên quan.
- **FR22** Admin tạo bản ghi **giải ngân/chi phí**, **upload chứng từ ảnh**, gắn chiến dịch → trạng thái *Đã xác minh*. `[A]`
- **FR23** TNV gửi **chi phí thực địa** kèm hóa đơn → Admin **duyệt/từ chối**. `[T][A]`
- **FR24** Lịch sử giao dịch có tìm kiếm + lọc (Quyên góp / Giải ngân / Hiện vật) và trạng thái.
- **FR25** Chi tiết giao dịch: mã, thời gian, chiến dịch, người gửi/nhận, trạng thái, **minh chứng (ảnh) + xem ảnh gốc**.

### Nhóm F — Minh bạch & Báo cáo
- **FR26** Trang/Dashboard minh bạch: tổng thu, tổng chi (đã giải ngân), % giải ngân, số trẻ hỗ trợ, biểu đồ đóng góp theo tháng.
- **FR27** Mỗi giao dịch chi phải có chứng từ mới được đánh dấu *Đã xác minh*; không xóa cứng — chỉ thu hồi có lịch sử.
- **FR28** Admin **xuất báo cáo** (PDF/ảnh) minh bạch theo chiến dịch & theo kỳ. `[A]`

### Nhóm G — Hồ sơ & Thông báo
- **FR29** Hồ sơ cá nhân: tổng giá trị đóng góp, số lần góp, số dự án hỗ trợ, **huy hiệu thành tựu/tác động**. `[D]`
- **FR30** Lịch sử quyên góp cá nhân + **biên nhận điện tử**. `[D]`
- **FR31** Thông báo (nhóm Hôm nay/Hôm qua/Trước đó): quyên góp thành công, cập nhật chiến dịch, giao dịch được xác minh, báo cáo mới.
- **FR32** Trung tâm hỗ trợ, cài đặt, đăng xuất.

### Nhóm H — Điều hướng & Nền tảng
- **FR33** **Một** thanh điều hướng cố định toàn app theo vai trò (giải quyết lỗi nav không nhất quán trong thiết kế hiện tại). *(xem §9 NFR-UX)*
- **FR34** App Android native; backend/API riêng phục vụ cả app và trang thanh toán giả lập.

---

## 7. Module Kho hiện vật — đặc tả chi tiết

Đây là phần còn thiếu trong thiết kế gốc, tương đương module dòng tiền nhưng cho **đồ vật**.

**Vòng đời một lô hiện vật:**
```
[Nhận]  →  [Đang lưu kho]  →  [Phân phối từng phần]  →  [Đã trao tặng hết]
 ảnh+         tồn kho            trừ dần + ảnh trao         tồn = 0
 người tặng                       cho từng điểm trường
```

**Dữ liệu một bản ghi hiện vật:** mã, tên, loại (sách/quần áo/đồ dùng…), số lượng nhận, đơn vị, tình trạng, người tặng, chiến dịch, ảnh nhận, giá trị ước tính (tùy chọn), tồn hiện tại.

**Dữ liệu một lần phân phối:** lô nguồn, điểm trường/người nhận, số lượng, ngày, ảnh trao tặng, TNV thực hiện.

**Minh bạch:** trang chiến dịch hiển thị "Đã nhận X / Đã trao Y" và gallery ảnh trao tặng — nhà hảo tâm tặng đồ thấy được món của mình đến tay ai.

---

## 8. Mô hình dữ liệu (mức khái niệm)

`User` (role) · `Campaign` (mục tiêu, trạng thái, mốc lộ trình) · `Donation` (tiền, mã GD, trạng thái, công khai/ẩn danh) · `InKindItem` (lô hiện vật) · `Distribution` (lần phân phối) · `Expense`/`Disbursement` (giải ngân/chi phí, chứng từ, trạng thái duyệt) · `Beneficiary` (điểm trường/em) · `Notification` · `MediaAsset` (ảnh chứng từ/thực tế).

*(Chi tiết quan hệ & kỹ thuật để cho bước Architecture; ghi nhận ở addendum.)*

---

## 9. Yêu cầu phi chức năng (NFR)

- **NFR-Trust (cốt lõi):** Mọi khoản **chi** phải có chứng từ ảnh mới được *Đã xác minh*. Không xóa cứng giao dịch — chỉ thu hồi/điều chỉnh có ghi vết (audit trail).
- **NFR-UX:** Một hệ thống điều hướng nhất quán toàn app; nhập liệu hiện trường tối giản (ít trường, chụp ảnh nhanh). Tương phản màu đạt mức dễ đọc cho người lớn tuổi.
- **NFR-Security:** Mật khẩu băm; phân quyền kiểm tra phía server cho mọi hành động ghi; chỉ Admin/TNV truy cập màn quản trị.
- **NFR-Performance:** Trang chính tải < 3s trên 3G/điện thoại phổ thông; ảnh được nén/lazy-load.
- **NFR-Reliability:** Trạng thái giao dịch QR cập nhật trong vài giây sau khi trang giả lập xác nhận.
- **NFR-Localization:** Tiếng Việt; định dạng tiền tệ **đồng nhất** (vd `500.000đ`, có dấu phân cách + ký hiệu đ) toàn app.
- **NFR-Maintainability (đồ án):** Code rõ ràng, dữ liệu seed mẫu để demo trước hội đồng.

---

## 10. Chỉ số thành công & Counter-metrics

| Chỉ số thành công | | Counter-metric (cảnh báo) |
|---|---|---|
| % chiến dịch có ≥1 khoản chi kèm chứng từ | | Tỉ lệ giao dịch chi *chưa* xác minh tồn đọng |
| Tỉ lệ hoàn tất luồng quyên góp (bắt đầu → thành công) | | Tỉ lệ bỏ dở ở bước QR |
| Số lô hiện vật được ghi nhận trọn vòng đời (nhận→trao) | | Hiện vật "Đang lưu kho" quá hạn chưa phân phối |
| (Đồ án) Hội đồng đánh giá tính minh bạch & đầy đủ tính năng | | Lỗi điều hướng/lạc luồng khi demo |

---

## 11. Giả định & Câu hỏi mở

- `[ASSUMPTION]` Đăng nhập Google/Facebook có thể **giả lập** nếu khó cấu hình OAuth thật trong phạm vi đồ án.
- ✅ *Đã chốt:* Nền tảng = Android native (không iOS) — Quyết định #10.
- ✅ *Đã chốt:* Tiền & hiện vật hiển thị tách riêng, không quy đổi gộp — Quyết định #11.
- ✅ *Đã chốt:* Beneficiary quản lý ở mức điểm trường — Quyết định #12.
