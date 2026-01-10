import { create } from "zustand";
import { persist } from "zustand/middleware";

// Panel registry - maps panel names to their visibility
// This replaces the 20+ individual useState hooks in DashboardClient
export type PanelName =
  | "dashboard" // UserAdmin - home
  | "admin" // Admin panel
  | "apiMonitor" // API Monitor
  | "editCompany" // Company editor
  | "altaEvento" // Create event
  | "consultaEvento" // Query events
  | "pantallasSalon" // Salon screens
  | "pantallasDirectorio" // Directory screens
  | "pantallasServicio" // Service screens
  | "pantallasPromociones" // Promotions screens
  | "pantallasVuelos" // Flight screens
  | "pantallaTarifario" // Rate screens
  | "editTarifa" // Edit rate info
  | "monitorScreen" // Screen monitor
  | "mensajesDinamicos" // Dynamic messages
  | "publicidad" // Advertising
  | "devicesList" // Devices list
  | "deviceLinker" // Device linker
  | "licencia" // License
  | "guia" // Guide
  | "soporte"; // Support

interface UserData {
  empresa: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  rol?: string;
  permisosSecciones?: Record<string, boolean>;
  isSuperAdmin?: boolean;
}

interface DashboardState {
  // Navigation
  activePanel: PanelName;
  previousPanel: PanelName | null;

  // Sidebar
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // mobile drawer state

  // User (will be set from Firebase auth)
  userEmail: string | null;
  userData: UserData | null;

  // Actions
  setActivePanel: (panel: PanelName) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  collapseSidebar: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setUser: (email: string | null, data: UserData | null) => void;
  reset: () => void;
}

const initialState = {
  activePanel: "dashboard" as PanelName,
  previousPanel: null,
  sidebarCollapsed: false,
  sidebarOpen: false,
  userEmail: null,
  userData: null,
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActivePanel: (panel) =>
        set((state) => ({
          previousPanel: state.activePanel,
          activePanel: panel,
          sidebarOpen: false, // Close mobile drawer on navigation
        })),

      goBack: () =>
        set((state) => ({
          activePanel: state.previousPanel || "dashboard",
          previousPanel: null,
        })),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      collapseSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setUser: (email, data) =>
        set({
          userEmail: email,
          userData: data,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "upper-dashboard",
      partialize: (state) => ({
        // Only persist sidebar state, not navigation or user
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

// Selector hooks for common patterns
export const useActivePanel = () => useDashboardStore((s) => s.activePanel);
export const useSidebarCollapsed = () =>
  useDashboardStore((s) => s.sidebarCollapsed);
export const useSidebarOpen = () => useDashboardStore((s) => s.sidebarOpen);
export const useUserData = () => useDashboardStore((s) => s.userData);
