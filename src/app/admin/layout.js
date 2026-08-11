import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-full h-full w-full bg-[#141b2d]">{children}</div>
    </AdminAuthProvider>
  );
}
