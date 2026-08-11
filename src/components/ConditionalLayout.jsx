"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? "h-screen bg-[#141b2d]" : "flex-1"}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
