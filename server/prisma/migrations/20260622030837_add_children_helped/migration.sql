-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "story" TEXT NOT NULL,
    "goalAmount" BIGINT NOT NULL,
    "raisedAmount" BIGINT NOT NULL DEFAULT 0,
    "donorCount" INTEGER NOT NULL DEFAULT 0,
    "inkindReceived" INTEGER NOT NULL DEFAULT 0,
    "inkindGiven" INTEGER NOT NULL DEFAULT 0,
    "childrenHelped" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "bannerEmoji" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Campaign" ("bannerEmoji", "createdAt", "createdById", "donorCount", "endDate", "goalAmount", "id", "inkindGiven", "inkindReceived", "isVerified", "location", "raisedAmount", "slug", "startDate", "status", "story", "title", "updatedAt") SELECT "bannerEmoji", "createdAt", "createdById", "donorCount", "endDate", "goalAmount", "id", "inkindGiven", "inkindReceived", "isVerified", "location", "raisedAmount", "slug", "startDate", "status", "story", "title", "updatedAt" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
