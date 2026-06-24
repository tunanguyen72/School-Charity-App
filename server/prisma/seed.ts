import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()
const pw = bcrypt.hashSync('123456', 10) // mật khẩu demo cho cả 3 tài khoản

async function main() {
  // sạch dữ liệu cũ (thứ tự tôn trọng khóa ngoại)
  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.mediaAsset.deleteMany()
  await db.distribution.deleteMany()
  await db.expense.deleteMany()
  await db.inkindBatch.deleteMany()
  await db.donation.deleteMany()
  await db.campaignMilestone.deleteMany()
  await db.campaign.deleteMany()
  await db.beneficiary.deleteMany()
  await db.user.deleteMany()

  // ===== Users =====
  const huong = await db.user.create({ data: { fullName: 'Cô Hương', email: 'huong@example.com', role: 'donor', passwordHash: pw } })
  const khai = await db.user.create({ data: { fullName: 'Anh Khải', email: 'khai@example.com', role: 'tnv', passwordHash: pw } })
  const lan = await db.user.create({ data: { fullName: 'Quản trị viên', email: 'admin@gmail.com', role: 'admin', passwordHash: pw } })
  // nhà hảo tâm khác (để thống kê top donors phong phú)
  const an = await db.user.create({ data: { fullName: 'Nguyễn Văn An', email: 'an@example.com', role: 'donor', passwordHash: pw } })
  const binh = await db.user.create({ data: { fullName: 'Trần Bình', email: 'binh@example.com', role: 'donor', passwordHash: pw } })
  const cuc = await db.user.create({ data: { fullName: 'Lê Thị Cúc', email: 'cuc@example.com', role: 'donor', passwordHash: pw } })
  const tech = await db.user.create({ data: { fullName: 'Công ty TechCloud', email: 'tech@example.com', role: 'donor', passwordHash: pw } })
  const donors: Record<string, number> = { huong: huong.id, an: an.id, binh: binh.id, cuc: cuc.id, tech: tech.id }

  // ===== Beneficiaries =====
  const banMoSchool = await db.beneficiary.create({ data: { name: 'Điểm trường Bản Mo', province: 'Hà Giang', location: 'Xín Mần' } })
  await db.beneficiary.create({ data: { name: 'Điểm trường Nậm Pầm', province: 'Yên Bái', location: 'Mù Cang Chải' } })
  await db.beneficiary.create({ data: { name: 'Điểm trường Mèo Vạc', province: 'Hà Giang', location: 'Mèo Vạc' } })

  // ===== Campaigns + milestones =====
  const mk = (state: string) => state
  const banMo = await db.campaign.create({
    data: {
      title: 'Xây trường cho em tại Bản Mo', slug: 'ban-mo', location: 'Xín Mần, Hà Giang',
      status: 'urgent', story: 'Tại Bản Mo, 45 em mầm non đang phải học trong căn nhà gỗ cũ kỹ, dột nát mỗi khi mưa về.',
      goalAmount: 200_000_000n, bannerEmoji: '🏫', isVerified: true, childrenHelped: 45,
      createdById: lan.id, endDate: new Date('2024-08-01'),
      milestones: { create: [
        { label: 'Bắt đầu khảo sát', dateLabel: '05/2024', description: 'Đã hoàn thành đánh giá hiện trạng.', state: mk('done'), orderIndex: 0 },
        { label: 'Khai mạc gây quỹ', dateLabel: '06/2024', description: 'Đang tiếp nhận đóng góp.', state: mk('now'), orderIndex: 1 },
        { label: 'Dự kiến khởi công', dateLabel: '08/2024', description: 'Xây móng và tường bao.', state: mk('todo'), orderIndex: 2 },
      ] },
    },
  })
  const namPam = await db.campaign.create({
    data: {
      title: 'Điểm trường Nậm Pầm đang xuống cấp', slug: 'nam-pam', location: 'Mù Cang Chải, Yên Bái',
      status: 'urgent', story: 'Hơn 120 em học sinh đang phải học trong điều kiện tạm bợ, mái lá dột nát mỗi mùa mưa lũ.',
      goalAmount: 100_000_000n, bannerEmoji: '⛰️', isVerified: true, childrenHelped: 120, createdById: lan.id, endDate: new Date('2024-07-15'),
      milestones: { create: [
        { label: 'Khảo sát hiện trạng', dateLabel: '04/2024', description: 'Hoàn tất.', state: mk('done'), orderIndex: 0 },
        { label: 'Gây quỹ khẩn cấp', dateLabel: '06/2024', description: 'Đang gây quỹ.', state: mk('now'), orderIndex: 1 },
        { label: 'Khởi công', dateLabel: '07/2024', description: 'Dự kiến.', state: mk('todo'), orderIndex: 2 },
      ] },
    },
  })
  const tuSach = await db.campaign.create({
    data: {
      title: 'Tủ sách yêu thương vùng biên giới', slug: 'tu-sach', location: 'Mèo Vạc, Hà Giang',
      status: 'active', story: 'Cung cấp 10.000 cuốn sách và đồ dùng học tập cho trẻ em nghèo.',
      goalAmount: 60_000_000n, bannerEmoji: '📚', isVerified: true, childrenHelped: 1200, createdById: lan.id, endDate: new Date('2024-09-30'),
      milestones: { create: [
        { label: 'Lên danh sách điểm trường', dateLabel: '05/2024', description: 'Đã chọn 8 điểm trường.', state: mk('done'), orderIndex: 0 },
        { label: 'Gây quỹ & nhận sách', dateLabel: '06/2024', description: 'Đang tiếp nhận.', state: mk('now'), orderIndex: 1 },
        { label: 'Phân phối', dateLabel: '09/2024', description: 'Trao tận điểm trường.', state: mk('todo'), orderIndex: 2 },
      ] },
    },
  })
  const aoAm = await db.campaign.create({
    data: {
      title: 'Áo ấm mùa đông cho trẻ em nghèo', slug: 'ao-am', location: 'Mèo Vạc, Hà Giang',
      status: 'done', story: 'Đã trao 2.000 áo ấm cho trẻ em vùng cao.',
      goalAmount: 150_000_000n, bannerEmoji: '🧥', isVerified: true, childrenHelped: 2000, createdById: lan.id,
      milestones: { create: [
        { label: 'Gây quỹ', dateLabel: '01/2024', description: 'Vượt mục tiêu.', state: mk('done'), orderIndex: 0 },
        { label: 'Mua & may áo', dateLabel: '03/2024', description: 'Hoàn tất.', state: mk('done'), orderIndex: 1 },
        { label: 'Trao tặng', dateLabel: '05/2024', description: 'Đã trao 2.000 áo.', state: mk('done'), orderIndex: 2 },
      ] },
    },
  })
  const camId: Record<string, number> = { 'ban-mo': banMo.id, 'nam-pam': namPam.id, 'tu-sach': tuSach.id, 'ao-am': aoAm.id }

  // ===== Donations (trải đều T1..T6/2024) =====
  // [slug, donorKey, amount, month(1-6), day]
  const D: [string, string, number, number, number][] = [
    ['ban-mo', 'tech', 20_000_000, 1, 12], ['tu-sach', 'huong', 500_000, 1, 15], ['ao-am', 'an', 5_000_000, 1, 20], ['nam-pam', 'binh', 2_000_000, 1, 22],
    ['ban-mo', 'an', 3_000_000, 2, 5], ['ao-am', 'tech', 30_000_000, 2, 10], ['tu-sach', 'cuc', 1_000_000, 2, 14], ['nam-pam', 'huong', 1_000_000, 2, 18], ['ban-mo', 'huong', 500_000, 2, 25],
    ['ban-mo', 'cuc', 2_000_000, 3, 3], ['ao-am', 'tech', 50_000_000, 3, 8], ['nam-pam', 'an', 5_000_000, 3, 12], ['tu-sach', 'binh', 3_000_000, 3, 19], ['ban-mo', 'tech', 25_000_000, 3, 27],
    ['ban-mo', 'binh', 10_000_000, 4, 4], ['ao-am', 'an', 10_000_000, 4, 9], ['nam-pam', 'tech', 40_000_000, 4, 15], ['tu-sach', 'huong', 2_000_000, 4, 21], ['ban-mo', 'an', 5_000_000, 4, 28],
    ['ban-mo', 'tech', 30_000_000, 5, 6], ['ao-am', 'cuc', 20_000_000, 5, 11], ['nam-pam', 'binh', 15_000_000, 5, 16], ['tu-sach', 'tech', 20_000_000, 5, 23], ['ban-mo', 'huong', 2_000_000, 5, 29],
    ['ban-mo', 'an', 5_000_000, 6, 2], ['ao-am', 'tech', 50_000_000, 6, 7], ['nam-pam', 'huong', 2_000_000, 6, 13], ['tu-sach', 'cuc', 1_500_000, 6, 17], ['ban-mo', 'binh', 20_000_000, 6, 24], ['ban-mo', 'huong', 500_000, 6, 30],
  ]

  const agg: Record<string, { sum: bigint; donors: Set<number> }> = {}
  let seq = 1
  for (const [slug, dk, amount, month, day] of D) {
    const donorId = donors[dk]
    const when = new Date(2024, month - 1, day, 9 + (seq % 10), 0)
    await db.donation.create({
      data: {
        txnCode: 'CE-' + String(1000000 + seq * 7).slice(0, 7), campaignId: camId[slug], donorId,
        amount: BigInt(amount), status: 'success', confirmedAt: when, createdAt: when,
        isAnonymous: dk === 'cuc' && month % 2 === 0, // vài giao dịch ẩn danh
      },
    })
    if (!agg[slug]) agg[slug] = { sum: 0n, donors: new Set() }
    agg[slug].sum += BigInt(amount)
    agg[slug].donors.add(donorId)
    seq++
  }
  for (const slug of Object.keys(agg)) {
    await db.campaign.update({ where: { id: camId[slug] }, data: { raisedAmount: agg[slug].sum, donorCount: agg[slug].donors.size } })
  }

  // ===== Inkind batches =====
  const sach = await db.inkindBatch.create({ data: { name: 'Sách giáo khoa', category: 'book', donorName: 'Công ty TechCloud', campaignId: banMo.id, unit: 'bộ', quantityTotal: 100, quantityRemaining: 60, condition: 'new', status: 'partial', receivedById: khai.id } })
  await db.inkindBatch.create({ data: { name: 'Áo ấm mùa đông', category: 'clothing', donorName: 'Nhóm thiện nguyện Hà Nội', campaignId: tuSach.id, unit: 'cái', quantityTotal: 200, quantityRemaining: 80, condition: 'new', status: 'partial', receivedById: khai.id } })
  await db.inkindBatch.create({ data: { name: 'Bộ dụng cụ học tập', category: 'supplies', donorName: 'Lê Thị Cúc', campaignId: namPam.id, unit: 'bộ', quantityTotal: 150, quantityRemaining: 0, condition: 'new', status: 'given', receivedById: khai.id } })

  await db.distribution.create({ data: { batchId: sach.id, beneficiaryId: banMoSchool.id, quantity: 40, note: 'Trao tận lớp học', distributedById: khai.id } })

  // ===== Expenses (giải ngân có chứng từ -> verified) =====
  const exp1 = await db.expense.create({ data: { campaignId: banMo.id, title: 'Mua vật liệu xây móng', amount: 45_000_000n, type: 'disbursement', status: 'verified', submittedById: lan.id, approvedById: lan.id, approvedAt: new Date('2024-05-16'), spentAt: new Date('2024-05-15') } })
  await db.expense.create({ data: { campaignId: banMo.id, title: 'Vận chuyển vật tư lên bản', amount: 8_000_000n, type: 'field_expense', status: 'verified', submittedById: khai.id, approvedById: lan.id, approvedAt: new Date('2024-05-20') } })
  await db.expense.create({ data: { campaignId: aoAm.id, title: 'Sản xuất 2.000 áo ấm', amount: 120_000_000n, type: 'disbursement', status: 'verified', submittedById: lan.id, approvedById: lan.id, approvedAt: new Date('2024-04-10') } })
  await db.expense.create({ data: { campaignId: tuSach.id, title: 'In ấn & đóng gói sách', amount: 5_000_000n, type: 'disbursement', status: 'pending', submittedById: lan.id } })

  await db.mediaAsset.create({ data: { url: '/uploads/receipt-exp1.jpg', kind: 'receipt', ownerType: 'expense', ownerId: exp1.id, uploadedById: lan.id } })
  await db.mediaAsset.create({ data: { url: '/uploads/distribution-banmo.jpg', kind: 'distribution_photo', ownerType: 'campaign', ownerId: banMo.id, uploadedById: khai.id } })

  // ===== Notifications =====
  await db.notification.createMany({ data: [
    { userId: huong.id, type: 'donation_success', title: 'Quyên góp thành công', body: 'Cảm ơn bạn đã đóng góp cho chiến dịch Bản Mo.' },
    { userId: huong.id, type: 'campaign_update', title: 'Cập nhật chiến dịch', body: 'Dự án Áo ấm vùng cao đã hoàn thành 100% kế hoạch.' },
    { userId: huong.id, type: 'txn_verified', title: 'Giao dịch đã xác minh', body: 'Giao dịch của bạn đã được đối soát.' },
    { userId: huong.id, type: 'report', title: 'Báo cáo minh bạch mới', body: 'Quỹ vừa công bố báo cáo thu chi tháng 06/2024.' },
  ] })

  await db.auditLog.create({ data: { actorId: lan.id, action: 'verify', entityType: 'Expense', entityId: exp1.id, reason: 'Đã đối chiếu chứng từ hợp lệ' } })

  const totalRaised = Object.values(agg).reduce((s, a) => s + a.sum, 0n)
  console.log('✅ Seed xong:', {
    users: await db.user.count(), campaigns: await db.campaign.count(),
    donations: await db.donation.count(), totalRaised: totalRaised.toString(),
  })
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
