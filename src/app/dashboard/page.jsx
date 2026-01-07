"use client";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(
  () => import("@/components/dashboard/DashboardClient"),
  { ssr: false },
);

export default function DashBoard() {
  return <DashboardClient />;
}
