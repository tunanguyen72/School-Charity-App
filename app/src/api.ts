// ====== API client: nối frontend với backend Express ======
// Mặc định gọi cùng origin ('/api') — chạy được cho cả dev (qua proxy Vite),
// bản build do Express phục vụ, lẫn khi deploy/tunnel. Có thể override bằng VITE_API_URL.
const BASE = import.meta.env.VITE_API_URL ?? '/api'

const TOKEN_KEY = 'cedt_token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const COLD = 'Máy chủ đang khởi động, vui lòng thử lại sau giây lát.'

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const method = (opts.method ?? 'GET').toUpperCase()
  // GET tự thử lại khi server "ngủ" (cold start) trả 502/503/504 hoặc lỗi mạng
  const maxTries = method === 'GET' ? 4 : 1

  for (let attempt = 1; attempt <= maxTries; attempt++) {
    let res: Response
    try {
      res = await fetch(BASE + path, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(opts.headers ?? {}),
        },
      })
    } catch {
      // lỗi mạng (server chưa dậy)
      if (attempt < maxTries) { await sleep(attempt * 1500); continue }
      throw new Error(COLD)
    }

    if (res.ok) return res.json()

    // 502/503/504 = server đang khởi động/quá tải -> thử lại (GET) hoặc báo thân thiện
    if ([502, 503, 504].includes(res.status)) {
      if (attempt < maxTries) { await sleep(attempt * 1500); continue }
      throw new Error(COLD)
    }

    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Lỗi ${res.status}`)
  }
  throw new Error(COLD)
}

// ---- Kiểu dữ liệu thô từ API ----
export interface ApiUser { id: number; email: string; role: 'donor' | 'tnv' | 'admin'; fullName: string }
interface ApiCampaign {
  id: number; title: string; slug: string; location: string; status: string; story: string
  goalAmount: string; raisedAmount: string; donorCount: number; inkindReceived: number; inkindGiven: number
  endDate: string | null; bannerEmoji: string | null; isVerified: boolean
  milestones?: { label: string; dateLabel: string; description: string | null; state: string }[]
  donations?: { amount: string; isAnonymous: boolean; confirmedAt: string | null; donor: { fullName: string } }[]
  expenses?: { title: string; amount: string }[]
}

// ---- Shape cho UI ----
const GRADIENTS: Record<string, string> = {
  'ban-mo': 'from-blue-500 to-indigo-600',
  'tu-sach': 'from-emerald-500 to-teal-600',
  'ao-am': 'from-violet-500 to-fuchsia-600',
  'nam-pam': 'from-rose-500 to-orange-500',
}
const gradientFor = (slug: string, status: string) =>
  GRADIENTS[slug] ?? (status === 'urgent' ? 'from-rose-500 to-orange-500' : status === 'done' ? 'from-violet-500 to-fuchsia-600' : 'from-blue-500 to-indigo-600')

const daysLeft = (end: string | null) => {
  if (!end) return 0
  return Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86_400_000))
}
const costIcon = (title: string) =>
  /vận chuyển|xe|chở/i.test(title) ? '🚚' : /sách|in/i.test(title) ? '📦' : /bàn|ghế|vật liệu|xây/i.test(title) ? '🧱' : '🧾'

export interface UICampaign {
  id: string; title: string; location: string; status: string; story: string
  raised: number; goal: number; donors: number; daysLeft: number
  gradient: string; emoji: string; verified: boolean; inkindReceived: number; inkindGiven: number
  roadmap: { label: string; date: string; desc: string; state: string }[]
  topDonors: { name: string; amount: number; when: string; anon: boolean }[]
  costs: { label: string; amount: number; icon: string }[]
}

function adaptCampaign(c: ApiCampaign): UICampaign {
  return {
    id: c.slug, title: c.title, location: c.location, status: c.status, story: c.story,
    raised: Number(c.raisedAmount), goal: Number(c.goalAmount), donors: c.donorCount, daysLeft: daysLeft(c.endDate),
    gradient: gradientFor(c.slug, c.status), emoji: c.bannerEmoji ?? '🏫', verified: c.isVerified,
    inkindReceived: c.inkindReceived, inkindGiven: c.inkindGiven,
    roadmap: (c.milestones ?? []).map((m) => ({ label: m.label, date: m.dateLabel, desc: m.description ?? '', state: m.state })),
    topDonors: (c.donations ?? []).map((d) => ({
      name: d.donor.fullName, amount: Number(d.amount), anon: d.isAnonymous,
      when: d.confirmedAt ? new Date(d.confirmedAt).toLocaleDateString('vi-VN') : 'gần đây',
    })),
    costs: (c.expenses ?? []).map((e) => ({ label: e.title, amount: Number(e.amount), icon: costIcon(e.title) })),
  }
}

// ---- Các hàm API ----
export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (fullName: string, email: string, password: string, role: 'donor' | 'tnv') =>
    request<{ token: string; user: ApiUser }>('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password, role }) }),

  summary: () => request<{ totalRaised: string; disbursed: string; inkindSets: number; projects: number }>('/summary'),

  campaigns: (status?: string) =>
    request<ApiCampaign[]>(`/campaigns${status && status !== 'all' ? `?status=${status}` : ''}`).then((l) => l.map(adaptCampaign)),
  campaign: (slug: string) => request<ApiCampaign>(`/campaigns/${slug}`).then(adaptCampaign),

  createDonation: (campaignSlug: string, amount: number, message: string, isAnonymous: boolean) =>
    request<{ txnCode: string; amount: string }>('/donations', { method: 'POST', body: JSON.stringify({ campaignSlug, amount, message, isAnonymous }) }),
  confirmDonation: (txnCode: string) =>
    request<{ txnCode: string; status: string }>(`/donations/${txnCode}/confirm`, { method: 'POST' }),

  inventory: () =>
    request<{ id: number; name: string; category: string; donorName: string; unit: string; quantityTotal: number; quantityRemaining: number; status: string }[]>('/inventory'),
  receiveInventory: (payload: { name: string; category: string; donorName: string; campaignSlug: string; unit: string; quantity: number }) =>
    request('/inventory', { method: 'POST', body: JSON.stringify(payload) }),

  ledger: () =>
    request<{ kind: string; code: string; who: string; amount: string; label?: string; status: string; at: string | null }[]>('/ledger'),

  notifications: () =>
    request<{ id: number; type: string; title: string; body: string | null; createdAt: string }[]>('/notifications'),

  myStats: () => request<{ totalDonated: string; donationCount: number; projectCount: number }>('/me/stats'),

  stats: () => request<Stats>('/stats'),

  // ----- Quản trị (Admin) -----
  adminExpenses: () =>
    request<AdminExpense[]>('/expenses'),
  createExpense: (campaignSlug: string, title: string, amount: number, type: string) =>
    request<{ id: number }>('/expenses', { method: 'POST', body: JSON.stringify({ campaignSlug, title, amount, type }) }),
  verifyExpense: (id: number) =>
    request(`/expenses/${id}/verify`, { method: 'POST' }),
  rejectExpense: (id: number) =>
    request(`/expenses/${id}/reject`, { method: 'POST' }),

  // ----- Quản trị: Chiến dịch (CRUD) -----
  adminCampaign: (slug: string) => request<AdminCampaign>(`/admin/campaigns/${slug}`),
  createCampaign: (data: CampaignInput) => request<{ slug: string }>('/admin/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (slug: string, data: CampaignInput) => request<{ slug: string }>(`/admin/campaigns/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCampaign: (slug: string) => request(`/admin/campaigns/${slug}`, { method: 'DELETE' }),

  // ----- Quản trị: Người dùng -----
  adminUsers: () => request<AdminUser[]>('/admin/users'),
  setUserRole: (id: number, role: string) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
}

export interface MilestoneInput { label: string; dateLabel: string; description?: string; state: string }
export interface CampaignInput {
  title: string; location: string; status: string; story: string; goalAmount: number
  bannerEmoji: string; endDate?: string | null; childrenHelped: number; milestones?: MilestoneInput[]
}
export interface AdminCampaign {
  slug: string; title: string; location: string; status: string; story: string; goalAmount: string
  bannerEmoji: string | null; endDate: string | null; childrenHelped: number
  milestones: { label: string; dateLabel: string; description: string | null; state: string }[]
}
export interface AdminUser {
  id: number; fullName: string; email: string; role: string; createdAt: string; donated: number; donationCount: number
}

export interface AdminExpense {
  id: number; title: string; amount: string; type: string; status: string; createdAt: string
  campaign: { title: string }; submittedBy: { fullName: string }
}

export interface Stats {
  overview: {
    totalRaised: number; totalDisbursed: number; balance: number; disbursementRate: number
    donationCount: number; donorCount: number; avgDonation: number; childrenHelped: number
    schools: number; inkindTotal: number; inkindGiven: number; campaignsActive: number; campaignsDone: number
  }
  monthly: { label: string; total: number; count: number }[]
  byCampaign: { slug: string; title: string; emoji: string | null; status: string; raised: number; goal: number; donors: number }[]
  topDonors: { name: string; total: number; count: number }[]
}
