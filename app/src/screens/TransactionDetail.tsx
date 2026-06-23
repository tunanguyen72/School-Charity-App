import { useParams } from 'react-router-dom'
import { CheckCircle2, BadgeCheck, Info, Landmark } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd } from '../format'
import { TopBar, Loading, ErrorBox } from '../ui'

export default function TransactionDetail() {
  const { id } = useParams()
  const { data: ledger, loading, error } = useFetch(() => api.ledger(), [])
  const t = ledger?.find((x) => x.code === id)

  if (loading) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Chi tiết giao dịch" back /><Loading /></div>
  if (error || !t) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Chi tiết giao dịch" back /><ErrorBox message={error ?? 'Không tìm thấy giao dịch'} /></div>

  const amt = Number(t.amount)
  const isCost = amt < 0
  const dateStr = t.at ? new Date(t.at).toLocaleString('vi-VN') : '—'

  return (
    <div className="min-h-[100svh] bg-slate-50">
      <TopBar title="Chi tiết giao dịch" back />
      <div className="text-center pt-7">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-pop" />
        <div className="text-slate-400 text-sm mt-2">Giao dịch {t.status === 'verified' ? 'đã xác minh' : 'thành công'}</div>
        <div className={`text-2xl font-extrabold ${isCost ? 'text-rose-600' : 'text-emerald-600'}`}>
          {t.kind === 'inkind' ? t.label : `${isCost ? '-' : '+'}${vnd(Math.abs(amt))}`}
        </div>
      </div>

      <div className="mx-5 mt-6 bg-white rounded-3xl p-5 text-sm">
        {[['Mã giao dịch', t.code], ['Thời gian', dateStr], ['Loại', t.kind === 'donation' ? 'Quyên góp' : t.kind === 'expense' ? 'Giải ngân' : 'Hiện vật'], [isCost ? 'Người nhận' : 'Người gửi', t.who]].map(([k, v], i) => (
          <div key={i} className="flex justify-between py-2.5 border-b border-dashed border-slate-100"><span className="text-slate-500">{k}</span><b className="text-slate-800 text-right">{v}</b></div>
        ))}
        <div className="flex justify-between items-center py-2.5">
          <span className="text-slate-500">Trạng thái</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[13px]"><BadgeCheck className="w-4 h-4" /> {t.status === 'verified' ? 'Đã xác minh' : 'Thành công'}</span>
        </div>
      </div>

      <h3 className="font-extrabold text-slate-800 px-5 mt-5 mb-2">Minh chứng giao dịch</h3>
      <div className="mx-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 font-bold text-slate-700 mb-2"><Landmark className="w-4 h-4 text-brand-600" /> BANK — CHUYỂN TIỀN THÀNH CÔNG</div>
        {[['Số tiền', t.kind === 'inkind' ? '—' : vnd(Math.abs(amt))], ['Thời gian', dateStr], ['Đối tác', t.who], ['Mã', t.code]].map(([k, v], i) => (
          <div key={i} className="flex justify-between text-[12px] py-1 border-b border-dashed border-slate-100 last:border-0"><span className="text-slate-500">{k}</span><b>{v}</b></div>
        ))}
      </div>

      <div className="mx-5 my-5 text-[12px] text-slate-500 bg-slate-100 rounded-xl px-3 py-3 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-brand-600" /> Giao dịch được ghi nhận minh bạch và kiểm tra tự động.
      </div>
    </div>
  )
}
