// Định dạng tiền tệ đồng nhất toàn app (NFR-Localization)
export const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n) + 'đ'

export const vndShort = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tỷ'
  if (n >= 1_000_000) return (n / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr'
  if (n >= 1_000) return (n / 1_000).toLocaleString('vi-VN') + 'k'
  return String(n)
}

export const pct = (a: number, b: number) => Math.min(100, Math.round((a / b) * 100))

// Ngày dài kiểu Việt, viết hoa đầu: "Thứ hai, 22 tháng 5, 2026"
export const dateLong = (d: Date = new Date()) => {
  const s = d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Thời gian tương đối: "2 phút trước", "3 giờ trước", "5 ngày trước"
export const timeAgo = (input: string | Date | null | undefined) => {
  if (!input) return ''
  const t = new Date(input).getTime()
  if (Number.isNaN(t)) return ''
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (s < 60) return 'vừa xong'
  const m = Math.floor(s / 60); if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60); if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24); if (d < 30) return `${d} ngày trước`
  const mo = Math.floor(d / 30); if (mo < 12) return `${mo} tháng trước`
  return `${Math.floor(mo / 12)} năm trước`
}
