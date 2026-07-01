import { Outlet } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useApp } from '../../store'
import { TopBar } from '../../ui'

export default function AdminLayout() {
  const { user } = useApp()
  if (user?.role !== 'admin')
    return (
      <div className="min-h-[100svh] app-canvas">
        <TopBar title="Quản trị" back="/home" />
        <div className="flex flex-col items-center justify-center py-20 text-ink-400 gap-2 px-8 text-center">
          <Lock className="w-9 h-9" />
          <p className="text-sm">Khu vực quản trị chỉ dành cho <b>Admin</b>. Hãy đăng nhập bằng tài khoản quản trị.</p>
        </div>
      </div>
    )
  return <Outlet />
}
