import dynamic from "next/dynamic";
const BaseDirectorioClient = dynamic(
  () => import("@/components/PantallaBaseDirectorio"),
  { ssr: false },
);

// Esta página es renderizada en el servidor
export default function PantallaDirecDinamica({ params }) {
  return <BaseDirectorioClient id={params.id} />;
}

// Generación de rutas estáticas
export function generateStaticParams() {
  return Array.from({ length: 1 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
