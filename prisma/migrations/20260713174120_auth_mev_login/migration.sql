-- DropTable (fusionamos las credenciales MEV dentro de User)
DROP TABLE "MevCredential";

-- AlterTable: email y passwordHash pasan a opcionales (solo admin), se agregan campos MEV
ALTER TABLE "User"
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ADD COLUMN "mevUsuario" TEXT,
  ADD COLUMN "mevClaveEncrypted" TEXT,
  ADD COLUMN "mevDeptoRegistrado" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mevUsuario_key" ON "User"("mevUsuario");
