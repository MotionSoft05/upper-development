// src/app/pantalla/[id]/page.jsx
import dynamic from "next/dynamic";
const BaseScreenClient = dynamic(
  () => import("@/components/BaseScreenClient"),
  { ssr: false },
);

// Esta página es renderizada en el servidor
export default function PantallaDinamica({ params }) {
  return <BaseScreenClient id={params.id} />;
}

// Generación de rutas estáticas
export function generateStaticParams() {
  return Array.from({ length: 1 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
