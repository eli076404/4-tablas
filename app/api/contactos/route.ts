import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("busca") || "";

  const contactos = await prisma.contacto.findMany({
    where: q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { telefono: { contains: q, mode: "insensitive" } },
            // También buscamos dentro de la tabla relacionada
            { perfil: { direccion: { contains: q, mode: "insensitive" } } },
            { perfil: { ciudad: { contains: q, mode: "insensitive" } } },
            { perfil: { pais: { contains: q, mode: "insensitive" } } },
            // some = "que tenga AL MENOS UNA nota" que contenga el texto
            { notas: { some: { texto: { contains: q, mode: "insensitive" } } } },
            // el N:M se filtra con el mismo some: la tabla intermedia es invisible
            { categorias: { some: { nombre: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: { creado: "asc" },
    include: {
      perfil: true, // cada contacto llega con su perfil (o null)
      notas: { orderBy: { createdAt: "desc" } }, // y con su array de notas
      categorias: { orderBy: { nombre: "asc" } }, // y con sus categorias
    },
  });

  return NextResponse.json(contactos);
}

export async function DELETE(req: Request) {
  let respuesta: any;
  try {
    const { miid } = await req.json();
    // El onDelete: Cascade del schema borra también su perfil
    await prisma.contacto.delete({ where: { id: miid } });
    respuesta = { ok: true };
  } catch (error: any) {
    respuesta = {
      ok: false,
      error: "no podido borrar contacto, code: " + error.code,
    };
  }

  return NextResponse.json(respuesta);
}
