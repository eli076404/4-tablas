-- CreateTable
CREATE TABLE "Perfil" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "contactoId" INTEGER NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_contactoId_key" ON "Perfil"("contactoId");

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_contactoId_fkey" FOREIGN KEY ("contactoId") REFERENCES "Contacto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
