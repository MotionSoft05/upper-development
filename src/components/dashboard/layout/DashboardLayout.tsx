"use client";

import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import db from "@/firebase/firestore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { useThemeStore } from "@/stores/useThemeStore";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardFooter from "./DashboardFooter";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { setUser, sidebarCollapsed } = useDashboardStore();
  const { resolvedTheme } = useThemeStore();

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUser(user.email, docSnap.data() as any);
          } else {
            setUser(user.email, null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(user.email, null);
        }
      } else {
        setUser(null, null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  // Determine main content margin based on sidebar state
  const mainMarginLeft = sidebarCollapsed ? "md:ml-[72px]" : "md:ml-64";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Background decoration (subtle) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${mainMarginLeft}`}
      >
        {/* Header */}
        <DashboardHeader />

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 relative z-10">{children}</main>

        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
}
