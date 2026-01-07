"use client";
import dynamic from "next/dynamic";

const PantallaServicioClient = dynamic(
  () => import("@/components/PantallaServicioClient"),
  { ssr: false },
);

export default function PantallaServicio() {
  return <PantallaServicioClient />;
}
