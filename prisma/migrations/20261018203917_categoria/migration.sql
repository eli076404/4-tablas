-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriaToContacto" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoriaToContacto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE INDEX "_CategoriaToContacto_B_index" ON "_CategoriaToContacto"("B");

-- AddForeignKey
ALTER TABLE "_CategoriaToContacto" ADD CONSTRAINT "_CategoriaToContacto_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToContacto" ADD CONSTRAINT "_CategoriaToContacto_B_fkey" FOREIGN KEY ("B") REFERENCES "Contacto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
