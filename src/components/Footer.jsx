"use client";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation"; // Captura la url
function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname(); // Obtiene la ruta actual (pathname) para renderizar parte del NavBar solo al inicio de la pagina

  // No muestra Navigation en algunas URL determinadas
  const hideFooter = () => {
    const hideRoutes = [
      "/paginasAleatorias",
      "/pantallaDeServicio",
      "/pantallaDirec1",
    ];
    // Elimina el .html del pathname si está presente
    const sanitizedPathname = pathname.replace(".html", "");

    return (
      hideRoutes.includes(sanitizedPathname) ||
      sanitizedPathname.match(/\/pantalla[1-9]|10/)
    );
  };

  if (hideFooter()) {
    return null;
  }

  return (
    <footer className="">
      <div className="w-full max-w-screen-xl mx-auto md:py-8 flex flex-col items-center">
        <div className="">
          <a
            href="https://www.linkedin.com/company/upper-digital-signage/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/LinkedIn.png" className="h-8 mr-3" alt="Logo" />
          </a>
        </div>

        <div className="my-2">
          <p className="font-light sm:text-lg text-gray-400 text-center">
            {/* Title Footer */}
            {t("footer.title")}
          </p>
        </div>
        <div className="sm:flex sm:items-center sm:justify-between my-2">
          <a href="/" className="flex items-center mb-4 sm:mb-0">
            <img src="/img/logov2.png" className="h-8 mr-3" alt="Logo" />
          </a>
        </div>

        <div className="">
          <span className="block text-sm sm:text-center text-gray-400">
            © 2024
            <a href="/" className="hover:underline">
              Upper™
            </a>
            &nbsp;All Rights Reserved.
            <span className="ml-2">Versión: 1.0.0</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
