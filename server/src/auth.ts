import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

// Khoá ký JWT:
// - Dev: dùng secret mặc định để chạy ngay.
// - Production có JWT_SECRET: dùng giá trị đó (NÊN làm — token sống qua các lần restart).
// - Production thiếu JWT_SECRET: tự sinh secret ngẫu nhiên mạnh + cảnh báo (không sập app),
//   nhưng người dùng sẽ bị đăng xuất mỗi khi server khởi động lại.
function resolveSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') {
    console.warn('[auth] ⚠️ JWT_SECRET chưa được đặt. Đang dùng secret ngẫu nhiên tạm thời — ' +
      'người dùng sẽ bị đăng xuất mỗi khi server khởi động lại. Hãy đặt JWT_SECRET trong biến môi trường.')
    return crypto.randomBytes(32).toString('hex')
  }
  return 'cung-em-den-truong-dev-secret'
}
const JWT_SECRET = resolveSecret()
const TOKEN_TTL = '7d'

export interface AuthUser {
  id: number
  email: string
  role: string
  fullName: string
}

export function signToken(u: AuthUser): string {
  return jwt.sign(u, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

// Gắn req.user nếu có token hợp lệ
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Chưa đăng nhập' })
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthUser
    ;(req as Request & { user: AuthUser }).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

// Yêu cầu vai trò cụ thể (dùng sau requireAuth)
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: AuthUser }).user
    if (!user) return res.status(401).json({ error: 'Chưa đăng nhập' })
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'Không đủ quyền truy cập' })
    next()
  }
}
