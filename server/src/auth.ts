import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Đồ án: secret để cứng. Production nên đặt trong biến môi trường.
const JWT_SECRET = process.env.JWT_SECRET ?? 'cung-em-den-truong-dev-secret'
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
