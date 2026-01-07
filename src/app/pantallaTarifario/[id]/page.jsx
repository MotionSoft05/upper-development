import dynamic from "next/dynamic";
const PantallaBaseTarifario = dynamic(
  () => import("@/components/pantallaBaseTarifario"),
  { ssr: false },
);

export default function PantallaTarifarioDinamica({ params }) {
  return <PantallaBaseTarifario id={params.id} />;
}

export function generateStaticParams() {
  return Array.from({ length: 1 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
