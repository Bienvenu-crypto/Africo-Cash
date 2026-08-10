import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import ConditionalLayout from "@/components/ConditionalLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Africo Cash | Portefeuille numérique by Africo Group",
  description:
    "Africo Cash — envoyez, retirez, convertissez et payez vos factures en toute confiance. Le portefeuille numérique du Groupe Africo en République Démocratique du Congo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`h-full antialiased ${poppins.variable}`}>
      <body className={`${poppins.className} min-h-full flex flex-col font-sans bg-slate-50 text-navy-950`}>
        <ThemeProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}