import express, { type Request, type Response, type NextFunction } from 'express'
import 'express-async-errors' // tự bắt lỗi trong route async -> đẩy sang error handler (không sập tiến trình)
import cors from 'cors'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { db } from './db.js'
import { signToken, requireAuth, requireRole, type AuthUser } from './auth.js'

// Mạng an toàn: không để lỗi ngoài request làm sập tiến trình (tránh 502 hàng loạt)
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason))
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err))

const app = express()
app.use(cors())
app.use(express.json())

const genTxn = () => 'CE-' + Math.floor(1_000_000 + Math.random() * 9_000_000)
const currentUser = (req: Request) => (req as Request & { user: AuthUser }).user

// ===== Xác thực =====
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, role } = req.body
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Thiếu thông tin' })
  // Chỉ cho tự đăng ký donor hoặc tnv — KHÔNG cho tự tạo admin
  const safeRole = role === 'tnv' ? 'tnv' : 'donor'
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email đã được đăng ký' })
  const user = await db.user.create({
    data: { fullName, email, passwordHash: bcrypt.hashSync(password, 10), role: safeRole },
  })
  const auth: AuthUser = { id: user.id, email: user.email, role: user.role, fullName: user.fullName }
  res.json({ token: signToken(auth), user: auth })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = await db.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
  const auth: AuthUser = { id: user.id, email: user.email, role: user.role, fullName: user.fullName }
  res.json({ token: signToken(auth), user: auth })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(currentUser(req))
})

// Thông báo của người dùng hiện tại
app.get('/api/notifications', requireAuth, async (req, res) => {
  res.json(await db.notification.findMany({ where: { userId: currentUser(req).id }, orderBy: { createdAt: 'desc' } }))
})

// Thống kê đóng góp của tôi (cho màn Hồ sơ)
app.get('/api/me/stats', requireAuth, async (req, res) => {
  const uid = currentUser(req).id
  const sum = await db.donation.aggregate({ _sum: { amount: true }, _count: true, where: { donorId: uid, status: 'success' } })
  const projects = await db.donation.findMany({ where: { donorId: uid, status: 'success' }, distinct: ['campaignId'], select: { campaignId: true } })
  res.json({ totalDonated: sum._sum.amount ?? 0n, donationCount: sum._count, projectCount: projects.length })
})

// --- Health ---
app.get('/api/health', async (_req, res) => {
  const [users, campaigns, donations] = await Promise.all([db.user.count(), db.campaign.count(), db.donation.count()])
  res.json({ ok: true, counts: { users, campaigns, donations } })
})

// --- Tổng quan quỹ (dashboard) ---
app.get('/api/summary', async (_req, res) => {
  // Tổng quỹ = cộng dồn raisedAmount của các chiến dịch (khớp với card chiến dịch)
  const raised = await db.campaign.aggregate({ _sum: { raisedAmount: true } })
  const disbursed = await db.expense.aggregate({ _sum: { amount: true }, where: { status: 'verified' } })
  const inkind = await db.inkindBatch.aggregate({ _sum: { quantityTotal: true } })
  res.json({
    totalRaised: raised._sum.raisedAmount ?? 0n,
    disbursed: disbursed._sum.amount ?? 0n,
    inkindSets: inkind._sum.quantityTotal ?? 0,
    projects: await db.campaign.count(),
  })
})

// --- Thống kê / Báo cáo (số liệu tổng hợp) ---
app.get('/api/stats', requireAuth, async (_req, res) => {
  const [campaigns, successDonations, verifiedExpenses, inkind, schools] = await Promise.all([
    db.campaign.findMany(),
    db.donation.findMany({ where: { status: 'success' }, select: { amount: true, confirmedAt: true, donorId: true } }),
    db.expense.findMany({ where: { status: 'verified' }, select: { amount: true } }),
    db.inkindBatch.aggregate({ _sum: { quantityTotal: true, quantityRemaining: true } }),
    db.beneficiary.count(),
  ])

  const n = (b: bigint) => Number(b)
  const totalRaised = campaigns.reduce((s, c) => s + n(c.raisedAmount), 0)
  const totalDisbursed = verifiedExpenses.reduce((s, e) => s + n(e.amount), 0)
  const donorIds = new Set(successDonations.map((d) => d.donorId))
  const donationCount = successDonations.length
  const inkindTotal = inkind._sum.quantityTotal ?? 0
  const inkindRemaining = inkind._sum.quantityRemaining ?? 0

  // Biểu đồ theo tháng (2024, T1..T6)
  const monthly = Array.from({ length: 6 }, (_, i) => ({ label: `T${i + 1}`, total: 0, count: 0 }))
  for (const d of successDonations) {
    if (!d.confirmedAt) continue
    const dt = new Date(d.confirmedAt)
    if (dt.getFullYear() === 2024) {
      const m = dt.getMonth()
      if (m < 6) { monthly[m].total += n(d.amount); monthly[m].count++ }
    }
  }

  // Top nhà hảo tâm
  const byDonor = await db.donation.groupBy({
    by: ['donorId'], where: { status: 'success' },
    _sum: { amount: true }, _count: true, orderBy: { _sum: { amount: 'desc' } }, take: 5,
  })
  const donorUsers = await db.user.findMany({ where: { id: { in: byDonor.map((d) => d.donorId) } }, select: { id: true, fullName: true } })
  const nameOf = (id: number) => donorUsers.find((u) => u.id === id)?.fullName ?? 'Ẩn danh'
  const topDonors = byDonor.map((d) => ({ name: nameOf(d.donorId), total: n(d._sum.amount ?? 0n), count: d._count }))

  res.json({
    overview: {
      totalRaised, totalDisbursed, balance: totalRaised - totalDisbursed,
      disbursementRate: totalRaised ? Math.round((totalDisbursed / totalRaised) * 100) : 0,
      donationCount, donorCount: donorIds.size,
      avgDonation: donationCount ? Math.round(totalRaised / donationCount) : 0,
      childrenHelped: campaigns.reduce((s, c) => s + c.childrenHelped, 0),
      schools, inkindTotal, inkindGiven: inkindTotal - inkindRemaining,
      campaignsActive: campaigns.filter((c) => c.status !== 'done').length,
      campaignsDone: campaigns.filter((c) => c.status === 'done').length,
    },
    monthly,
    byCampaign: campaigns
      .map((c) => ({ slug: c.slug, title: c.title, emoji: c.bannerEmoji, status: c.status, raised: n(c.raisedAmount), goal: n(c.goalAmount), donors: c.donorCount }))
      .sort((a, b) => b.raised - a.raised),
    topDonors,
  })
})

// --- Chiến dịch ---
app.get('/api/campaigns', async (req, res) => {
  const status = req.query.status as string | undefined
  const campaigns = await db.campaign.findMany({
    where: status && status !== 'all' ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  res.json(campaigns)
})

app.get('/api/campaigns/:slug', async (req, res) => {
  const c = await db.campaign.findUnique({
    where: { slug: req.params.slug },
    include: {
      milestones: { orderBy: { orderIndex: 'asc' } },
      donations: { where: { status: 'success' }, orderBy: { confirmedAt: 'desc' }, include: { donor: true } },
      expenses: { where: { status: 'verified' } },
    },
  })
  if (!c) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  res.json(c)
})

// --- Quyên góp: tạo (pending) → trả QR/mã giao dịch ---
app.post('/api/donations', requireAuth, async (req, res) => {
  const { campaignSlug, amount, message, isAnonymous } = req.body
  const campaign = await db.campaign.findUnique({ where: { slug: campaignSlug } })
  if (!campaign) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  const donation = await db.donation.create({
    data: {
      txnCode: genTxn(), campaignId: campaign.id, donorId: currentUser(req).id,
      amount: BigInt(amount), message, isAnonymous: !!isAnonymous, status: 'pending',
    },
  })
  res.json(donation)
})

// --- Xác nhận thanh toán (trang QR giả lập gọi về) ---
app.post('/api/donations/:txnCode/confirm', async (req, res) => {
  const donation = await db.donation.findUnique({ where: { txnCode: req.params.txnCode } })
  if (!donation) return res.status(404).json({ error: 'Không tìm thấy giao dịch' })
  if (donation.status === 'success') return res.json(donation)

  const updated = await db.$transaction(async (tx) => {
    const d = await tx.donation.update({ where: { id: donation.id }, data: { status: 'success', confirmedAt: new Date() } })
    await tx.campaign.update({
      where: { id: donation.campaignId },
      data: { raisedAmount: { increment: donation.amount }, donorCount: { increment: 1 } },
    })
    await tx.notification.create({
      data: { userId: donation.donorId, type: 'donation_success', title: 'Quyên góp thành công', body: `Cảm ơn bạn đã đóng góp ${donation.amount.toString()}đ.` },
    })
    return d
  })
  res.json(updated)
})

// --- Kho hiện vật ---
app.get('/api/inventory', async (_req, res) => {
  res.json(await db.inkindBatch.findMany({ orderBy: { receivedAt: 'desc' } }))
})

// --- Sổ quỹ (hợp nhất quyên góp + giải ngân + hiện vật) ---
app.get('/api/ledger', async (_req, res) => {
  const [donations, expenses, inkind] = await Promise.all([
    db.donation.findMany({ where: { status: 'success' }, include: { donor: true } }),
    db.expense.findMany(),
    db.inkindBatch.findMany(),
  ])
  const ledger = [
    ...donations.map((d) => ({ kind: 'donation', code: d.txnCode, who: d.donor.fullName, amount: d.amount, status: d.status, at: d.confirmedAt })),
    ...expenses.map((e) => ({ kind: 'expense', code: 'EXP-' + e.id, who: e.title, amount: -e.amount, status: e.status, at: e.approvedAt })),
    ...inkind.map((i) => ({ kind: 'inkind', code: 'IK-' + i.id, who: i.donorName, amount: 0n, label: `${i.quantityTotal} ${i.unit} ${i.name}`, status: i.status, at: i.receivedAt })),
  ].sort((a, b) => (new Date(b.at ?? 0).getTime()) - (new Date(a.at ?? 0).getTime()))
  res.json(ledger)
})

// --- TNV/Admin: nhận hiện vật vào kho ---
app.post('/api/inventory', requireAuth, requireRole('tnv', 'admin'), async (req, res) => {
  const { name, category, donorName, campaignSlug, unit, quantity, condition } = req.body
  const campaign = await db.campaign.findUnique({ where: { slug: campaignSlug } })
  if (!campaign) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  const batch = await db.inkindBatch.create({
    data: {
      name, category, donorName, campaignId: campaign.id, unit,
      quantityTotal: Number(quantity), quantityRemaining: Number(quantity),
      condition: condition ?? 'new', status: 'stored', receivedById: currentUser(req).id,
    },
  })
  res.json(batch)
})

// --- Admin: tạo khoản giải ngân (chờ chứng từ để xác minh) ---
app.post('/api/expenses', requireAuth, requireRole('admin'), async (req, res) => {
  const { campaignSlug, title, amount, type } = req.body
  const campaign = await db.campaign.findUnique({ where: { slug: campaignSlug } })
  if (!campaign) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  const expense = await db.expense.create({
    data: { campaignId: campaign.id, title, amount: BigInt(amount), type: type ?? 'disbursement', status: 'pending', submittedById: currentUser(req).id },
  })
  res.json(expense)
})

// --- Admin: danh sách khoản chi (giải ngân + chi phí TNV) ---
app.get('/api/expenses', requireAuth, requireRole('admin'), async (_req, res) => {
  const list = await db.expense.findMany({
    orderBy: { createdAt: 'desc' },
    include: { campaign: { select: { title: true } }, submittedBy: { select: { fullName: true } } },
  })
  res.json(list)
})

// --- Admin: xác minh khoản chi (đính kèm chứng từ → verified) ---
app.post('/api/expenses/:id/verify', requireAuth, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id)
  const exp = await db.expense.findUnique({ where: { id } })
  if (!exp) return res.status(404).json({ error: 'Không tìm thấy khoản chi' })
  const me = currentUser(req)
  const updated = await db.$transaction(async (tx) => {
    await tx.mediaAsset.create({ data: { url: `/uploads/receipt-exp${id}.jpg`, kind: 'receipt', ownerType: 'expense', ownerId: id, uploadedById: me.id } })
    const e = await tx.expense.update({ where: { id }, data: { status: 'verified', approvedById: me.id, approvedAt: new Date() } })
    await tx.auditLog.create({ data: { actorId: me.id, action: 'verify', entityType: 'Expense', entityId: id, reason: 'Đính kèm chứng từ & xác minh' } })
    return e
  })
  res.json(updated)
})

// --- Admin: từ chối khoản chi ---
app.post('/api/expenses/:id/reject', requireAuth, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id)
  const me = currentUser(req)
  const e = await db.expense.update({ where: { id }, data: { status: 'rejected', approvedById: me.id, approvedAt: new Date() } })
  await db.auditLog.create({ data: { actorId: me.id, action: 'reject', entityType: 'Expense', entityId: id, reason: req.body?.reason ?? 'Không hợp lệ' } })
  res.json(e)
})

// ===== TNV: Phân phối hiện vật (trừ tồn kho thật) =====
app.post('/api/distributions', requireAuth, requireRole('tnv', 'admin'), async (req, res) => {
  const { batchId, beneficiaryId, quantity, note } = req.body
  const qty = Number(quantity)
  const batch = await db.inkindBatch.findUnique({ where: { id: Number(batchId) } })
  if (!batch) return res.status(404).json({ error: 'Không tìm thấy lô hiện vật' })
  if (!(qty > 0) || qty > batch.quantityRemaining) return res.status(400).json({ error: `Số lượng không hợp lệ (tồn ${batch.quantityRemaining})` })
  const me = currentUser(req)
  const result = await db.$transaction(async (tx) => {
    const dist = await tx.distribution.create({ data: { batchId: batch.id, beneficiaryId: Number(beneficiaryId), quantity: qty, note: note ?? '', distributedById: me.id } })
    const remaining = batch.quantityRemaining - qty
    await tx.inkindBatch.update({ where: { id: batch.id }, data: { quantityRemaining: remaining, status: remaining <= 0 ? 'given' : 'partial' } })
    await tx.campaign.update({ where: { id: batch.campaignId }, data: { inkindGiven: { increment: qty } } })
    await tx.mediaAsset.create({ data: { url: `/uploads/distribution-${dist.id}.jpg`, kind: 'distribution_photo', ownerType: 'campaign', ownerId: batch.campaignId, uploadedById: me.id } })
    await tx.auditLog.create({ data: { actorId: me.id, action: 'create', entityType: 'Distribution', entityId: dist.id, reason: `Trao ${qty} ${batch.unit} ${batch.name}` } })
    return dist
  })
  res.json(result)
})

// ===== TNV: Chi phí thực địa (gửi admin duyệt) =====
app.post('/api/field-expenses', requireAuth, requireRole('tnv', 'admin'), async (req, res) => {
  const { campaignSlug, title, amount } = req.body
  if (!title?.trim() || !amount) return res.status(400).json({ error: 'Thiếu nội dung hoặc số tiền' })
  const campaign = await db.campaign.findUnique({ where: { slug: campaignSlug } })
  if (!campaign) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  const e = await db.expense.create({ data: { campaignId: campaign.id, title: title.trim(), amount: BigInt(amount), type: 'field_expense', status: 'pending', submittedById: currentUser(req).id } })
  res.json(e)
})

app.get('/api/my/field-expenses', requireAuth, requireRole('tnv', 'admin'), async (req, res) => {
  const list = await db.expense.findMany({
    where: { submittedById: currentUser(req).id, type: 'field_expense' },
    orderBy: { createdAt: 'desc' }, include: { campaign: { select: { title: true } } },
  })
  res.json(list)
})

// ===== Điểm trường (beneficiaries) =====
app.get('/api/beneficiaries', requireAuth, async (_req, res) => {
  const list = await db.beneficiary.findMany({ orderBy: { createdAt: 'asc' }, include: { _count: { select: { distributions: true } } } })
  res.json(list.map((b) => ({ id: b.id, name: b.name, province: b.province, location: b.location, distributionCount: b._count.distributions })))
})
app.post('/api/beneficiaries', requireAuth, requireRole('tnv', 'admin'), async (req, res) => {
  const { name, province, location } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Thiếu tên điểm trường' })
  const b = await db.beneficiary.create({ data: { name: name.trim(), province: province ?? '', location: location ?? '' } })
  res.json(b)
})

// ===== TNV: Tổng quan hiện trường =====
app.get('/api/my/field', requireAuth, requireRole('tnv', 'admin'), async (req, res) => {
  const uid = currentUser(req).id
  const [batchesReceived, distributions, expenses, recent] = await Promise.all([
    db.inkindBatch.count({ where: { receivedById: uid } }),
    db.distribution.findMany({ where: { distributedById: uid } }),
    db.expense.findMany({ where: { submittedById: uid, type: 'field_expense' } }),
    db.distribution.findMany({ where: { distributedById: uid }, orderBy: { distributedAt: 'desc' }, take: 5, include: { batch: { select: { name: true, unit: true } }, beneficiary: { select: { name: true } } } }),
  ])
  res.json({
    batchesReceived,
    distributionCount: distributions.length,
    itemsGiven: distributions.reduce((s, d) => s + d.quantity, 0),
    expensePending: expenses.filter((e) => e.status === 'pending').length,
    expenseVerified: expenses.filter((e) => e.status === 'verified').reduce((s, e) => s + Number(e.amount), 0),
    recent: recent.map((d) => ({ id: d.id, item: d.batch.name, qty: d.quantity, unit: d.batch.unit, to: d.beneficiary.name, at: d.distributedAt })),
  })
})

// ===== Admin: Quản lý chiến dịch (CRUD) =====
const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)

interface MilestoneInput { label: string; dateLabel?: string; description?: string; state?: string }

app.get('/api/admin/campaigns/:slug', requireAuth, requireRole('admin'), async (req, res) => {
  const c = await db.campaign.findUnique({ where: { slug: req.params.slug }, include: { milestones: { orderBy: { orderIndex: 'asc' } } } })
  if (!c) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  res.json(c)
})

app.post('/api/admin/campaigns', requireAuth, requireRole('admin'), async (req, res) => {
  const { title, location, status, story, goalAmount, bannerEmoji, endDate, childrenHelped, milestones } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Thiếu tên chiến dịch' })
  const base = slugify(title) || 'chien-dich'
  let slug = base, i = 1
  while (await db.campaign.findUnique({ where: { slug } })) slug = `${base}-${i++}`
  const ms = (milestones as MilestoneInput[] | undefined) ?? []
  const c = await db.campaign.create({
    data: {
      title: title.trim(), slug, location: location ?? '', status: status ?? 'active', story: story ?? '',
      goalAmount: BigInt(goalAmount || 0), bannerEmoji: bannerEmoji || '🎒',
      endDate: endDate ? new Date(endDate) : null, childrenHelped: Number(childrenHelped) || 0,
      isVerified: true, createdById: currentUser(req).id,
      milestones: ms.length ? { create: ms.map((m, idx) => ({ label: m.label, dateLabel: m.dateLabel ?? '', description: m.description ?? '', state: m.state ?? 'todo', orderIndex: idx })) } : undefined,
    },
  })
  await db.auditLog.create({ data: { actorId: currentUser(req).id, action: 'create', entityType: 'Campaign', entityId: c.id, reason: 'Tạo chiến dịch' } })
  res.json(c)
})

app.put('/api/admin/campaigns/:slug', requireAuth, requireRole('admin'), async (req, res) => {
  const existing = await db.campaign.findUnique({ where: { slug: req.params.slug } })
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  const { title, location, status, story, goalAmount, bannerEmoji, endDate, childrenHelped, milestones } = req.body
  const c = await db.campaign.update({
    where: { id: existing.id },
    data: {
      title: title ?? existing.title, location: location ?? existing.location, status: status ?? existing.status,
      story: story ?? existing.story, goalAmount: goalAmount != null ? BigInt(goalAmount) : existing.goalAmount,
      bannerEmoji: bannerEmoji ?? existing.bannerEmoji, endDate: endDate ? new Date(endDate) : existing.endDate,
      childrenHelped: childrenHelped != null ? Number(childrenHelped) : existing.childrenHelped,
    },
  })
  if (Array.isArray(milestones)) {
    await db.campaignMilestone.deleteMany({ where: { campaignId: existing.id } })
    const ms = milestones as MilestoneInput[]
    if (ms.length) await db.campaignMilestone.createMany({ data: ms.map((m, idx) => ({ campaignId: existing.id, label: m.label, dateLabel: m.dateLabel ?? '', description: m.description ?? '', state: m.state ?? 'todo', orderIndex: idx })) })
  }
  await db.auditLog.create({ data: { actorId: currentUser(req).id, action: 'update', entityType: 'Campaign', entityId: existing.id, reason: 'Sửa chiến dịch' } })
  res.json(c)
})

app.delete('/api/admin/campaigns/:slug', requireAuth, requireRole('admin'), async (req, res) => {
  const existing = await db.campaign.findUnique({ where: { slug: req.params.slug } })
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy chiến dịch' })
  const id = existing.id
  await db.$transaction([
    db.distribution.deleteMany({ where: { batch: { campaignId: id } } }),
    db.inkindBatch.deleteMany({ where: { campaignId: id } }),
    db.donation.deleteMany({ where: { campaignId: id } }),
    db.expense.deleteMany({ where: { campaignId: id } }),
    db.campaignMilestone.deleteMany({ where: { campaignId: id } }),
    db.mediaAsset.deleteMany({ where: { ownerType: 'campaign', ownerId: id } }),
    db.campaign.delete({ where: { id } }),
  ])
  await db.auditLog.create({ data: { actorId: currentUser(req).id, action: 'void', entityType: 'Campaign', entityId: id, reason: 'Xóa chiến dịch' } })
  res.json({ ok: true })
})

// ===== Admin: Quản lý người dùng =====
app.get('/api/admin/users', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await db.user.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, fullName: true, email: true, role: true, createdAt: true } })
  const counts = await db.donation.groupBy({ by: ['donorId'], where: { status: 'success' }, _sum: { amount: true }, _count: true })
  res.json(users.map((u) => {
    const c = counts.find((x) => x.donorId === u.id)
    return { ...u, donated: Number(c?._sum.amount ?? 0n), donationCount: c?._count ?? 0 }
  }))
})

app.patch('/api/admin/users/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id)
  const { role } = req.body
  if (!['donor', 'tnv', 'admin'].includes(role)) return res.status(400).json({ error: 'Vai trò không hợp lệ' })
  if (id === currentUser(req).id && role !== 'admin') return res.status(400).json({ error: 'Không thể tự hạ quyền của chính mình' })
  const u = await db.user.update({ where: { id }, data: { role }, select: { id: true, fullName: true, role: true } })
  await db.auditLog.create({ data: { actorId: currentUser(req).id, action: 'update', entityType: 'User', entityId: id, reason: 'Đổi vai trò → ' + role } })
  res.json(u)
})

// ===== Phục vụ bản build frontend (cùng origin với API) =====
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../app/dist')
const indexHtml = path.join(distDir, 'index.html')
if (fs.existsSync(indexHtml)) {
  app.use(express.static(distDir))
  // SPA fallback: route không phải /api và không phải file tĩnh -> trả index.html
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(indexHtml)
    next()
  })
  console.log('📦 Đang phục vụ frontend từ', distDir)
}

// Error handler toàn cục — mọi lỗi route trả 500 JSON (server vẫn sống, không 502)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API error]', err)
  if (res.headersSent) return
  res.status(500).json({ error: 'Lỗi máy chủ: ' + (err?.message ?? 'không xác định') })
})

const PORT = Number(process.env.PORT) || 4000
app.listen(PORT, () => console.log(`🚀 "Cùng em đến trường" chạy tại http://localhost:${PORT}`))
