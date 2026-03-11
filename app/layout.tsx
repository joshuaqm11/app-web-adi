import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import NavbarPublic from "./components/NavbarPublic";
import Footer from "./components/Footer";
import WhatsappButton from "./components/WhatsappButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADI San Juan de Florencia",
  description:
    "Sistema de gestión y transparencia de la Asociación de Desarrollo Integral de San Juan de Florencia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        {/* NAVBAR */}
        <NavbarPublic />

        {/* CONTENIDO DE LAS PAGINAS */}
        <main>
          {children}
        </main>

        {/* BOTON WHATSAPP */}
        <WhatsappButton />

        {/* FOOTER */}
        <Footer />

      </body>
    </html>
  );
}