"use client";
import dynamic from "next/dynamic";

// Use the new dashboard client with modern layout
// Fallback to old client if needed: import("@/components/dashboard/DashboardClient")
const DashboardClient = dynamic(
  () => import("@/components/dashboard/DashboardClientNew"),
  { ssr: false },
);

export default function DashBoard() {
  return <DashboardClient />;
}
