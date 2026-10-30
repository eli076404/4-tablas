import {
  actualizarCategoria,
  borrarCategoria,
  crearCategoria,
} from "@/lib/actions";
import { useState } from "react";
import { Categoria } from "../page";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface GestorProps {
  categorias: Categoria[];
  cambios: () => void; // avisa al padre de que debe recargar
}

const COLOR_POR_DEFECTO = "#6366f1";

export const GestorCategorias = ({ categorias, cambios }: GestorProps) => {
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState(COLOR_POR_DEFECTO);
  // Edición en línea, igual que en las notas
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [colorEditado, setColorEditado] = useState(COLOR_POR_DEFECTO);

  async function anadirCategoria(e: React.SubmitEvent) {
    e.preventDefault();
    const respuesta: any = await crearCategoria({ nombre, color });
    if ("error" in respuesta) {
      toast.error(respuesta.error);
    } else {
      setNombre("");
      setColor(COLOR_POR_DEFECTO);
      toast.success("Categoría creada");
      cambios();
    }
  }

  async function guardarCategoria(e: React.SubmitEvent) {
    e.preventDefault();
    if (editandoId === null) return;
    const respuesta: any = await actualizarCategoria(editandoId, {
      nombre: nombreEditado,
      color: colorEditado,
    });
    if ("error" in respuesta) {
      toast.error(respuesta.error);
    } else {
      setEditandoId(null);
      toast.success("Categoría modificada");
      cambios();
    }
  }

  async function borrarUnaCategoria(categoria: Categoria) {
    const { isConfirmed } = await Swal.fire({
      title: "¿Borrar la categoría " + categoria.nombre + "?",
      text: "Se quitará de todos los contactos que la tengan, pero no se borra ningún contacto",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "No",
    });
    if (isConfirmed) {
      const respuesta = await borrarCategoria(categoria.id);
      if (respuesta.ok) {
        setEditandoId(null);
        toast.success("Categoría borrada correctamente");
        cambios();
      } else {
        toast.error(respuesta.error || "No podido borrar la categoría");
      }
    } else {
      toast.error("Has elegido no borrar la categoría");
    }
  }

  return (
    <div className="border-t pt-3">
      <p className="text-xs text-gray-500 mb-2">
        Categorías ({categorias.length})
      </p>

      <ul className="space-y-1 mb-2">
        {categorias.map((categoria) => (
          <li key={categoria.id}>
            {editandoId === categoria.id ? (
              // Modo edición: nombre y color
              <form
                onSubmit={guardarCategoria}
                className="flex items-center gap-1"
              >
                <input
                  onChange={(e) => setColorEditado(e.target.value)}
                  value={colorEditado}
                  type="color"
                  className="h-7 w-7 border"
                  title="Color"
                />
                <input
                  onChange={(e) => setNombreEditado(e.target.value)}
                  value={nombreEditado}
                  type="text"
                  className="border p-1 text-sm w-24"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  title="Guardar"
                  className="bg-green-200/65 hover:bg-green-200 transition-colors p-1 rounded-full"
                >
                  ✅
                </button>
                <button
                  type="button"
                  title="Cancelar"
                  className="bg-gray-200/65 hover:bg-gray-200 transition-colors p-1 rounded-full"
                  onClick={() => setEditandoId(null)}
                >
                  ❌
                </button>
              </form>
            ) : (
              // Modo lectura
              <div className="flex items-center gap-1">
                {/* El color viene de la BD, así que va en style, no en className */}
                <span
                  className="text-xs text-white px-2 py-[2px] rounded-full flex-1"
                  style={{ backgroundColor: categoria.color }}
                >
                  {categoria.nombre}
                </span>
                <button
                  title="Modificar la categoría"
                  className="bg-gray-200/65 hover:bg-gray-200 transition-colors p-1 rounded-full"
                  onClick={() => {
                    setEditandoId(categoria.id);
                    setNombreEditado(categoria.nombre);
                    setColorEditado(categoria.color);
                  }}
                >
                  ✏️
                </button>
                <button
                  title="Borrar la categoría"
                  className="bg-red-200/65 hover:bg-red-200 transition-colors p-1 rounded-full"
                  onClick={() => borrarUnaCategoria(categoria)}
                >
                  🗑️
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {categorias.length === 0 && (
        <p className="text-xs text-gray-400 italic mb-2">Sin categorías</p>
      )}

      <form onSubmit={anadirCategoria} className="flex items-center gap-1">
        <input
          onChange={(e) => setColor(e.target.value)}
          value={color}
          type="color"
          className="h-7 w-7 border"
          title="Color"
        />
        <input
          onChange={(e) => setNombre(e.target.value)}
          value={nombre}
          type="text"
          className="border p-1 text-sm w-24"
          placeholder="nueva"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          +
        </button>
      </form>
    </div>
  );
};
