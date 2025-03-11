"use client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";

function Footer() {
  const { t } = useTranslation();

  // Enlaces para las columnas del footer
  const footerLinks = {
    solutions: [
      { name: t("footer.links.digitalSignage"), href: "/#soluciones" },
      { name: t("footer.links.interactiveScreens"), href: "/#soluciones" },
      { name: t("footer.links.contentManagement"), href: "/#soluciones" },
    ],
    support: [
      { name: t("footer.links.documentation"), href: "/dashboard" },
      { name: t("footer.links.contact"), href: "/#contacto" },
      { name: t("footer.links.faq"), href: "/#preguntas" },
    ],
    company: [
      { name: t("footer.links.about"), href: "/" },
      { name: t("footer.links.blog"), href: "/" },
      { name: t("footer.links.partners"), href: "/" },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto w-full max-w-screen-xl p-6 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          {/* Logo and company info */}
          <div className="mb-6 md:mb-0 md:w-1/3">
            <Link href="/" className="flex items-center mb-4">
              <img
                src="/img/logov2.png"
                className="h-10 mr-3"
                alt="Upper Logo"
              />
            </Link>
            <p className="text-gray-600 mb-4 pr-4 max-w-md">
              {t("footer.title")}
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://www.linkedin.com/company/upper-digital-signage/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600"
              >
                <FaLinkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500"
              >
                <FaTwitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-800"
              >
                <FaFacebook className="w-5 h-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-600"
              >
                <FaInstagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Links section */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                {t("footer.sections.solutions")}
              </h2>
              <ul className="text-gray-600">
                {footerLinks.solutions.map((link, index) => (
                  <li className="mb-2" key={index}>
                    <a href={link.href} className="hover:text-teal-500">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                {t("footer.sections.support")}
              </h2>
              <ul className="text-gray-600">
                {footerLinks.support.map((link, index) => (
                  <li className="mb-2" key={index}>
                    <a href={link.href} className="hover:text-teal-500">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                {t("footer.sections.company")}
              </h2>
              <ul className="text-gray-600">
                {footerLinks.company.map((link, index) => (
                  <li className="mb-2" key={index}>
                    <a href={link.href} className="hover:text-teal-500">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto" />

        {/* Copyright section */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © 2024{" "}
            <a href="/" className="hover:underline">
              Upper™
            </a>
            .{t("footer.copyright")}
          </span>
          <div className="flex mt-4 sm:mt-0">
            <span className="text-sm text-gray-500">Versión: 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
