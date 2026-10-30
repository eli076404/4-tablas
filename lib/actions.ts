"use server";

import { prisma } from "./prisma";

// Los datos del perfil (la segunda tabla). No llevan id ni contactoId:
// de eso se encarga Prisma al guardar la relación.
interface PerfilInput {
  direccion: string;
  ciudad: string;
  pais: string;
}

interface ContactoInput {
  nombre: string;
  email: string;
  telefono: string;
  perfil?: PerfilInput | null; // opcional: un contacto puede no tener perfil
  categoriasIds?: number[]; // los ids que vienen marcados en el formulario
}

export async function getContactos(q = "") {
  return prisma.contacto.findMany({
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
    orderBy: { creado: "desc" },
    include: {
      perfil: true, // trae el perfil de cada contacto (o null)
      notas: { orderBy: { createdAt: "desc" } }, // array de notas, la mas nueva primero
      categorias: { orderBy: { nombre: "asc" } }, // array de categorias asignadas
    },
  });
}

export async function crearContacto({
  perfil,
  categoriasIds,
  ...contacto
}: ContactoInput) {
  try {
    const contactoNuevo = await prisma.contacto.create({
      // create anidado: crea la fila de Contacto y la de Perfil de una vez
      data: {
        ...contacto,
        perfil: perfil ? { create: perfil } : undefined,
        // connect: enlaza con las categorias que ya existen en el catalogo
        categorias: categoriasIds
          ? { connect: categoriasIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { perfil: true, notas: true, categorias: true },
    });
    return contactoNuevo;
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "El email ya existe" };
    }
    return { error: "El contacto no ha podido crearse, error: " + error.code };
  }
}

export async function borrarContacto(miid: number) {
  try {
    // No hace falta borrar el perfil: el onDelete: Cascade del schema lo borra
    await prisma.contacto.delete({ where: { id: miid } });
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      error: "no podido borrar contacto, code: " + error.code,
    };
  }
}

export async function borrarPerfil(contactoId: number) {
  try {
    // Borra solo la fila de Perfil; el contacto se queda sin perfil
    await prisma.perfil.delete({ where: { contactoId } });
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      error: "no podido borrar el perfil, code: " + error.code,
    };
  }
}

export async function actualizarContacto(
  id: number,
  { perfil, categoriasIds, ...datos }: ContactoInput
) {
  try {
    const contacto = await prisma.contacto.update({
      where: { id },
      // upsert anidado: si ya tiene perfil lo modifica, si no lo crea
      data: {
        ...datos,
        perfil: perfil
          ? { upsert: { create: perfil, update: perfil } }
          : undefined,
        // set: reemplaza TODAS las categorias por las marcadas en el formulario
        categorias: categoriasIds
          ? { set: categoriasIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { perfil: true, notas: true, categorias: true },
    });
    return { data: contacto };
  } catch (error: any) {
    if (error.code === "P2025") return { error: "contacto no encontrado" };
    if (error.code === "P2002") return { error: "El email ya existe" };
    return { error: "Error al actualizar el contacto, código: " + error.code };
  }
}

// ---------- Notas (tercera tabla, relación 1:N) ----------
// Cada nota pertenece a un contacto, así que siempre viaja con su contactoId.

export async function crearNota(contactoId: number, texto: string) {
  try {
    // connect: enlaza la nota con un contacto que YA existe
    const notaNueva = await prisma.nota.create({
      data: { texto, contacto: { connect: { id: contactoId } } },
    });
    return notaNueva;
  } catch (error: any) {
    if (error.code === "P2025") return { error: "El contacto no existe" };
    return { error: "La nota no ha podido crearse, error: " + error.code };
  }
}

export async function actualizarNota(id: number, texto: string) {
  try {
    const nota = await prisma.nota.update({ where: { id }, data: { texto } });
    return { data: nota };
  } catch (error: any) {
    if (error.code === "P2025") return { error: "nota no encontrada" };
    return { error: "Error al actualizar la nota, código: " + error.code };
  }
}

export async function borrarNota(miid: number) {
  try {
    await prisma.nota.delete({ where: { id: miid } });
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      error: "no podido borrar la nota, code: " + error.code,
    };
  }
}

// ---------- Categorías (cuarta tabla, relación N:M) ----------
// Una categoría NO pertenece a un contacto: existe por su cuenta y se comparte.
// Por eso tiene su propio CRUD, separado del de asignarla o quitarla.

interface CategoriaInput {
  nombre: string;
  color: string;
}

export async function getCategorias() {
  return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
}

export async function crearCategoria(datos: CategoriaInput) {
  try {
    const categoriaNueva = await prisma.categoria.create({ data: datos });
    return categoriaNueva;
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Ya existe una categoría con ese nombre" };
    }
    return { error: "La categoría no ha podido crearse, error: " + error.code };
  }
}

export async function actualizarCategoria(id: number, datos: CategoriaInput) {
  try {
    const categoria = await prisma.categoria.update({ where: { id }, data: datos });
    return { data: categoria };
  } catch (error: any) {
    if (error.code === "P2025") return { error: "categoría no encontrada" };
    if (error.code === "P2002") return { error: "Ya existe una categoría con ese nombre" };
    return { error: "Error al actualizar la categoría, código: " + error.code };
  }
}

export async function borrarCategoria(miid: number) {
  try {
    // Al borrar la categoría, sus filas de la tabla intermedia se van solas:
    // los contactos NO se borran, solo dejan de estar etiquetados
    await prisma.categoria.delete({ where: { id: miid } });
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      error: "no podido borrar la categoría, code: " + error.code,
    };
  }
}
