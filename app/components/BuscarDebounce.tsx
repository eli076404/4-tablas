import { useEffect, useState } from "react";

interface BuscarProps {
  onBuscar: (texto: string) => void;
  espera?: number;
}
// onBuscar el la función que se ejecuta después del tiempo de espera sin pulsar ninguna tecla, onBuscar lleva el texto escrito en el input
// espera es opcional y es el tiempo entre soltar la última tecla pulsada y ejecutar la función onBuscar

export default function BuscarDebounce({
  onBuscar,
  espera = 500,
}: BuscarProps) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onBuscar(texto);
    }, espera);

    return () => {
      clearTimeout(timer);
    };
  }, [texto]);

  return (
    <div className="w-full mb-3">
      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
