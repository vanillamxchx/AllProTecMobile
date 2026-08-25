// App.js
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import LoginRegister from "./screens/LoginRegister";
import { MobileDataProvider } from "./context/MobileDataContext";

import AdminMain from "./screens/admin/AdminMain";
import StaffMain from "./screens/staff/StaffMain";
import ClientMain from "./screens/client/ClientMain";

function normalizePermission(userType, role) {
  const normalizedUserType = String(userType || "").trim().toLowerCase();
  if (["admin", "staff", "client", "customer"].includes(normalizedUserType)) {
    return normalizedUserType === "customer" ? "client" : normalizedUserType;
  }

  const normalizedRole = String(role || "").trim().toLowerCase();
  if (["admin", "owner", "co-owner"].includes(normalizedRole)) return "admin";
  if (["staff", "mechanic", "inspector", "coordinator"].includes(normalizedRole)) return "staff";
  return "client";
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }

    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
    );
  }, []);

  const logout = () => {
    console.log("APP: logout");
    setSession(null);
  };

  if (!session) return <LoginRegister onLoginSuccess={setSession} />;

  const normalizedRole = normalizePermission(session?.userType, session?.role);
  const normalizedSession = { ...session, role: normalizedRole };

  if (normalizedRole === "admin")
    return (
      <MobileDataProvider session={normalizedSession} onSessionChange={setSession}>
        <AdminMain session={normalizedSession} onLogout={logout} />
      </MobileDataProvider>
    );

  if (normalizedRole === "staff")
    return (
      <MobileDataProvider session={normalizedSession} onSessionChange={setSession}>
        <StaffMain session={normalizedSession} onLogout={logout} />
      </MobileDataProvider>
    );

  return (
    <MobileDataProvider session={normalizedSession} onSessionChange={setSession}>
      <ClientMain session={normalizedSession} onLogout={logout} />
    </MobileDataProvider>
  );
}
