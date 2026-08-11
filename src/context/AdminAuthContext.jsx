"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext(null);
const LEGACY_ADMIN_TOKEN_KEY = "adminToken";

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    sessionStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  }, []);

  const login = (newToken) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AdminAuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
