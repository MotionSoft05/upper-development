// src/components/LayoutWrapper.jsx
"use client";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Lista de rutas donde no queremos mostrar el header y footer
  const hideLayoutRoutes = [
    "/paginasAleatorias",
    "/pantallaDeServicio",
    "/pantallaDirec1",
    "/pantallaTarifario",
  ];

  // Verifica si la ruta actual está en la lista de exclusión o coincide con el patrón de pantallas
  const shouldHideLayout = () => {
    // Elimina el .html del pathname si está presente y obtiene la ruta base
    const sanitizedPathname = pathname.replace(".html", "");

    // Verifica si la ruta coincide exactamente con alguna en la lista de exclusión
    const exactMatch = hideLayoutRoutes.some(
      (route) => sanitizedPathname === route
    );

    // Verifica patrones de URL que deberían excluir el layout
    const patternMatch =
      sanitizedPathname.match(/\/pantalla[1-9]|10/) || // Pantallas numeradas del 1-10
      sanitizedPathname.match(/\/pantallaDirec[1-9]|10/) || // Pantallas Directorio numeradas
      sanitizedPathname.match(/\/pantallaDirec\/[1-9]|10/) || // Pantallas Directorio con formato /pantallaDirec/1/
      sanitizedPathname.match(/\/pantallaTarifario\/[1-9]|10/) || // Pantallas Directorio con formato /pantallaDirec/1/
      sanitizedPathname.includes("/pantalla/") || // Cualquier subruteo de /pantalla/
      sanitizedPathname.includes("/pantallaDirec/") || // Cualquier subruteo de /pantallaDirec/
      sanitizedPathname.includes("/paginasAleatorias"); // Incluye parámetros de query
    sanitizedPathname.includes("/pantallaTarifario"); // Incluye parámetros de query

    return exactMatch || patternMatch;
  };

  // Si estamos en la página de dashboard
  const isDashboard = pathname.includes("/dashboard");

  // Si la ruta debe excluir el layout, solo renderiza el contenido sin header/footer
  if (shouldHideLayout()) {
    return children;
  }

  // Si es la página del dashboard, aplicamos una estructura especial
  if (isDashboard) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-grow">{children}</div>
        <Footer />
      </div>
    );
  }

  // De lo contrario, renderiza el layout completo estándar
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}
