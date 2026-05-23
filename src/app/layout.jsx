"use client";
import { Toaster } from "@/components/ui/sonner"
import { UserProvider } from './contexts/UserContext';
import { usePathname } from "next/navigation";
import Footer from "./components/Footer";
import "./globals.css";
import { CustomNavigationMenu } from "./components/NavigationMenu";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname.startsWith("/IniciarSesion") || pathname.startsWith("/Registrarse") || pathname.startsWith("/OlvideMiClave");
  const hideFooter = hideLayout || pathname.startsWith("/GrafoRecomendaciones") || pathname.startsWith("/MapaDispersion3D") || pathname.startsWith("/MapaDispersion");

  return (
    <html lang="en">
      <body>
        <UserProvider>
          {!hideLayout && <CustomNavigationMenu />}
          {children}
          {!hideFooter && <Footer />}
        </UserProvider>
        <Toaster position="bottom-center" richColors  />
      </body>
    </html>
  );
}