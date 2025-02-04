// src/components/BaseScreenClient.jsx
"use client";
import { useSearchParams } from "next/navigation";
import BaseScreen from "@/components/PantallaBaseSalon";

export default function BaseScreenClient({ id }) {
  const searchParams = useSearchParams();
  const empresa = searchParams.get("emp");

  return <BaseScreen screenNumber={parseInt(id)} empresa={empresa} />;
}
