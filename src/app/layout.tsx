// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

// Volvemos a colocar la metadata aquí
export const metadata: Metadata = {
  title: "Red de Mujeres Académicas",
  description: "Plataforma para visibilizar logros y compartir conocimientos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white text-black`}>
        {children}
      </body>
    </html>
  );
}