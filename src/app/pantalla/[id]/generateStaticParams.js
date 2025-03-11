// src/app/pantalla/[id]/generateStaticParams.js
export function generateStaticParams() {
  // Generate routes for screens 1-300
  return Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
