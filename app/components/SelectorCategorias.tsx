import { Categoria } from "../page";

interface SelectorProps {
  disponibles: Categoria[]; // el catálogo completo
  seleccionadas: number[]; // los ids marcados ahora mismo en el formulario
  alAlternar: (categoriaId: number) => void;
}

// Componente controlado: no guarda nada, ni habla con la base de datos.
// El estado vive en FormuContacto y se envía al pulsar Crear/Modificar.
export const SelectorCategorias = ({
  disponibles,
  seleccionadas,
  alAlternar,
}: SelectorProps) => {
  if (disponibles.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        No hay categorías creadas todavía
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {disponibles.map((categoria) => {
        // some() de JavaScript: ¿está este id en la lista de marcados?
        const marcada = seleccionadas.some((id) => id === categoria.id);
        return (
          <button
            key={categoria.id}
            type="button" // sin esto enviaría el formulario
            title={marcada ? "Quitar del contacto" : "Añadir al contacto"}
            onClick={() => alAlternar(categoria.id)}
            // El color lo decide la BD, por eso va en style y no en className
            style={
              marcada
                ? { backgroundColor: categoria.color, color: "white" }
                : { borderColor: categoria.color, color: categoria.color }
            }
            className={
              (marcada ? "" : "bg-white border ") +
              "text-xs px-2 py-[2px] rounded-full transition-colors"
            }
          >
            {marcada ? "✓ " : "+ "}
            {categoria.nombre}
          </button>
        );
      })}
    </div>
  );
};
