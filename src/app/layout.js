import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Africo Cash | Portefeuille numérique by Africo Group",
  description:
    "Africo Cash — envoyez, retirez, convertissez et payez vos factures en toute confiance. Le portefeuille numérique du Groupe Africo en République Démocratique du Congo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col text-white font-inter">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
