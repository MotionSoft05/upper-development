"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  MessageSquare,
  Receipt,
  Tv,
  ListOrdered,
  Images,
  Plane,
  Tags,
  Monitor,
  Megaphone,
  IdCard,
  Book,
  Headset,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Shield,
  Building2,
  Server,
  X,
} from "lucide-react";
import { useDashboardStore, type PanelName } from "@/stores/useDashboardStore";

// Section configuration
interface MenuItem {
  id: PanelName;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

interface MenuSection {
  title: string;
  titleKey: string;
  items: MenuItem[];
  adminOnly?: boolean;
  collapsible?: boolean;
}

const menuSections: MenuSection[] = [
  // INICIO - Lo más usado primero
  {
    title: "Inicio",
    titleKey: "Inicio",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        permission: "tablero",
      },
    ],
  },
  // CONTENIDO - Crear y gestionar eventos
  {
    title: "Contenido",
    titleKey: "Contenido",
    collapsible: true,
    items: [
      {
        id: "altaEvento",
        label: "Crear Evento",
        icon: <CalendarPlus className="w-5 h-5" />,
        permission: "altaEventos",
      },
      {
        id: "consultaEvento",
        label: "Mis Eventos",
        icon: <CalendarDays className="w-5 h-5" />,
        permission: "consultaEventos",
      },
    ],
  },
  // MIS PANTALLAS - Configuración de cada tipo
  {
    title: "Mis Pantallas",
    titleKey: "Mis Pantallas",
    collapsible: true,
    items: [
      {
        id: "pantallasSalon",
        label: "Salón",
        icon: <Tv className="w-5 h-5" />,
        permission: "pantallasSalon",
      },
      {
        id: "pantallasDirectorio",
        label: "Directorio",
        icon: <ListOrdered className="w-5 h-5" />,
        permission: "pantallasDirectorio",
      },
      {
        id: "pantallasPromociones",
        label: "Promociones",
        icon: <Images className="w-5 h-5" />,
        permission: "pantallasPromociones",
      },
      {
        id: "pantallasVuelos",
        label: "Vuelos",
        icon: <Plane className="w-5 h-5" />,
        permission: "pantallasvuelos",
      },
      {
        id: "pantallaTarifario",
        label: "Tarifario",
        icon: <Tags className="w-5 h-5" />,
        permission: "pantallasTarifario",
      },
      {
        id: "editTarifa",
        label: "Info Tarifas",
        icon: <Receipt className="w-5 h-5" />,
        permission: "editInformacionTarifa",
      },
    ],
  },
  // DISPOSITIVOS - Android TV y monitoreo
  {
    title: "Dispositivos",
    titleKey: "Dispositivos",
    items: [
      {
        id: "devicesList",
        label: "Android TV",
        icon: <Monitor className="w-5 h-5" />,
        permission: "androidTv",
      },
      {
        id: "monitorScreen",
        label: "Monitor de Estado",
        icon: <Monitor className="w-5 h-5" />,
        permission: "monitoreo",
      },
    ],
  },
  // PUBLICIDAD
  {
    title: "Publicidad",
    titleKey: "Publicidad",
    items: [
      {
        id: "publicidad",
        label: "Gestionar Anuncios",
        icon: <Megaphone className="w-5 h-5" />,
        permission: "publicidad",
      },
    ],
  },
  // AJUSTES - Cuenta y ayuda
  {
    title: "Ajustes",
    titleKey: "Ajustes",
    items: [
      {
        id: "guia",
        label: "Guía",
        icon: <Book className="w-5 h-5" />,
        permission: "guiaUsuario",
      },
      {
        id: "soporte",
        label: "Soporte",
        icon: <Headset className="w-5 h-5" />,
        permission: "contactoSoporte",
      },
    ],
  },
  // ADMINISTRADOR - Solo para superadmin, al final
  {
    title: "Administrador",
    titleKey: "Administrador",
    adminOnly: true,
    items: [
      {
        id: "admin",
        label: "Panel Admin",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        id: "editCompany",
        label: "Empresas",
        icon: <Building2 className="w-5 h-5" />,
      },
      {
        id: "apiMonitor",
        label: "API Monitor",
        icon: <Server className="w-5 h-5" />,
      },
    ],
  },
];

interface DashboardSidebarProps {
  className?: string;
}

export default function DashboardSidebar({
  className = "",
}: DashboardSidebarProps) {
  const { t } = useTranslation();

  // Zustand stores
  const {
    activePanel,
    setActivePanel,
    sidebarCollapsed,
    toggleSidebar,
    sidebarOpen,
    setSidebarOpen,
    userData,
  } = useDashboardStore();

  // Collapsible sections state - start with all expanded
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  // Permissions
  const permisosSecciones = userData?.permisosSecciones || {};
  const isSuperAdmin = userData?.permisos === 10;

  const tienePermiso = (seccion?: string): boolean => {
    if (!seccion) return true;
    return isSuperAdmin || permisosSecciones[seccion] === true;
  };

  // Determine if sidebar should show expanded
  const isExpanded = !sidebarCollapsed;

  const handleNavigation = (panelId: PanelName) => {
    setActivePanel(panelId);
    // Close mobile drawer
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Sidebar content as JSX - not a function to avoid re-renders
  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div
        className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"} p-4 border-b border-gray-200 dark:border-gray-700`}
      >
        {isExpanded ? (
          <>
            <Link href="/" className="flex items-center">
              <Image
                src="/img/UpperNewLogo-removebg-preview.png"
                alt="Upper DS"
                width={140}
                height={40}
                className="h-10 w-auto dark:brightness-110"
              />
            </Link>
            {/* Collapse button - only desktop */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            {/* Close button - only mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        {menuSections.map((section) => {
          // Skip admin section for non-superadmins
          if (section.adminOnly && !isSuperAdmin) return null;

          // Filter items by permission
          const visibleItems = section.items.filter((item) =>
            tienePermiso(item.permission),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.titleKey} className="mb-4">
              {/* Section title */}
              {isExpanded &&
                (section.collapsible ? (
                  <button
                    onClick={() => toggleSection(section.titleKey)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors whitespace-nowrap"
                  >
                    <span>{t(section.titleKey) || section.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${collapsedSections[section.titleKey] ? "-rotate-90" : ""}`}
                    />
                  </button>
                ) : (
                  <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {t(section.titleKey) || section.title}
                  </h3>
                ))}

              {/* Items - with collapse animation */}
              <AnimatePresence initial={false}>
                {(!section.collapsible ||
                  !collapsedSections[section.titleKey]) && (
                  <motion.ul
                    key={`${section.titleKey}-items`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="space-y-1 overflow-hidden"
                  >
                    {visibleItems.map((item) => {
                      const isActive = activePanel === item.id;

                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleNavigation(item.id)}
                            className={`
                              relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                              transition-all duration-200 group
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                              }
                              ${!isExpanded ? "justify-center" : ""}
                            `}
                            title={
                              !isExpanded
                                ? t(item.label) || item.label
                                : undefined
                            }
                          >
                            <span
                              className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-upper-blue"}`}
                            >
                              {item.icon}
                            </span>

                            {isExpanded && (
                              <>
                                <span className="flex-1 text-left text-sm font-medium truncate">
                                  {t(item.label) || item.label}
                                </span>
                                {isActive && (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom section removed - logout and theme toggle are in header */}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 256 : 72 }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 200,
          damping: 25,
        }}
        className={`
          hidden md:flex flex-col fixed left-0 top-0 h-screen z-40
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          shadow-sm overflow-hidden
          ${className}
        `}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden fixed left-0 top-0 h-screen w-[280px] z-50 bg-white dark:bg-gray-900 shadow-xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
