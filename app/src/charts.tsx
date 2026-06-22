// Biểu đồ SVG tự dựng (không phụ thuộc thư viện ngoài)

const fmtTr = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tỷ'
  if (n >= 1_000_000) return (n / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'tr'
  if (n >= 1_000) return Math.round(n / 1_000) + 'k'
  return String(n)
}

export const CHART_COLORS = ['#1f4fe0', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

export function BarChart({ data }: { data: { label: string; total: number }[] }) {
  const W = 320, H = 150, padB = 26, padT = 22
  const max = Math.max(1, ...data.map((d) => d.total))
  const bw = W / data.length
  const maxIdx = data.reduce((mi, d, i, arr) => (d.total > arr[mi].total ? i : mi), 0)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Biểu đồ quyên góp theo tháng">
      {data.map((d, i) => {
        const h = (d.total / max) * (H - padB - padT)
        const x = i * bw + bw * 0.22
        const w = bw * 0.56
        const y = H - padB - h
        const hot = i === maxIdx
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={Math.max(2, h)} rx={4} fill={hot ? '#1f4fe0' : '#bcd2ff'} />
            <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill={hot ? '#1f4fe0' : '#94a3b8'}>{fmtTr(d.total)}</text>
            <text x={x + w / 2} y={H - 9} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function DonutChart({ data, centerLabel, centerValue }: { data: { label: string; value: number }[]; centerLabel: string; centerValue: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const R = 52, C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#eef2f7" strokeWidth="16" />
        {data.map((d, i) => {
          const frac = d.value / total
          const dash = frac * C
          const el = (
            <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth="16" strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          )
          offset += dash
          return el
        })}
        <g className="rotate-90" style={{ transformOrigin: '70px 70px' }}>
          <text x="70" y="66" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1f2937">{centerValue}</text>
          <text x="70" y="80" textAnchor="middle" fontSize="8" fill="#94a3b8">{centerLabel}</text>
        </g>
      </svg>
      <div className="flex-1 space-y-1.5 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-slate-600 truncate flex-1">{d.label}</span>
            <b className="text-slate-800">{Math.round((d.value / total) * 100)}%</b>
          </div>
        ))}
      </div>
    </div>
  )
}

// Thanh thu — chi
export function FlowBar({ raised, disbursed }: { raised: number; disbursed: number }) {
  const pctD = raised ? Math.min(100, Math.round((disbursed / raised) * 100)) : 0
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-slate-500">Đã giải ngân</span>
        <span className="font-bold text-slate-700">{pctD}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
        <div className="h-full bg-rose-500" style={{ width: `${pctD}%` }} />
        <div className="h-full bg-emerald-500 flex-1" />
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
        <span>🔴 Đã chi {fmtTr(disbursed)}</span>
        <span>🟢 Số dư quỹ {fmtTr(raised - disbursed)}</span>
      </div>
    </div>
  )
}
