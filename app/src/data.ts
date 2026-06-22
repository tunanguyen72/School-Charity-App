// ====== Dữ liệu mẫu (mock) cho prototype/đồ án ======

export type Role = 'donor' | 'tnv' | 'admin'

export type CampaignStatus = 'urgent' | 'active' | 'done'

export interface Campaign {
  id: string
  title: string
  location: string
  status: CampaignStatus
  story: string
  raised: number
  goal: number
  donors: number
  daysLeft: number
  gradient: string          // tailwind gradient classes for the banner
  emoji: string
  verified: boolean
  inkindReceived: number    // số hiện vật đã nhận
  inkindGiven: number
  roadmap: { label: string; date: string; state: 'done' | 'now' | 'todo'; desc: string }[]
  topDonors: { name: string; amount: number; when: string; anon?: boolean }[]
  costs: { label: string; amount: number; icon: string }[]
}

export interface Txn {
  id: string
  kind: 'donation' | 'disburse' | 'inkind'
  who: string
  desc: string
  date: string
  amount: number          // tiền (âm = chi). 0 nếu là hiện vật
  inkindLabel?: string
  status: 'success' | 'verified' | 'pending'
}

export interface InkindBatch {
  id: string
  name: string
  emoji: string
  donor: string
  campaign: string
  unit: string
  total: number
  remaining: number       // tồn kho
  status: 'stored' | 'partial' | 'given'
}

export interface Notif {
  id: string
  group: 'Hôm nay' | 'Hôm qua' | 'Trước đó'
  icon: string
  tone: string
  title: string
  desc: string
  time?: string
}

export const me: Record<Role, { name: string; initials: string; roleLabel: string }> = {
  donor: { name: 'Cô Hương', initials: 'H', roleLabel: 'Nhà hảo tâm' },
  tnv: { name: 'Anh Khải', initials: 'K', roleLabel: 'Tình nguyện viên' },
  admin: { name: 'Chị Lan', initials: 'L', roleLabel: 'Admin / Điều phối' },
}

export const fundSummary = {
  totalRaised: 1_250_000_000,
  inkindSets: 450,
  projects: 12,
  childrenHelped: 850,
  disbursed: 850_000_000,
}

export const campaigns: Campaign[] = [
  {
    id: 'ban-mo',
    title: 'Xây trường cho em tại Bản Mo',
    location: 'Xín Mần, Hà Giang',
    status: 'urgent',
    story:
      'Tại Bản Mo, 45 em mầm non đang phải học trong căn nhà gỗ cũ kỹ, dột nát mỗi khi mưa về. Chiến dịch nhằm xây một điểm trường kiên cố, ấm áp để các em yên tâm đến lớp.',
    raised: 150_000_000,
    goal: 200_000_000,
    donors: 120,
    daysLeft: 45,
    gradient: 'from-blue-500 to-indigo-600',
    emoji: '🏫',
    verified: true,
    inkindReceived: 100,
    inkindGiven: 40,
    roadmap: [
      { label: 'Bắt đầu khảo sát', date: '05/2024', state: 'done', desc: 'Đã hoàn thành đánh giá hiện trạng & thiết kế.' },
      { label: 'Khai mạc gây quỹ', date: '06/2024', state: 'now', desc: 'Đang trong quá trình tiếp nhận đóng góp.' },
      { label: 'Dự kiến khởi công', date: '08/2024', state: 'todo', desc: 'Xây móng và tường bao.' },
    ],
    topDonors: [
      { name: 'Nguyễn Văn Hiếu', amount: 500_000, when: '3 giờ trước' },
      { name: 'Trần Minh Tâm', amount: 1_000_000, when: '5 giờ trước' },
      { name: 'Nhà hảo tâm', amount: 2_000_000, when: 'hôm qua', anon: true },
    ],
    costs: [
      { label: 'Mua vật liệu xây móng', amount: 45_000_000, icon: '🧱' },
      { label: 'Vận chuyển vật tư lên bản', amount: 8_000_000, icon: '🚚' },
    ],
  },
  {
    id: 'nam-pam',
    title: 'Điểm trường Nậm Pầm đang xuống cấp',
    location: 'Mù Cang Chải, Yên Bái',
    status: 'urgent',
    story:
      'Hơn 120 em học sinh đang phải học trong điều kiện tạm bợ, mái lá dột nát mỗi mùa mưa lũ. Cần gấp một mái trường an toàn.',
    raised: 425_000_000,
    goal: 500_000_000,
    donors: 310,
    daysLeft: 12,
    gradient: 'from-rose-500 to-orange-500',
    emoji: '⛰️',
    verified: true,
    inkindReceived: 60,
    inkindGiven: 0,
    roadmap: [
      { label: 'Khảo sát hiện trạng', date: '04/2024', state: 'done', desc: 'Hoàn tất.' },
      { label: 'Gây quỹ khẩn cấp', date: '06/2024', state: 'now', desc: 'Sắp đạt mục tiêu.' },
      { label: 'Khởi công', date: '07/2024', state: 'todo', desc: 'Dự kiến.' },
    ],
    topDonors: [{ name: 'Công ty TechCloud', amount: 5_000_000, when: '1 ngày trước' }],
    costs: [],
  },
  {
    id: 'tu-sach',
    title: 'Tủ sách yêu thương vùng biên giới',
    location: 'Mèo Vạc, Hà Giang',
    status: 'active',
    story: 'Cung cấp 10.000 cuốn sách và đồ dùng học tập cho trẻ em nghèo tại các điểm trường biên giới.',
    raised: 63_000_000,
    goal: 150_000_000,
    donors: 88,
    daysLeft: 60,
    gradient: 'from-emerald-500 to-teal-600',
    emoji: '📚',
    verified: true,
    inkindReceived: 200,
    inkindGiven: 120,
    roadmap: [
      { label: 'Lên danh sách điểm trường', date: '05/2024', state: 'done', desc: 'Đã chọn 8 điểm trường.' },
      { label: 'Gây quỹ & nhận sách', date: '06/2024', state: 'now', desc: 'Đang tiếp nhận.' },
      { label: 'Phân phối', date: '09/2024', state: 'todo', desc: 'Trao tận điểm trường.' },
    ],
    topDonors: [{ name: 'Nhóm thiện nguyện Hà Nội', amount: 3_000_000, when: '2 ngày trước' }],
    costs: [{ label: 'In ấn & đóng gói sách', amount: 5_000_000, icon: '📦' }],
  },
  {
    id: 'ao-am',
    title: 'Áo ấm mùa đông cho trẻ em nghèo',
    location: 'Mèo Vạc, Hà Giang',
    status: 'done',
    story: 'Đã trao 2.000 áo ấm cho trẻ em vùng cao trong mùa đông 2023.',
    raised: 215_000_000,
    goal: 200_000_000,
    donors: 540,
    daysLeft: 0,
    gradient: 'from-violet-500 to-fuchsia-600',
    emoji: '🧥',
    verified: true,
    inkindReceived: 2000,
    inkindGiven: 2000,
    roadmap: [
      { label: 'Gây quỹ', date: '10/2023', state: 'done', desc: 'Vượt mục tiêu.' },
      { label: 'Mua & may áo', date: '11/2023', state: 'done', desc: 'Hoàn tất.' },
      { label: 'Trao tặng', date: '12/2023', state: 'done', desc: 'Đã trao 2.000 áo.' },
    ],
    topDonors: [],
    costs: [{ label: 'Sản xuất áo ấm', amount: 180_000_000, icon: '🧵' }],
  },
]

export const transactions: Txn[] = [
  { id: 'TXN12345', kind: 'donation', who: 'Nguyễn Văn A', desc: 'Quyên góp tiền mặt', date: '20/05/2024', amount: 500_000, status: 'success' },
  { id: 'TXN12346', kind: 'disburse', who: 'Ban điều hành', desc: 'Giải ngân dự án Điện Biên', date: '19/05/2024', amount: -15_000_000, status: 'verified' },
  { id: 'TXN12347', kind: 'inkind', who: 'Trần Thị B', desc: 'Đóng góp hiện vật', date: '18/05/2024', amount: 0, inkindLabel: '100 bộ sách', status: 'success' },
  { id: 'TXN12348', kind: 'donation', who: 'Công ty TechCloud', desc: 'Quyên góp hàng tháng', date: '17/05/2024', amount: 2_500_000, status: 'success' },
  { id: 'TXN12349', kind: 'disburse', who: 'Ban điều hành', desc: 'Mua vật liệu Bản Mo', date: '15/05/2024', amount: -45_000_000, status: 'verified' },
]

export const inkind: InkindBatch[] = [
  { id: 'IK1', name: 'Sách giáo khoa', emoji: '📚', donor: 'Công ty TechCloud', campaign: 'Xây trường Bản Mo', unit: 'bộ', total: 100, remaining: 100, status: 'stored' },
  { id: 'IK2', name: 'Áo ấm mùa đông', emoji: '🧥', donor: 'Nhóm thiện nguyện Hà Nội', campaign: 'Áo ấm mùa đông', unit: 'cái', total: 200, remaining: 80, status: 'partial' },
  { id: 'IK3', name: 'Bộ dụng cụ học tập', emoji: '✏️', donor: 'Nguyễn Thị B', campaign: 'Tủ sách yêu thương', unit: 'bộ', total: 150, remaining: 0, status: 'given' },
]

export const notifications: Notif[] = [
  { id: 'n1', group: 'Hôm nay', icon: '💝', tone: 'bg-emerald-100 text-emerald-600', title: 'Quyên góp thành công', desc: 'Cảm ơn bạn đã đóng góp 500.000đ cho chiến dịch Bản Mo.', time: '10:30' },
  { id: 'n2', group: 'Hôm nay', icon: '📢', tone: 'bg-brand-100 text-brand-600', title: 'Cập nhật chiến dịch', desc: 'Dự án Áo ấm vùng cao đã hoàn thành 80% kế hoạch.', time: '08:45' },
  { id: 'n3', group: 'Hôm qua', icon: '✅', tone: 'bg-emerald-100 text-emerald-600', title: 'Giao dịch đã xác minh', desc: 'Giao dịch chuyển khoản của bạn đã được đối soát với sao kê.' },
  { id: 'n4', group: 'Trước đó', icon: '📊', tone: 'bg-slate-100 text-slate-600', title: 'Báo cáo minh bạch mới', desc: 'Quỹ vừa công bố báo cáo thu chi tháng 05/2024.' },
]

export const quickAmounts = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000]
