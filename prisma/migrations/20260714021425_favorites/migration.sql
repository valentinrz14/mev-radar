-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caratula" TEXT NOT NULL,
    "organismoName" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "nroExpediente" TEXT NOT NULL,
    "fechaInicio" TEXT NOT NULL,
    "nidCausa" TEXT NOT NULL,
    "pidJuzgado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_nidCausa_pidJuzgado_key" ON "Favorite"("userId", "nidCausa", "pidJuzgado");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
