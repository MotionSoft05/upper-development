import PantallaBaseTarifario from "@/components/pantallaBaseTarifario";

export default function PantallaTarifarioDinamica({ params }) {
  return <PantallaBaseTarifario id={params.id} />;
}

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
