"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const links = [
    { name: "Nosotros", href: "/#hero" },
    { name: "Soluciones", href: "/#servicios" },
    { name: "Aplicación", href: "/#hardware" },
    { name: "Precios", href: "/#precios" },
    { name: "FAQ", href: "/#faq" },
    { name: "Contacto", href: "/#contacto" },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 -my-4">
            <Image
              src="/img/UpperNewLogo-removebg-preview.png"
              alt="Upper Digital Signage"
              width={350}
              height={100}
              className="h-20 md:h-24 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-[#0080FF] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a
              href="mailto:contacto@upperds.mx"
              className="hover:text-[#0080FF] transition-colors"
            >
              contacto@upperds.mx
            </a>
            <span className="hidden md:inline">•</span>
            <a
              href="https://linkedin.com/company/upper-digital-signage"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {/* Google Cloud Badge - Full color icon on hover */}
            <div className="group flex items-center gap-2 cursor-default transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  className="transition-colors fill-gray-400 group-hover:fill-[#4285F4]"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  className="transition-colors fill-gray-400 group-hover:fill-[#34A853]"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  className="transition-colors fill-gray-400 group-hover:fill-[#FBBC05]"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  className="transition-colors fill-gray-400 group-hover:fill-[#EA4335]"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                Google Cloud
              </span>
            </div>

            {/* Firebase Badge - Orange on hover */}
            <div className="group flex items-center gap-2 cursor-default transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  className="transition-colors fill-gray-400 group-hover:fill-[#FFA000]"
                  d="M3.89 15.672L6.255.461A.542.542 0 017.27.288l2.543 4.771z"
                />
                <path
                  className="transition-colors fill-gray-400 group-hover:fill-[#F57C00]"
                  d="M20.684 19.364l-2.25-14a.54.54 0 00-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 001.588 0z"
                />
                <path
                  className="transition-colors fill-gray-400 group-hover:fill-[#FFCA28]"
                  d="M14.3 7.147l-1.82-3.482a.542.542 0 00-.96 0L3.53 17.984z"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400 group-hover:text-[#F57C00] transition-colors">
                Firebase
              </span>
            </div>

            {/* SSL Badge - Green on hover */}
            <div className="group flex items-center gap-2 cursor-default transition-all">
              <svg
                className="w-5 h-5 transition-colors text-gray-400 group-hover:text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span className="text-xs font-medium text-gray-400 group-hover:text-green-500 transition-colors">
                SSL Secure
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} Upper Digital Signage. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span>v2.1.0</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-600">Operativo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
