"use client"
import "./globals.css";
import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Head from "next/head";
// import i18n from 'i18next';
import i18n from '@/utils/i18n';
import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
const inter = Inter({ subsets: ["latin"] });

//! TODO: Agregar metadata
// export const metadata = {
//   title: "Upperds",
//   description: "Impulsa el éxito de tu negocio con Upper DS",
// };

export default function RootLayout({ children }) {

  const { t } = useTranslation();

    useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language");
      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
      }
    }
  }, []);

  console.log("i18n.language",i18n.language)
  return (
    <html lang={i18n.language}>
    {/* <html lang="en"> */}
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <Navigation />
        {/* <h1>{t('navbar.title')} TEST</h1> */}
        {children}
        <Footer />
      </body>
    </html>
  );
}
