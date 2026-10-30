import { actualizarContacto, crearContacto } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Categoria, Contacto } from "../page";
import Swal from "sweetalert2";
import { SelectorCategorias } from "./SelectorCategorias";

interface FormuProps {
  edicionOK: () => void;
  nuevo: (nuevoContacto: Contacto) => void;
  contacto: Contacto | null;
  categorias: Categoria[]; // el catálogo completo, para pintar los badges
}

interface Error {
  error: string;
}

type Respuesta = Contacto | Error;

export const FormuContacto = ({
  nuevo,
  contacto,
  edicionOK,
  categorias,
}: FormuProps) => {
  const [nombre, setNombre] = useState(contacto?.nombre || "");
  const [email, setEmail] = useState(contacto?.email || "");
  const [telefono, setTelefono] = useState(contacto?.telefono || "");
  // Campos de la segunda tabla (Perfil)
  const [direccion, setDireccion] = useState(contacto?.perfil?.direccion || "");
  const [ciudad, setCiudad] = useState(contacto?.perfil?.ciudad || "");
  const [pais, setPais] = useState(contacto?.perfil?.pais || "");
  // Ids de las categorías marcadas. Solo viven aquí hasta que se guarda.
  const [categoriasIds, setCategoriasIds] = useState<number[]>(
    contacto?.categorias.map((c) => c.id) || []
  );

  // Marca si no estaba y desmarca si estaba
  function alternarCategoria(categoriaId: number) {
    setCategoriasIds((ids) =>
      ids.includes(categoriaId)
        ? ids.filter((id) => id !== categoriaId)
        : [...ids, categoriaId]
    );
  }

  async function enviaFormulario(e: React.SubmitEvent) {
    e.preventDefault();

    // Si los tres campos del perfil están vacíos mandamos null:
    // así el contacto se guarda sin perfil
    const perfil =
      direccion.trim() || ciudad.trim() || pais.trim()
        ? { direccion, ciudad, pais }
        : null;

    // Si han borrado una categoría del panel mientras editábamos, su id
    // sigue en el estado pero ya no está en el catálogo: lo descartamos
    const idsValidos = categoriasIds.filter((id) =>
      categorias.some((c) => c.id === id)
    );

    if (contacto) {
      // Modificar un contacto
      const respuesta: any = await actualizarContacto(contacto.id, {
        nombre,
        email,
        telefono,
        perfil,
        categoriasIds: idsValidos,
      });
      if ("error" in respuesta) {
        const { isConfirmed } = await Swal.fire({
          title: respuesta.error,
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "Aceptar",
        });
      } else {
        const { isConfirmed } = await Swal.fire({
          title: "contacto modificado correctamente",
          icon: "success",
          showCancelButton: false,
          confirmButtonText: "Aceptar",
        });
        edicionOK();
      }
    } else {
      // Crear un contacto
      const respuesta: Respuesta = await crearContacto({
        nombre,
        email,
        telefono,
        perfil,
        categoriasIds: idsValidos,
      });
      console.log(respuesta);

      if ("error" in respuesta) {
        const { isConfirmed } = await Swal.fire({
          title: respuesta.error,
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "Aceptar",
        });
      } else {
        nuevo(respuesta);
        setEmail("");
        setNombre("");
        setTelefono("");
        setDireccion("");
        setCiudad("");
        setPais("");
        setCategoriasIds([]);
      }
    }
  }

  useEffect(() => {
    if (contacto) {
      setNombre(contacto.nombre);
      setEmail(contacto.email);
      setTelefono(contacto.telefono);
      // El contacto puede venir sin perfil, por eso usamos ?. y ||
      setDireccion(contacto.perfil?.direccion || "");
      setCiudad(contacto.perfil?.ciudad || "");
      setPais(contacto.perfil?.pais || "");
      // De objetos completos a solo sus ids
      setCategoriasIds(contacto.categorias.map((c) => c.id));
    } else {
      setNombre("");
      setEmail("");
      setTelefono("");
      setDireccion("");
      setCiudad("");
      setPais("");
      setCategoriasIds([]);
    }
  }, [contacto]);

  return (
    <form className="space-y-2 mb-6" onSubmit={enviaFormulario}>
      <input
        onChange={(e) => setNombre(e.target.value)}
        value={nombre}
        type="text"
        className="border p-2 w-full"
        placeholder="nombre"
        required
      />
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="border p-2 w-full"
        placeholder="email"
        required
      />
      <input
        onChange={(e) => setTelefono(e.target.value)}
        value={telefono}
        type="tel"
        className="border p-2 w-full"
        placeholder="telefono"
        required
      />

      <p className="text-xs text-gray-500 pt-2">Perfil (opcional)</p>
      <input
        onChange={(e) => setDireccion(e.target.value)}
        value={direccion}
        type="text"
        className="border p-2 w-full"
        placeholder="direccion"
      />
      <input
        onChange={(e) => setCiudad(e.target.value)}
        value={ciudad}
        type="text"
        className="border p-2 w-full"
        placeholder="ciudad"
      />
      <input
        onChange={(e) => setPais(e.target.value)}
        value={pais}
        type="text"
        className="border p-2 w-full"
        placeholder="pais"
      />

      <p className="text-xs text-gray-500 pt-2">Categorías</p>
      <SelectorCategorias
        disponibles={categorias}
        seleccionadas={categoriasIds}
        alAlternar={alternarCategoria}
      />

      <button
        type="submit"
        className={
          (contacto ? "bg-green-500 " : "bg-blue-500 ") +
          "text-white px-4 py-2 rounded w-full"
        }
      >
        {contacto ? "Modificar" : "Crear"}
      </button>
    </form>
  );
};
