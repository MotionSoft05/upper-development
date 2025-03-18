import BaseDirectorioClient from "@/components/PantallaBaseDirectorio";

// Esta página es renderizada en el servidor
export default function PantallaDirecDinamica({ params }) {
  return <BaseDirectorioClient id={params.id} />;
}

// Generación de rutas estáticas
export function generateStaticParams() {
  return Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
