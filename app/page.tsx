"use client";

import {
  borrarContacto,
  borrarPerfil,
  getCategorias,
  getContactos,
} from "@/lib/actions";
import { CSSProperties, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Tarjeta } from "./components/Tarjeta";
import { FormuContacto } from "./components/FormuContacto";
import BuscarDebounce from "./components/BuscarDebounce";
import { GestorCategorias } from "./components/GestorCategorias";
import Swal from "sweetalert2";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

export interface Perfil {
  id: number;
  direccion: string;
  ciudad: string;
  pais: string;
  contactoId: number;
}

export interface Nota {
  id: number;
  texto: string;
  createdAt: Date;
  contactoId: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  color: string;
}

export interface Contacto {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  perfil: Perfil | null; // null = ese contacto todavía no tiene perfil
  notas: Nota[]; // array: puede estar vacío, pero nunca es null
  categorias: Categoria[]; // las categorías asignadas a este contacto
}

export default function Home() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<Contacto | null>(null);
  // El catálogo de categorías es independiente de los contactos
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  async function cargar(q = "") {
    try {
      setLoading(true);
      const datos = await getContactos(q);
      setContactos(datos);
      toast.success("Agenda leida");
    } catch {
      toast.error("No se ha podido leer la agenda, prueba más tarde");
    } finally {
      setLoading(false);
    }
  }

  async function borrar(miid: number) {
    const { isConfirmed } = await Swal.fire({
      title: "¿Seguro que quieres eliminar a este contacto?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "No",
    });
    if (isConfirmed) {
      const respuesta = await borrarContacto(miid);
      if (respuesta.ok) {
        cargar();
        toast.success("Contacto borrado correctamente");
      } else {
        toast.error(respuesta.error || "No podido borrar");
      }
    } else {
      toast.error("Has elegido no borrar el contacto");
    }
  }

  async function borrarSoloPerfil(contactoId: number) {
    const { isConfirmed } = await Swal.fire({
      title: "¿Borrar la dirección de este contacto?",
      text: "El contacto se mantiene, solo se borra su perfil",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "No",
    });
    if (isConfirmed) {
      const respuesta = await borrarPerfil(contactoId);
      if (respuesta.ok) {
        setEditando(null);
        cargar(busqueda);
        toast.success("Perfil borrado correctamente");
      } else {
        toast.error(respuesta.error || "No podido borrar el perfil");
      }
    } else {
      toast.error("Has elegido no borrar el perfil");
    }
  }

  async function cargarCategorias() {
    try {
      const datos = await getCategorias();
      setCategorias(datos);
    } catch {
      toast.error("No se han podido leer las categorías");
    }
  }

  useEffect(() => {
    cargar(busqueda);
  }, [busqueda]);

  // Las categorías se leen una vez al arrancar, no dependen de la búsqueda
  useEffect(() => {
    cargarCategorias();
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <BuscarDebounce
        espera={2000}
        onBuscar={(texto) => {
          setBusqueda(texto);
        }}
      />
      <main className="flex flex-1 w-full max-w-3xl gap-4 items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div>
          <FormuContacto
            edicionOK={() => {
              setEditando(null);
              cargar();
            }}
            contacto={editando}
            categorias={categorias}
            nuevo={async (elNuevo) => {
              // alert("Has creado al contacto " + elNuevo.nombre);
              const { isConfirmed } = await Swal.fire({
                title: "Has creado al contacto " + elNuevo.nombre,
                icon: "success",
                showCancelButton: false,
                confirmButtonText: "Aceptar",
              });
              // cargar();
              setContactos((c) => [elNuevo, ...c]);
            }}
          />
          {/* El catálogo de categorías se administra aquí, no en las tarjetas */}
          <GestorCategorias
            categorias={categorias}
            cambios={() => {
              cargarCategorias(); // el catálogo ha cambiado
              cargar(busqueda); // y los contactos pueden perder una categoría
            }}
          />
        </div>
        <ul className="">
          {contactos.map((contacto) => (
            <li key={contacto.id} className="mt-3">
              <Tarjeta
                editando={editando}
                datos={contacto}
                borraContacto={(miid) => {
                  borrar(miid);
                }}
                borraPerfil={(contactoId) => {
                  borrarSoloPerfil(contactoId);
                }}
                notasCambiadas={() => {
                  cargar(busqueda);
                }}
                editaContacto={(datos) => {
                  if (editando?.email == contacto.email) {
                    setEditando(null);
                  } else {
                    setEditando(datos);
                  }
                }}
              />
            </li>
          ))}
        </ul>

        <ClipLoader
          color="#00ff00"
          loading={loading}
          cssOverride={override}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </main>
    </div>
  );
}
