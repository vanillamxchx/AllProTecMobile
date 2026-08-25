// App.js
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import LoginRegister from "./screens/LoginRegister";
import { MobileDataProvider } from "./context/MobileDataContext";
import { getApiBaseUrl, getAuthToken, setAuthToken } from "./services/api";

import AdminMain from "./screens/admin/AdminMain";
import StaffMain from "./screens/staff/StaffMain";
import ClientMain from "./screens/client/ClientMain";

const SESSION_STORAGE_KEY = "allprotec.session";

function getWebStorage() {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (_error) {
    return null;
  }
}

function readStoredSession() {
  const storage = getWebStorage();
  if (!storage) return null;

  try {
    const rawValue = storage.getItem(SESSION_STORAGE_KEY);
    if (!rawValue) return null;

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== "object") return null;
    const token = String(parsedValue.token || "").trim();
    const sessionApiBaseUrl = String(parsedValue.apiBaseUrl || "").trim();
    const activeApiBaseUrl = String(getApiBaseUrl() || "").trim();
    if (!token) {
      return null;
    }
    if (!sessionApiBaseUrl || (activeApiBaseUrl && sessionApiBaseUrl !== activeApiBaseUrl)) {
      storage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsedValue;
  } catch (_error) {
    return null;
  }
}

function persistSession(nextSession) {
  const storage = getWebStorage();
  if (!storage) return;

  try {
    if (nextSession) {
      storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      storage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (_error) {
    // Ignore storage failures and continue using in-memory session state.
  }
}

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
  const [session, setSession] = useState(() => readStoredSession());

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

  const applySession = (nextSession) => {
    const nextStoredSession = nextSession
      ? {
          ...nextSession,
          apiBaseUrl: getApiBaseUrl(),
        }
      : null;
    setAuthToken(nextStoredSession?.token || "");
    setSession(nextStoredSession);
  };

  const logout = () => {
    console.log("APP: logout");
    applySession(null);
  };

  useEffect(() => {
    persistSession(session);
    setAuthToken(session?.token || "");
  }, [session]);

  // Keep the API client token aligned before protected screens mount,
  // so the first bootstrap request does not trigger an accidental 401 logout.
  if (getAuthToken() !== String(session?.token || "")) {
    setAuthToken(session?.token || "");
  }

  if (!session) return <LoginRegister onLoginSuccess={applySession} />;

  const normalizedRole = normalizePermission(session?.userType, session?.role);
  const normalizedSession = { ...session, role: normalizedRole };

  if (normalizedRole === "admin")
    return (
      <MobileDataProvider session={normalizedSession} onSessionChange={applySession}>
        <AdminMain session={normalizedSession} onLogout={logout} />
      </MobileDataProvider>
    );

  if (normalizedRole === "staff")
    return (
      <MobileDataProvider session={normalizedSession} onSessionChange={applySession}>
        <StaffMain session={normalizedSession} onLogout={logout} />
      </MobileDataProvider>
    );

  return (
    <MobileDataProvider session={normalizedSession} onSessionChange={applySession}>
      <ClientMain session={normalizedSession} onLogout={logout} />
    </MobileDataProvider>
  );
}
