"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import Head from "next/head";
import i18n from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const { t } = useTranslation();

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") || "es";
    i18n.changeLanguage(storedLanguage);
  }, []);

  console.log("i18n.language", i18n.language);

  return (
    <html lang={i18n.language}>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
