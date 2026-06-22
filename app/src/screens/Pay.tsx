import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Landmark, Loader2, CheckCircle2 } from 'lucide-react'
import { useApp } from '../store'
import { api } from '../api'
import { vnd } from '../format'

export default function Pay() {
  const nav = useNavigate()
  const { draft } = useApp()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [err, setErr] = useState('')

  const confirm = async () => {
    setState('loading'); setErr('')
    try {
      await api.confirmDonation(draft.txnCode) // gọi backend → ghi nhận quyên góp thật
      setState('done')
      setTimeout(() => nav('/success'), 900)
    } catch (e) {
      setErr((e as Error).message)
      setState('idle')
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-brand-800 to-brand-900 text-white flex flex-col">
      {/* fake browser bar */}
      <div className="bg-black/25 px-4 py-2.5 flex items-center gap-2 text-[11px] text-white/70">
        <Lock className="w-3.5 h-3.5" /> pay.cungemdentruong.vn
        <span className="ml-auto px-1.5 py-0.5 bg-white/10 rounded">trang web giả lập</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-7 text-center">
        {state === 'done' ? (
          <div className="animate-pop">
            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-extrabold mt-4">Chuyển khoản thành công</h2>
            <p className="text-white/70 mt-1">Đang đưa bạn về ứng dụng...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-white/10 grid place-items-center"><Landmark className="w-10 h-10" /></div>
            <h2 className="text-xl font-extrabold mt-4">Cổng thanh toán (giả lập)</h2>
            <div className="w-full bg-white/10 rounded-3xl p-5 mt-6">
              <div className="text-[13px] text-white/70">Số tiền chuyển</div>
              <div className="text-[34px] font-extrabold">{vnd(draft.amount)}</div>
              <div className="text-[12px] text-white/70 mt-2 leading-relaxed">
                Tới: <b className="text-white">QUỸ CÙNG EM ĐẾN TRƯỜNG</b><br />Nội dung: {draft.txnCode}
              </div>
            </div>
            <button onClick={confirm} disabled={state === 'loading'}
              className="w-full mt-6 rounded-2xl py-3.5 font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 active:scale-[.98] flex items-center justify-center gap-2 disabled:opacity-70">
              {state === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin-slow" /> Đang xử lý...</> : '✅ Xác nhận đã chuyển khoản'}
            </button>
            {err && <p className="text-[12px] text-rose-200 mt-3">⚠️ {err}</p>}
            <p className="text-[11px] text-white/50 mt-4">Sau khi xác nhận, ứng dụng sẽ tự động ghi nhận quyên góp.</p>
          </>
        )}
      </div>
    </div>
  )
}
