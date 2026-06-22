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
  const lan = await db.user.create({ data: { fullName: 'Chị Lan', email: 'lan@example.com', role: 'admin', passwordHash: pw } })

  // ===== Beneficiaries =====
  const banMoSchool = await db.beneficiary.create({ data: { name: 'Điểm trường Bản Mo', province: 'Hà Giang', location: 'Xín Mần' } })
  const namPam = await db.beneficiary.create({ data: { name: 'Điểm trường Nậm Pầm', province: 'Yên Bái', location: 'Mù Cang Chải' } })

  // ===== Campaigns + milestones =====
  const banMo = await db.campaign.create({
    data: {
      title: 'Xây trường cho em tại Bản Mo', slug: 'ban-mo', location: 'Xín Mần, Hà Giang',
      status: 'urgent', story: 'Tại Bản Mo, 45 em mầm non đang phải học trong căn nhà gỗ cũ kỹ, dột nát mỗi khi mưa về.',
      goalAmount: 200_000_000n, raisedAmount: 150_000_000n, donorCount: 120,
      inkindReceived: 100, inkindGiven: 40, bannerEmoji: '🏫', isVerified: true,
      createdById: lan.id, endDate: new Date('2024-08-01'),
      milestones: {
        create: [
          { label: 'Bắt đầu khảo sát', dateLabel: '05/2024', description: 'Đã hoàn thành đánh giá hiện trạng.', state: 'done', orderIndex: 0 },
          { label: 'Khai mạc gây quỹ', dateLabel: '06/2024', description: 'Đang tiếp nhận đóng góp.', state: 'now', orderIndex: 1 },
          { label: 'Dự kiến khởi công', dateLabel: '08/2024', description: 'Xây móng và tường bao.', state: 'todo', orderIndex: 2 },
        ],
      },
    },
  })

  const tuSach = await db.campaign.create({
    data: {
      title: 'Tủ sách yêu thương vùng biên giới', slug: 'tu-sach', location: 'Mèo Vạc, Hà Giang',
      status: 'active', story: 'Cung cấp 10.000 cuốn sách và đồ dùng học tập cho trẻ em nghèo.',
      goalAmount: 150_000_000n, raisedAmount: 63_000_000n, donorCount: 88,
      inkindReceived: 200, inkindGiven: 120, bannerEmoji: '📚', isVerified: true, createdById: lan.id,
    },
  })

  await db.campaign.create({
    data: {
      title: 'Áo ấm mùa đông cho trẻ em nghèo', slug: 'ao-am', location: 'Mèo Vạc, Hà Giang',
      status: 'done', story: 'Đã trao 2.000 áo ấm cho trẻ em vùng cao mùa đông 2023.',
      goalAmount: 200_000_000n, raisedAmount: 215_000_000n, donorCount: 540,
      inkindReceived: 2000, inkindGiven: 2000, bannerEmoji: '🧥', isVerified: true, createdById: lan.id,
    },
  })

  // ===== Donations =====
  await db.donation.createMany({
    data: [
      { txnCode: 'CE-0500001', campaignId: banMo.id, donorId: huong.id, amount: 500_000n, status: 'success', confirmedAt: new Date(), isAnonymous: false },
      { txnCode: 'CE-1000002', campaignId: banMo.id, donorId: huong.id, amount: 1_000_000n, status: 'success', confirmedAt: new Date(), message: 'Cố lên các em!' },
      { txnCode: 'CE-2000003', campaignId: banMo.id, donorId: huong.id, amount: 2_000_000n, status: 'success', confirmedAt: new Date(), isAnonymous: true },
    ],
  })

  // ===== Inkind batches =====
  const sach = await db.inkindBatch.create({
    data: { name: 'Sách giáo khoa', category: 'book', donorName: 'Công ty TechCloud', campaignId: banMo.id, unit: 'bộ', quantityTotal: 100, quantityRemaining: 60, condition: 'new', status: 'partial', receivedById: khai.id },
  })
  await db.inkindBatch.create({
    data: { name: 'Áo ấm mùa đông', category: 'clothing', donorName: 'Nhóm thiện nguyện Hà Nội', campaignId: tuSach.id, unit: 'cái', quantityTotal: 200, quantityRemaining: 80, condition: 'new', status: 'partial', receivedById: khai.id },
  })

  // ===== Distribution =====
  await db.distribution.create({
    data: { batchId: sach.id, beneficiaryId: banMoSchool.id, quantity: 40, note: 'Trao tận lớp học', distributedById: khai.id },
  })

  // ===== Expenses (giải ngân có chứng từ -> verified) =====
  const exp1 = await db.expense.create({
    data: { campaignId: banMo.id, title: 'Mua vật liệu xây móng', amount: 45_000_000n, type: 'disbursement', status: 'verified', submittedById: lan.id, approvedById: lan.id, approvedAt: new Date(), spentAt: new Date('2024-05-15') },
  })
  await db.expense.create({
    data: { campaignId: banMo.id, title: 'Vận chuyển vật tư lên bản', amount: 8_000_000n, type: 'field_expense', status: 'verified', submittedById: khai.id, approvedById: lan.id, approvedAt: new Date() },
  })

  // ===== Media (chứng từ cho expense) =====
  await db.mediaAsset.create({
    data: { url: '/uploads/receipt-exp1.jpg', kind: 'receipt', ownerType: 'expense', ownerId: exp1.id, uploadedById: lan.id },
  })
  await db.mediaAsset.create({
    data: { url: '/uploads/distribution-banmo.jpg', kind: 'distribution_photo', ownerType: 'campaign', ownerId: banMo.id, uploadedById: khai.id },
  })

  // ===== Notifications =====
  await db.notification.createMany({
    data: [
      { userId: huong.id, type: 'donation_success', title: 'Quyên góp thành công', body: 'Cảm ơn bạn đã đóng góp 500.000đ cho chiến dịch Bản Mo.' },
      { userId: huong.id, type: 'campaign_update', title: 'Cập nhật chiến dịch', body: 'Dự án Áo ấm vùng cao đã hoàn thành 80% kế hoạch.' },
      { userId: huong.id, type: 'txn_verified', title: 'Giao dịch đã xác minh', body: 'Giao dịch của bạn đã được đối soát.' },
    ],
  })

  // ===== Audit log mẫu =====
  await db.auditLog.create({
    data: { actorId: lan.id, action: 'verify', entityType: 'Expense', entityId: exp1.id, reason: 'Đã đối chiếu chứng từ hợp lệ' },
  })

  const counts = {
    users: await db.user.count(), campaigns: await db.campaign.count(),
    donations: await db.donation.count(), inkind: await db.inkindBatch.count(),
    expenses: await db.expense.count(), distributions: await db.distribution.count(),
  }
  console.log('✅ Seed xong:', counts)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
