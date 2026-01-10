"use client";

import { useDashboardStore, type PanelName } from "@/stores/useDashboardStore";
import { DashboardLayout } from "./layout";

// Import existing panel components
import PantallasDirectorio from "@/components/dashboard/PantallasDirectorio";
import AltaEventos from "@/components/dashboard/altaEventos";
import ConsultaModEvento from "@/components/dashboard/consultaModEventos";
import Guia from "@/components/dashboard/guia";
import Licencia from "@/components/dashboard/licencia";
import PantallasSalon from "@/components/dashboard/pantallasSalon";
import Publicidad from "@/components/dashboard/publicidad";
import Soporte from "@/components/dashboard/soporte";
import Admin from "@/components/dashboard/admin/admin";
import AdminAPIMonitor from "@/components/dashboard/admin/AdminAPIMonitor";
import UserAdmin from "@/components/dashboard/userAdmin";
import Ediciondeempresa from "@/components/dashboard/ediciondeempresa";
import EditPantallaServicio from "@/components/dashboard/EditPantallaServicio";
import MonitorScreen from "@/components/dashboard/MonitorScreen";
import PantallasTarifario from "@/components/dashboard/pantallasTarifario";
import EditInformacionTarifa from "@/components/dashboard/EditInformacionTarifa";
import PantallasPromociones from "@/components/dashboard/PantallasPromociones";
import PantallasVuelos from "@/components/dashboard/PantallasVuelos";
import MensajesDinamicos from "@/components/dashboard/MensajesDinamicos";
import DevicesList from "@/components/DevicesList";
import DeviceLinker from "@/components/DeviceLinker";

// Panel component mapping
const panelComponents: Record<PanelName, React.ComponentType<any> | null> = {
  dashboard: UserAdmin,
  admin: Admin,
  apiMonitor: AdminAPIMonitor,
  editCompany: Ediciondeempresa,
  altaEvento: AltaEventos,
  consultaEvento: ConsultaModEvento,
  pantallasSalon: PantallasSalon,
  pantallasDirectorio: PantallasDirectorio,
  pantallasServicio: EditPantallaServicio,
  pantallasPromociones: PantallasPromociones,
  pantallasVuelos: PantallasVuelos,
  pantallaTarifario: PantallasTarifario,
  editTarifa: EditInformacionTarifa,
  monitorScreen: MonitorScreen,
  mensajesDinamicos: MensajesDinamicos,
  publicidad: Publicidad,
  devicesList: DevicesList,
  deviceLinker: DeviceLinker,
  licencia: Licencia,
  guia: Guia,
  soporte: Soporte,
};

export default function DashboardClientNew() {
  const { activePanel, userEmail, userData, setActivePanel } =
    useDashboardStore();

  // Get the active component
  const ActiveComponent = panelComponents[activePanel];

  // Check admin permissions for admin panels
  const isSuperAdmin = userData?.permisos === 10;
  const isAdminPanel = ["admin", "apiMonitor", "editCompany"].includes(
    activePanel,
  );

  // If trying to access admin panel without permissions, show dashboard
  if (isAdminPanel && !isSuperAdmin) {
    // Redirect to dashboard
    if (typeof window !== "undefined") {
      setActivePanel("dashboard");
    }
    return null;
  }

  // Props for components that need them
  const getComponentProps = () => {
    switch (activePanel) {
      case "altaEvento":
        return {
          setShowAltaEvento: () => setActivePanel("dashboard"),
          setShowUserAdmin: () => setActivePanel("dashboard"),
        };
      case "monitorScreen":
        return { userEmail };
      case "guia":
        return { userData };
      case "deviceLinker":
        return {
          onDeviceLinked: () => setActivePanel("devicesList"),
        };
      default:
        return {};
    }
  };

  return (
    <DashboardLayout>
      {ActiveComponent ? (
        <ActiveComponent {...getComponentProps()} />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">
            Panel no encontrado
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
