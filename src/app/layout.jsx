"use client";
import { Toaster } from "@/components/ui/sonner"
import { UserProvider } from './contexts/UserContext';
import { usePathname } from "next/navigation";
import Footer from "./components/Footer";
import "./globals.css";
import { CustomNavigationMenu } from "./components/NavigationMenu";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname.startsWith("/IniciarSesion") || pathname.startsWith("/Registrarse");

  return (
    <html lang="en">
      <body>
        <UserProvider>
          {!hideLayout && <CustomNavigationMenu />}
          {children}
          {!hideLayout && <Footer />}
        </UserProvider>
        <Toaster position="top-center" richColors  />
      </body>
    </html>
  );
}