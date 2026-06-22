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
