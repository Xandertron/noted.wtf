-- CreateTable
CREATE TABLE "Paste" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "modifyKey" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Paste_id_key" ON "Paste"("id");
