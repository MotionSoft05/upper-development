// src/app/pantallaTarifario/[id]/generateStaticParams.js
export function generateStaticParams() {
  // Generate routes for tarifario screens 1-10
  return Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
