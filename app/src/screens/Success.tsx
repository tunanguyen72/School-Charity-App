import { useNavigate } from 'react-router-dom'
import { CheckCircle2, BadgeCheck, Home, FileText } from 'lucide-react'
import { useApp } from '../store'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd } from '../format'
import { Button } from '../ui'

export default function Success() {
  const nav = useNavigate()
  const { draft } = useApp()
  const { data: c } = useFetch(() => api.campaign(draft.campaignId), [draft.campaignId])

  return (
    <div className="min-h-[100svh] bg-slate-50 flex flex-col">
      <div className="h-14 grid place-items-center bg-white border-b border-slate-100 font-bold text-brand-700">Cùng em đến trường</div>
      <div className="text-center px-6 pt-8 animate-slide-up">
        <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 grid place-items-center animate-pop">
          <CheckCircle2 className="w-14 h-14 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-emerald-600 mt-4">Quyên góp thành công!</h1>
        <p className="text-slate-500 text-sm mt-2 px-3">Cảm ơn bạn đã đồng hành cùng các em trên hành trình đến trường 💚</p>
      </div>

      <div className="mx-5 mt-6 bg-white rounded-3xl p-5 text-sm animate-slide-up">
        {[['Chiến dịch', c?.title ?? '—'], ['Hình thức', 'Tiền mặt (QR)'], ['Số tiền', vnd(draft.amount), true], ['Mã giao dịch', draft.txnCode], ['Hiển thị', draft.anonymous ? 'Ẩn danh' : 'Công khai']].map(([k, v, hl], i) => (
          <div key={i} className="flex justify-between py-2.5 border-b border-dashed border-slate-100 last:border-0">
            <span className="text-slate-500">{k as string}</span>
            <b className={hl ? 'text-emerald-600' : 'text-slate-800'}>{v as string}</b>
          </div>
        ))}
        <div className="flex justify-between items-center py-2.5">
          <span className="text-slate-500">Trạng thái</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[13px]"><BadgeCheck className="w-4 h-4" /> Đã xác minh tự động</span>
        </div>
      </div>

      <div className="px-5 mt-auto pb-6 pt-4 space-y-2.5">
        <Button variant="success" onClick={() => nav('/home')}><Home className="w-4 h-4" /> Về trang chủ</Button>
        <Button variant="ghost"><FileText className="w-4 h-4" /> Xem biên nhận điện tử</Button>
      </div>
    </div>
  )
}
