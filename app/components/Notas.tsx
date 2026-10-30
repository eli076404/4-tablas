import { actualizarNota, borrarNota, crearNota } from "@/lib/actions";
import { useState } from "react";
import { Nota } from "../page";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface NotasProps {
  contactoId: number;
  notas: Nota[];
  cambios: () => void; // avisa al padre de que debe recargar la lista
}

export const Notas = ({ contactoId, notas, cambios }: NotasProps) => {
  const [texto, setTexto] = useState("");
  // Edición en línea: guardamos QUÉ nota se edita y con qué texto
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEditado, setTextoEditado] = useState("");

  async function anadirNota(e: React.SubmitEvent) {
    e.preventDefault();
    const respuesta: any = await crearNota(contactoId, texto);
    if ("error" in respuesta) {
      toast.error(respuesta.error);
    } else {
      setTexto("");
      toast.success("Nota añadida");
      cambios();
    }
  }

  async function guardarNota(e: React.SubmitEvent) {
    e.preventDefault();
    if (editandoId === null) return;
    const respuesta: any = await actualizarNota(editandoId, textoEditado);
    if ("error" in respuesta) {
      toast.error(respuesta.error);
    } else {
      setEditandoId(null);
      toast.success("Nota modificada");
      cambios();
    }
  }

  async function borrarUnaNota(id: number) {
    const { isConfirmed } = await Swal.fire({
      title: "¿Seguro que quieres borrar esta nota?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: "No",
    });
    if (isConfirmed) {
      const respuesta = await borrarNota(id);
      if (respuesta.ok) {
        setEditandoId(null);
        toast.success("Nota borrada correctamente");
        cambios();
      } else {
        toast.error(respuesta.error || "No podido borrar la nota");
      }
    } else {
      toast.error("Has elegido no borrar la nota");
    }
  }

  return (
    <div className="w-full border-t pt-3">
      <p className="text-xs text-gray-500 mb-2">Notas ({notas.length})</p>

      <ul className="space-y-1 mb-2">
        {notas.map((nota) => (
          <li key={nota.id}>
            {editandoId === nota.id ? (
              // Modo edición: el texto se convierte en un input
              <form onSubmit={guardarNota} className="flex items-center gap-1">
                <input
                  onChange={(e) => setTextoEditado(e.target.value)}
                  value={textoEditado}
                  type="text"
                  className="border p-1 text-sm flex-1"
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
                <span className="text-sm text-black flex-1">{nota.texto}</span>
                <button
                  title="Modificar la nota"
                  className="bg-gray-200/65 hover:bg-gray-200 transition-colors p-1 rounded-full"
                  onClick={() => {
                    setEditandoId(nota.id);
                    setTextoEditado(nota.texto);
                  }}
                >
                  ✏️
                </button>
                <button
                  title="Borrar la nota"
                  className="bg-red-200/65 hover:bg-red-200 transition-colors p-1 rounded-full"
                  onClick={() => borrarUnaNota(nota.id)}
                >
                  🗑️
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {notas.length === 0 && (
        <p className="text-xs text-gray-400 italic mb-2">Sin notas</p>
      )}

      <form onSubmit={anadirNota} className="flex items-center gap-1">
        <input
          onChange={(e) => setTexto(e.target.value)}
          value={texto}
          type="text"
          className="border p-1 text-sm flex-1"
          placeholder="nueva nota"
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
