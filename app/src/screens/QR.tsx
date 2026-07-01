import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { ScanLine, Lock } from 'lucide-react'
import { useApp } from '../store'
import { vnd } from '../format'
import { Button, TopBar } from '../ui'

// Pseudo-QR: tạo ma trận từ chuỗi để trông giống mã QR thật (chỉ để demo)
function PseudoQR({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    const n = 21
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
    const arr: boolean[] = []
    for (let i = 0; i < n * n; i++) {
      h = (h * 1103515245 + 12345) >>> 0
      arr.push((h >>> 16) % 100 < 48)
    }
    return { n, arr }
  }, [seed])

  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= cells.n - 7 && y < 7) || (x < 7 && y >= cells.n - 7)

  return (
    <svg viewBox={`0 0 ${cells.n} ${cells.n}`} className="w-48 h-48">
      <rect width={cells.n} height={cells.n} fill="white" />
      {cells.arr.map((on, i) => {
        const x = i % cells.n, y = Math.floor(i / cells.n)
        if (finder(x, y)) return null
        return on ? <rect key={i} x={x} y={y} width={1} height={1} fill="#0f172a" /> : null
      })}
      {[[0, 0], [cells.n - 7, 0], [0, cells.n - 7]].map(([fx, fy], k) => (
        <g key={k}>
          <rect x={fx} y={fy} width={7} height={7} fill="#0f172a" />
          <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="white" />
          <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#1f4fe0" />
        </g>
      ))}
    </svg>
  )
}

export default function QR() {
  const nav = useNavigate()
  const { draft } = useApp()

  return (
    <div className="min-h-[100svh] app-canvas flex flex-col">
      <TopBar title="Quét mã thanh toán" back={`/donate/${draft.campaignId}`} />
      <div className="flex-1 flex flex-col items-center px-6 pt-6 text-center">
        <p className="text-ink-500 text-sm">Mở app ngân hàng và quét mã QR bên dưới để chuyển <b className="text-brand-700">{vnd(draft.amount)}</b></p>

        <div className="mt-5 p-4 bg-white rounded-3xl shadow-lg shadow-slate-200 ring-1 ring-slate-900/5 shadow-soft">
          <PseudoQR seed={draft.txnCode} />
        </div>

        <div className="mt-4 w-full max-w-xs bg-white rounded-2xl p-4 text-sm">
          <div className="flex justify-between py-1.5 border-b border-dashed border-slate-200"><span className="text-ink-500">Mã giao dịch</span><b>{draft.txnCode}</b></div>
          <div className="flex justify-between py-1.5"><span className="text-ink-500">Số tiền</span><b className="text-brand-700">{vnd(draft.amount)}</b></div>
        </div>

        <div className="mt-4 text-[12px] text-brand-700 bg-brand-50 rounded-xl px-3 py-2.5 flex items-start gap-2 text-left">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Đây là QR <b>giả lập</b> cho đồ án. Bấm nút bên dưới để mở trang “thanh toán” mô phỏng.</span>
        </div>

        <div className="mt-auto w-full py-6">
          <Button variant="ghost" onClick={() => nav('/pay')}><ScanLine className="w-4 h-4" /> Mô phỏng: Quét QR & mở trang thanh toán</Button>
        </div>
      </div>
    </div>
  )
}
