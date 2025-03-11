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
      sanitizedPathname.includes("/pantalla/") || // Cualquier subruteo de /pantalla/
      sanitizedPathname.includes("/paginasAleatorias"); // Incluye parámetros de query

    return exactMatch || patternMatch;
  };

  // Si la ruta debe excluir el layout, solo renderiza el contenido sin header/footer
  if (shouldHideLayout()) {
    return children;
  }

  // De lo contrario, renderiza el layout completo
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
