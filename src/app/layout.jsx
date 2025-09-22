import { Inter } from "next/font/google";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Red de Mujeres Académicas UNA",
  description: "Una plataforma para visibilizar logros, compartir conocimientos y conectar con la comunidad académica.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased flex flex-col min-h-screen`}
      >
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
