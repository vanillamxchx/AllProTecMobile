import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { apiRequest, getApiBaseUrl } from "../services/api";

const MobileDataContext = createContext(null);
const AUTO_SYNC_MS = 3000;

const INITIAL_DATA = {
  bookings: [],
  services: [],
  inventory: [],
  payments: [],
  users: [],
  auditLogs: [],
  reviews: [],
  promos: [],
  expenses: [],
  commissions: [],
  alerts: [],
  summary: {},
};

function normalizeRole(userType, role) {
  const normalizedUserType = String(userType || "").trim().toLowerCase();
  if (["admin", "staff", "client", "customer"].includes(normalizedUserType)) {
    return normalizedUserType === "customer" ? "client" : normalizedUserType;
  }

  const normalizedRole = String(role || "").trim().toLowerCase();
  if (["admin", "owner", "co-owner"].includes(normalizedRole)) return "admin";
  if (["staff", "mechanic", "inspector", "coordinator"].includes(normalizedRole)) return "staff";
  return "client";
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function getAuditLogKey(log) {
  return String(log?.id || log?._id || "").trim();
}

function normalizeBootstrapPayload(payload) {
  const nextPayload = payload && typeof payload === "object" ? payload : {};
  const inventory = Array.isArray(nextPayload.inventory)
    ? nextPayload.inventory
    : Array.isArray(nextPayload.stockMonitoring)
      ? nextPayload.stockMonitoring
      : [];

  return {
    ...INITIAL_DATA,
    ...nextPayload,
    inventory,
    stockMonitoring: inventory,
  };
}

function matchUserScopedRecord(record, currentUser) {
  const customerEmail = normalizeName(record?.customerEmail);
  const clientEmail = normalizeName(record?.clientEmail);
  const currentEmail = normalizeName(currentUser?.email);
  const customerName = normalizeName(record?.customer);
  const clientName = normalizeName(record?.client);
  const currentName = normalizeName(currentUser?.name);

  return (
    (currentEmail && customerEmail === currentEmail) ||
    (currentEmail && clientEmail === currentEmail) ||
    (currentName && customerName === currentName) ||
    (currentName && clientName === currentName)
  );
}

export function MobileDataProvider({ session, onSessionChange, children }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [lastErrorAt, setLastErrorAt] = useState("");
  const syncInFlightRef = useRef(false);
  const loadDataRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const role = normalizeRole(session?.userType, session?.role);

  const loadData = async ({ silent = false } = {}) => {
    if (!session?.email) return;
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    if (!silent) setLoading(true);

    try {
      const payload = await apiRequest("/api/admin/bootstrap");
      setData(normalizeBootstrapPayload(payload));
      setError("");
      setConnected(true);
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      if (!silent) {
        setData(INITIAL_DATA);
      }
      setError(err.message || "Failed to load data.");
      setConnected(false);
      setLastErrorAt(new Date().toISOString());
    } finally {
      syncInFlightRef.current = false;
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDataRef.current = loadData;
  });

  useEffect(() => {
    if (!session?.email) {
      setData(INITIAL_DATA);
      setError("");
      setLoading(false);
      setConnected(false);
      setLastSyncedAt("");
      setLastErrorAt("");
      return;
    }

    loadData();
  }, [session?.email]);

  useEffect(() => {
    if (!session?.email) return undefined;

    const intervalId = setInterval(() => {
      loadDataRef.current?.({ silent: true });
    }, AUTO_SYNC_MS);

    return () => clearInterval(intervalId);
  }, [session?.email]);

  useEffect(() => {
    if (!session?.email) return undefined;

    if (Platform.OS === "web" && typeof window !== "undefined" && typeof document !== "undefined") {
      const handleWindowFocus = () => {
        loadDataRef.current?.({ silent: true });
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          loadDataRef.current?.({ silent: true });
        }
      };

      window.addEventListener("focus", handleWindowFocus);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        window.removeEventListener("focus", handleWindowFocus);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (
        (previousAppState === "background" || previousAppState === "inactive") &&
        nextAppState === "active"
      ) {
        loadDataRef.current?.({ silent: true });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [session?.email]);

  const currentUser = useMemo(() => {
    const foundUser = data.users.find(
      (user) => normalizeName(user.email) === normalizeName(session?.email)
    );

    if (foundUser) return foundUser;

    return {
      id: session?.id || "",
      name: session?.name || "",
      first: session?.first || "",
      last: session?.last || "",
      email: session?.email || "",
      phone: session?.phone || "",
      userType: session?.userType || "",
      role: session?.role || "client",
      status: "active",
    };
  }, [data.users, session]);

  const scopedBookings = useMemo(() => {
    if (role === "admin") return data.bookings;
    if (role === "staff") {
      const currentName = normalizeName(currentUser?.name);
      const currentEmail = normalizeName(currentUser?.email);
      return data.bookings.filter((booking) => {
        const assigned = normalizeName(booking.assigned);
        return !assigned || assigned === currentName || assigned === currentEmail;
      });
    }
    return data.bookings.filter((booking) => matchUserScopedRecord(booking, currentUser));
  }, [data.bookings, role, currentUser]);

  const scopedPayments = useMemo(() => {
    if (role === "client") {
      return data.payments.filter((payment) => matchUserScopedRecord(payment, currentUser));
    }
    return data.payments;
  }, [data.payments, role, currentUser]);

  const scopedReviews = useMemo(() => {
    if (role === "client") {
      return data.reviews.filter((review) => matchUserScopedRecord(review, currentUser));
    }
    return data.reviews;
  }, [data.reviews, role, currentUser]);

  const auditLogs = useMemo(
    () =>
      data.auditLogs.map((log) => ({
        ...log,
        isArchived: Boolean(log.archived),
      })),
    [data.auditLogs]
  );

  const visibleNotifications = useMemo(() => {
    const activeLogs = auditLogs.filter((item) => !item.isArchived);
    if (role === "admin") return activeLogs.slice(0, 20);
    if (role === "staff") {
      return activeLogs
        .filter(
          (item) =>
            ![
              "Updated user",
              "Deleted user",
              "Activated user",
              "Deactivated user",
              "Updated user password",
              "Cleared audit logs",
            ].includes(item.action)
        )
        .slice(0, 20);
    }

    return activeLogs
      .filter((item) => {
        const meta = item.meta || {};
        return (
          normalizeName(item.userId) === normalizeName(currentUser?.email) ||
          normalizeName(meta.email) === normalizeName(currentUser?.email) ||
          normalizeName(meta.customerEmail) === normalizeName(currentUser?.email) ||
          normalizeName(meta.clientEmail) === normalizeName(currentUser?.email)
        );
      })
      .slice(0, 20);
  }, [auditLogs, role, currentUser]);

  const mutate = async (path, options = {}) => {
    const result = await apiRequest(path, options);
    await loadData({ silent: true });
    return result;
  };

  const auditUser = session?.email || session?.name || "system";
  const applyAuditArchiveState = (ids, archived) => {
    const normalizedIds = new Set(ids.filter(Boolean));
    if (!normalizedIds.size) return;

    setData((prev) => ({
      ...prev,
      auditLogs: prev.auditLogs.map((log) => {
        const logKey = getAuditLogKey(log);
        if (!normalizedIds.has(logKey)) return log;

        return {
          ...log,
          archived,
          archivedAt: archived ? new Date().toLocaleString() : "",
          archivedBy: archived ? auditUser : "",
        };
      }),
    }));
  };

  const value = {
    ...data,
    auditLogs,
    role,
    loading,
    error,
    connected,
    apiBaseUrl: getApiBaseUrl(),
    lastSyncedAt,
    lastErrorAt,
    autoSyncMs: AUTO_SYNC_MS,
    reload: loadData,
    currentUser,
    notifications: visibleNotifications,
    scopedBookings,
    scopedPayments,
    scopedReviews,
    createBooking: (payload) =>
      mutate("/api/admin/bookings", {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    updateBooking: (id, payload) =>
      mutate(`/api/admin/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    deleteBooking: (id) =>
      mutate(`/api/admin/bookings/${id}?auditUser=${encodeURIComponent(auditUser)}`, {
        method: "DELETE",
      }),
    updatePayment: (id, payload) =>
      mutate(`/api/admin/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    submitPaymentProof: (payment, payload) =>
      mutate(`/api/admin/payments/${payment.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...payment,
          ...payload,
          status: "For Verification",
          proofSubmittedAt: new Date().toISOString(),
          auditUser,
        }),
      }),
    createService: (payload) =>
      mutate("/api/admin/services", {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    updateService: (id, payload) =>
      mutate(`/api/admin/services/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    createInventoryItem: (payload) =>
      mutate("/api/admin/stock-monitoring", {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    updateInventoryItem: (id, payload) =>
      mutate(`/api/admin/stock-monitoring/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    restockInventoryItem: (id, payload) =>
      mutate(`/api/admin/stock-monitoring/${id}/restock`, {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    updateUser: async (id, payload) => {
      const result = await mutate(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...payload, auditUser }),
      });

      if (normalizeName(result?.email) === normalizeName(session?.email)) {
        onSessionChange?.({
          ...session,
          id: result.id || session?.id,
          email: result.email || session?.email,
          userType: result.userType || session?.userType,
          role: normalizeRole(result.userType || session?.userType, result.role || session?.role),
          name: result.name || session?.name,
          first: result.first || session?.first,
          last: result.last || session?.last,
          phone: result.phone || session?.phone,
        });
      }

      return result;
    },
    updateProfile: async (payload) => {
      const updatedUser = await mutate(`/api/admin/users/${currentUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...currentUser,
          ...payload,
          auditUser,
        }),
      });

      onSessionChange?.({
        ...session,
        id: updatedUser.id || session?.id,
        email: updatedUser.email || session?.email,
        userType: updatedUser.userType || session?.userType,
        role: normalizeRole(updatedUser.userType || session?.userType, updatedUser.role || session?.role),
        name: updatedUser.name || session?.name,
        first: updatedUser.first || session?.first,
        last: updatedUser.last || session?.last,
        phone: updatedUser.phone || session?.phone,
      });

      return updatedUser;
    },
    createReview: (payload) =>
      mutate("/api/admin/reviews", {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    archiveAuditLogs: async (ids = []) => {
      const normalizedIds = Array.from(new Set(ids.filter(Boolean)));
      if (!normalizedIds.length) return;
      await Promise.all(
        normalizedIds.map((id) =>
          apiRequest(`/api/admin/audit-logs/${encodeURIComponent(id)}/archive`, {
            method: "PUT",
            body: JSON.stringify({ auditUser }),
          })
        )
      );
      applyAuditArchiveState(normalizedIds, true);
      loadDataRef.current?.({ silent: true });
    },
    unarchiveAuditLogs: async (ids = []) => {
      const normalizedIds = Array.from(new Set(ids.filter(Boolean)));
      if (!normalizedIds.length) return;
      await Promise.all(
        normalizedIds.map((id) =>
          apiRequest(`/api/admin/audit-logs/${encodeURIComponent(id)}/unarchive`, {
            method: "PUT",
            body: JSON.stringify({ auditUser }),
          })
        )
      );
      applyAuditArchiveState(normalizedIds, false);
      loadDataRef.current?.({ silent: true });
    },
    clearAuditLogs: () =>
      mutate(`/api/admin/audit-logs?auditUser=${encodeURIComponent(auditUser)}`, {
        method: "DELETE",
      }),
    getClientStats: () => {
      const today = new Date().toISOString().slice(0, 10);
      const todayBookings = scopedBookings.filter((booking) => booking.date === today).length;
      const upcoming = scopedBookings.filter((booking) => normalizeStatus(booking.status) !== "completed").length;
      const completed = scopedBookings.filter((booking) => normalizeStatus(booking.status) === "completed").length;
      return { today: todayBookings, upcoming, completed };
    },
  };

  return <MobileDataContext.Provider value={value}>{children}</MobileDataContext.Provider>;
}

export async function loginWithApi(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function requestSignupOtp(payload) {
  return apiRequest("/api/auth/signup/request-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifySignupOtp(payload) {
  return apiRequest("/api/auth/signup/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function useMobileData() {
  const context = useContext(MobileDataContext);
  if (!context) {
    throw new Error("useMobileData must be used inside MobileDataProvider.");
  }
  return context;
}
