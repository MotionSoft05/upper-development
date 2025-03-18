// src/app/pantalla/[id]/page.jsx
import BaseScreenClient from "@/components/BaseScreenClient";

// Esta página es renderizada en el servidor
export default function PantallaDinamica({ params }) {
  return <BaseScreenClient id={params.id} />;
}

// Generación de rutas estáticas
export function generateStaticParams() {
  return Array.from({ length: 300 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
