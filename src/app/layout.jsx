"use client";

import { usePathname } from "next/navigation";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname.startsWith("/IniciarSesion") || pathname.startsWith("/Registrarse");

  return (
    <html lang="en">
      <body>
        {!hideLayout && <NavBar />}
        {children}
        {!hideLayout && <Footer />}
      </body>
    </html>
  );
}