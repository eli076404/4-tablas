import Image from "next/image";
import { Contacto } from "../page";
import { Notas } from "./Notas";

interface TarjetaProps {
  editando: Contacto | null;
  datos: Contacto;
  borraContacto: (id: number) => void;
  borraPerfil: (contactoId: number) => void;
  notasCambiadas: () => void;
  editaContacto: (datos: Contacto) => void;
}

export const Tarjeta = ({
  datos,
  editando,
  borraContacto,
  borraPerfil,
  notasCambiadas,
  editaContacto,
}: TarjetaProps) => {
  function borrar() {
    borraContacto(datos.id);
  }

  function borrarElPerfil() {
    borraPerfil(datos.id);
  }

  function editar() {
    editaContacto(datos);
  }

  return (
    <div className="relative rounded-xl overflow-hidden flex flex-col items-center shadow-lg bg-white font-Roboto-light">
      <div
        className={
          datos.email == editando?.email
            ? "h-24 w-full bg-blue-400"
            : "h-24 w-full bg-green-400"
        }
      ></div>
      <div className="top-16 z-10 flex items-center flex-col gap-4 px-5 py-5">
        <div className="-mt-20">
          <Image
            src="/foto.jpg"
            alt="Foto"
            width={100}
            height={150}
            className="rounded-full"
          />
        </div>

        <div className="flex items-center flex-col">
          <p title="name/نام" className="text-black font-Roboto-md">
            {datos.nombre}
          </p>
          <p title="bio/بیوگرافی" className="text-xs text-gray-500 font-medium">
            {datos.email}
          </p>
        </div>

        {/* Datos de la segunda tabla: el contacto puede no tener perfil */}
        {datos.perfil ? (
          <div className="flex items-center flex-col">
            <p className="text-sm text-black">{datos.perfil.direccion}</p>
            <p className="text-xs text-gray-500 font-medium">
              {datos.perfil.ciudad} ({datos.perfil.pais})
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Sin perfil</p>
        )}

        {/* Tercera tabla: un contacto tiene MUCHAS notas, aqui va su lista */}
        <Notas
          contactoId={datos.id}
          notas={datos.notas}
          cambios={notasCambiadas}
        />

        {/* Cuarta tabla (N:M): solo se MUESTRAN las que tiene asignadas.
            Para cambiarlas se usa el formulario (boton de editar) */}
        {datos.categorias.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {datos.categorias.map((categoria) => (
              <span
                key={categoria.id}
                // El color lo decide la BD, por eso va en style
                style={{ backgroundColor: categoria.color }}
                className="text-xs text-white px-2 py-[2px] rounded-full"
              >
                {categoria.nombre}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Sin categorías</p>
        )}

        <div className="flex items-center gap-3">
          <button className="bg-green-400 transition-all gradient text-[15px] text-white px-3 py-[6px] rounded-full flex items-center gap-1">
            {datos.telefono}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              ></path>
            </svg>
          </button>
          <button
            className={
              (datos.email == editando?.email
                ? "bg-green-200/65 hover:bg-green-200 scale-130 "
                : "bg-gray-200/65 hover:bg-gray-200 ") +
              "transition-colors p-2 rounded-full"
            }
            onClick={editar}
          >
            ✏️
          </button>
          {/* Este botón solo tiene sentido si el contacto tiene perfil */}
          {datos.perfil && (
            <button
              title="Borrar solo el perfil"
              className="bg-orange-200/65 hover:bg-orange-200 transition-colors p-2 rounded-full"
              onClick={borrarElPerfil}
            >
              📍
            </button>
          )}
          <button
            title="Borrar el contacto"
            className="bg-red-200/65 hover:bg-red-200 transition-colors p-2 rounded-full"
            onClick={borrar}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};
