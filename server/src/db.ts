import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()

// SQLite/Prisma trả BigInt cho cột tiền; Express res.json không serialize được BigInt.
// Patch: chuyển BigInt → string khi JSON hóa (frontend tự parse Number).
;(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString()
}
