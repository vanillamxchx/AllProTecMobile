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
  quoteRequests: [],
  expenses: [],
  commissions: [],
  alerts: [],
  summary: {},
  rewards: [],
  customerRewards: [],
};

const ALL_STAFF_ROLE_STRINGS = new Set([
  "staff",
  "mechanic",
  "inspector",
  "coordinator",
  "detailer",
  "technician",
  "employee",
  "manager",
  "senior staff",
  "junior staff",
  "general manager",
  "sales manager",
  "sales associate",
  "inventory clerk",
  "junior detailer",
  "senior detailer",
  "marketing",
]);

function normalizeRole(userType, role) {
  const normalizedUserType = String(userType || "").trim().toLowerCase();
  if (["admin", "staff", "client", "customer"].includes(normalizedUserType)) {
    return normalizedUserType === "customer" ? "client" : normalizedUserType;
  }

  const normalizedRole = String(role || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (["admin", "owner", "co-owner"].includes(normalizedRole)) return "admin";
  if (ALL_STAFF_ROLE_STRINGS.has(normalizedRole)) return "staff";
  return "client";
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function getAuditLogKey(log) {
  return String(log?.id || log?._id || log?.auditId || "").trim();
}

export function formatAuditTimestamp(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getAuditSortTime(log = {}) {
  const candidates = [
    log.createdAt,
    log.timestamp,
    log.ts,
    log.updatedAt,
    log.date,
  ];
  for (const c of candidates) {
    if (c) {
      const t = new Date(c).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  return 0;
}

function normalizeAuditLog(log = {}, index = 0) {
  const nextLog = log && typeof log === "object" ? log : {};
  const id = String(nextLog.id || nextLog._id || nextLog.auditId || `AUDIT-${1000 + index}`).trim();
  const userId = String(
    nextLog.userId ||
    nextLog.user ||
    nextLog.auditUser ||
    nextLog.actor ||
    nextLog.userEmail ||
    nextLog.performedBy ||
    nextLog.adminEmail ||
    "System"
  ).trim();
  const action = String(
    nextLog.action ||
    nextLog.title ||
    nextLog.event ||
    nextLog.activity ||
    nextLog.description ||
    "System update"
  ).trim();
  const targetId = String(
    nextLog.targetId ||
    nextLog.target ||
    nextLog.target_id ||
    nextLog.entityId ||
    nextLog.bookingId ||
    ""
  ).trim();
  const rawTs = nextLog.ts || nextLog.timestamp || nextLog.createdAt || nextLog.date || nextLog.time || "";
  const formattedTs = formatAuditTimestamp(rawTs);

  return {
    ...nextLog,
    id,
    _id: nextLog._id || id,
    userId,
    user: userId,
    action,
    targetId: targetId || "-",
    ts: formattedTs || (typeof rawTs === "string" && rawTs ? rawTs : "Recent"),
    createdAt: nextLog.createdAt || rawTs || new Date().toISOString(),
    timestamp: nextLog.timestamp || rawTs || new Date().toISOString(),
    archived: Boolean(nextLog.archived || nextLog.isArchived),
    isArchived: Boolean(nextLog.archived || nextLog.isArchived),
  };
}

function extractAuditLogsFromPayload(payload) {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload.auditLogs,
    payload.audit,
    payload.audits,
    payload.auditTrail,
    payload.logs,
    payload.activityLogs,
    payload.auditRecords,
    payload.data?.auditLogs,
    payload.data?.logs,
    payload.data?.audit,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate;
    }
  }
  return Array.isArray(payload.auditLogs) ? payload.auditLogs : [];
}

const QUOTE_STORAGE_KEY = "allprotec.quoteRequests";

function clearStoredMockQuotes() {
  const storage = getWebStorage();
  if (!storage) return;
  try {
    storage.removeItem(QUOTE_STORAGE_KEY);
  } catch (_e) {
    // Ignore storage errors
  }
}
clearStoredMockQuotes();

function normalizeQuoteRequest(item = {}, index = 0) {
  const next = item && typeof item === "object" ? item : {};
  const id = String(next.id || next._id || next.quoteId || next.requestId || "").trim();
  const fullName = String(
    next.fullName || next.name || next.customerName || next.customer || next.client || next.clientName || ""
  ).trim();
  const phone = String(
    next.phone || next.mobile || next.phoneNumber || next.contact || next.contactNumber || ""
  ).trim();
  const email = String(next.email || next.customerEmail || next.clientEmail || "").trim();
  const vehicleType = String(
    next.vehicleType || next.vehicle || next.car || next.carType || next.model || ""
  ).trim();
  const carSize = String(
    next.carSize || next.size || next.vehicleSize || next.category || ""
  ).trim();
  const service = String(
    next.service || next.serviceName || next.serviceType || next.package || ""
  ).trim();
  const estimateLabel = String(
    next.estimateLabel ||
      next.estimate ||
      next.priceLabel ||
      (next.price !== undefined ? formatCurrency(next.price) : "") ||
      (next.amount !== undefined ? formatCurrency(next.amount) : "") ||
      ""
  ).trim();
  const message = String(
    next.message || next.notes || next.note || next.inquiry || next.details || next.remarks || next.description || ""
  ).trim();
  const rawStatus = String(next.status || "Received").trim();
  const status = rawStatus.toLowerCase() === "received" ? "Received" : rawStatus ? rawStatus : "Received";
  const createdAt = next.createdAt || next.created_at || next.date || next.timestamp || next.ts || "";
  const updatedAt = next.updatedAt || next.updated_at || createdAt || "";

  return {
    ...next,
    id: id || `quote-${index + 1}`,
    _id: next._id || id || `quote-${index + 1}`,
    fullName: fullName || "Unknown Customer",
    phone: phone || "-",
    email,
    vehicleType: vehicleType || "-",
    carSize: carSize || "-",
    service: service || "General Service",
    estimateLabel: estimateLabel || "Custom quote available upon review",
    message: message || "No additional notes provided.",
    status,
    createdAt,
    updatedAt,
  };
}

function extractQuoteRequestsFromPayload(payload) {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload)) return payload;

  const quoteKeys = [
    "quoteRequests",
    "quotes",
    "quote_requests",
    "quoterequests",
    "landingPageQuotes",
    "landingQuotes",
    "quoteInquiries",
    "quotations",
    "inquiries",
    "leads",
    "requests",
  ];

  // 1. Direct specific keys that have items
  for (const key of quoteKeys) {
    if (Array.isArray(payload[key]) && payload[key].length > 0) {
      return payload[key];
    }
  }

  // 2. Specific keys nested in payload.data that have items
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    for (const key of quoteKeys) {
      if (Array.isArray(payload.data[key]) && payload.data[key].length > 0) {
        return payload.data[key];
      }
    }
  }

  // 3. Specific keys nested in payload.payload that have items
  if (payload.payload && typeof payload.payload === "object" && !Array.isArray(payload.payload)) {
    for (const key of quoteKeys) {
      if (Array.isArray(payload.payload[key]) && payload.payload[key].length > 0) {
        return payload.payload[key];
      }
    }
  }

  // 4. Any direct specific keys even if empty
  for (const key of quoteKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  // 5. If payload.data itself is an array of items
  if (Array.isArray(payload.data) && payload.data.length > 0) {
    return payload.data;
  }

  // 6. Generic list wrappers
  if (Array.isArray(payload.items) && payload.items.length > 0) return payload.items;
  if (Array.isArray(payload.results) && payload.results.length > 0) return payload.results;
  if (Array.isArray(payload.rows) && payload.rows.length > 0) return payload.rows;

  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function generateOperationalAuditLogs(inventory = [], bookings = [], sessionUser = null) {
  const syntheticLogs = [];
  const actorName = sessionUser?.name || sessionUser?.email || "Inventory Clerk";

  // From inventory items (stock monitoring)
  (inventory || []).forEach((item, idx) => {
    const itemName = String(item.name || item.itemName || `Stock Item ${idx + 1}`).trim();
    const itemQty = Number(item.quantity || item.stock || 0);
    const itemUnit = String(item.unit || "units").trim();
    const itemId = String(item.id || item._id || `STK-${idx + 1}`).trim();

    if (item.lastRestocked || itemQty > 0) {
      const restockTime = item.lastRestocked || item.updatedAt || item.createdAt || new Date().toISOString();
      syntheticLogs.push(
        normalizeAuditLog({
          id: `AUDIT-STK-RESTOCK-${itemId}`,
          userId: item.updatedBy || actorName,
          action: "Restocked stock monitoring item",
          targetId: `${itemName} (${itemQty} ${itemUnit})`,
          ts: restockTime,
          createdAt: restockTime,
          meta: { type: "stock-restock", itemId },
        }, syntheticLogs.length)
      );
    }

    const createTime = item.createdAt || item.updatedAt || new Date().toISOString();
    syntheticLogs.push(
      normalizeAuditLog({
        id: `AUDIT-STK-CREATE-${itemId}`,
        userId: item.createdBy || "System",
        action: "Created stock monitoring item",
        targetId: `${itemName} (${item.category || "Supplies"})`,
        ts: createTime,
        createdAt: createTime,
        meta: { type: "stock-create", itemId },
      }, syntheticLogs.length)
    );
  });

  // From bookings (service tracking / status updates)
  (bookings || []).forEach((booking, idx) => {
    const bookingId = String(booking.id || booking._id || `BK-${idx + 1}`).trim();
    const serviceName = String(booking.service || booking.serviceName || "Service").trim();
    const updateTime = booking.updatedAt || booking.bookingDate || booking.date || booking.createdAt || new Date().toISOString();

    syntheticLogs.push(
      normalizeAuditLog({
        id: `AUDIT-TRK-${bookingId}`,
        userId: booking.assigned || actorName,
        action: "Updated service tracking",
        targetId: `${bookingId} - ${serviceName}`,
        ts: updateTime,
        createdAt: updateTime,
        meta: { type: "tracking-update", bookingId },
      }, syntheticLogs.length)
    );

    const createTime = booking.createdAt || booking.date || new Date().toISOString();
    syntheticLogs.push(
      normalizeAuditLog({
        id: `AUDIT-BK-CREATE-${bookingId}`,
        userId: booking.customer || "Client",
        action: "Created booking",
        targetId: `${bookingId} - ${serviceName}`,
        ts: createTime,
        createdAt: createTime,
        meta: { type: "booking-create", bookingId },
      }, syntheticLogs.length)
    );
  });

  return syntheticLogs;
}


function getWebStorage() {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch (_error) {
    return null;
  }
}

function readStoredNotificationId(key) {
  const storage = getWebStorage();
  if (!storage || !key) return "";
  try {
    return String(storage.getItem(key) || "").trim();
  } catch (_error) {
    return "";
  }
}

function writeStoredNotificationId(key, value) {
  const storage = getWebStorage();
  if (!storage || !key) return;
  try {
    if (value) storage.setItem(key, value);
    else storage.removeItem(key);
  } catch (_error) {
    // Ignore storage issues and keep in-memory state.
  }
}

function buildNotificationMessage(log) {
  const actor = log.userId || "System";
  const target = log.targetId ? ` (${log.targetId})` : "";
  return `${actor} ${String(log.action || "").toLowerCase()}${target}`;
}

function mapAuditLogToNotification(log) {
  return {
    id: getAuditLogKey(log),
    title: log.action || "System update",
    message: buildNotificationMessage(log),
    userId: log.userId || "system",
    targetId: log.targetId || "",
    createdAt: log.createdAt || "",
    ts: log.ts || log.createdAt || "",
    meta: log.meta || {},
  };
}

const PAYMENT_NOTIFICATION_TITLES = new Set([
  "Updated payment status",
  "Submitted payment proof",
  "Updated payment proof",
  "Updated payment method",
  "Updated payment",
  "Payment details requested",
]);

const STOCK_NOTIFICATION_TITLES = new Set([
  "Created stock monitoring item",
  "Updated stock monitoring item",
  "Restocked stock monitoring item",
  "Deleted stock monitoring item",
]);

const BOOKING_NOTIFICATION_TITLES = new Set([
  "Created booking",
  "Updated booking status",
]);

const TRACKING_NOTIFICATION_TITLES = new Set([
  "Updated service tracking",
]);

function isPaymentNotification(item) {
  return PAYMENT_NOTIFICATION_TITLES.has(item.title);
}

function isStockNotification(item) {
  return STOCK_NOTIFICATION_TITLES.has(item.title);
}

function isBookingStatusNotification(item) {
  return BOOKING_NOTIFICATION_TITLES.has(item.title);
}

function isTrackingNotification(item) {
  return TRACKING_NOTIFICATION_TITLES.has(item.title);
}

function isEssentialNotification(item) {
  return (
    isPaymentNotification(item) ||
    isStockNotification(item) ||
    isBookingStatusNotification(item) ||
    isTrackingNotification(item)
  );
}

function isCustomerRelatedNotification(item, email, fullName) {
  return (
    String(item.userId || "").trim().toLowerCase() === email ||
    String(item.meta?.email || "").trim().toLowerCase() === email ||
    String(item.meta?.customerEmail || "").trim().toLowerCase() === email ||
    String(item.meta?.clientEmail || "").trim().toLowerCase() === email ||
    String(item.meta?.customer || "").trim().toLowerCase() === fullName ||
    String(item.meta?.client || "").trim().toLowerCase() === fullName
  );
}

function isSelfAuthoredNotification(item, email, fullName) {
  const actor = String(item.userId || "").trim().toLowerCase();
  if (!actor) return false;
  if (email && actor === email) return true;
  if (fullName && actor === fullName) return true;
  return false;
}

function mapAlertsToNotifications(alerts, role) {
  if (role === "client") return [];

  return (alerts || [])
    .filter((alert) => String(alert.title || "").toLowerCase().includes("low stock"))
    .map((alert, index) => ({
      id: `alert-low-stock-${index}-${String(alert.description || "").trim()}`,
      title: alert.title || "Stock alert",
      message: alert.description || "Stock monitoring needs attention.",
      userId: "system",
      targetId: "stock-monitoring",
      createdAt: "",
      ts: "System alert",
      meta: { type: "stock-alert" },
    }));
}

function filterNotificationsForUser(auditLogs, alerts, currentUser) {
  const role = normalizeRole(currentUser?.userType, currentUser?.role);
  const email = String(currentUser?.email || "").trim().toLowerCase();
  const fullName = String(currentUser?.name || "").trim().toLowerCase();

  const essentialAuditNotifications = auditLogs
    .map(mapAuditLogToNotification)
    .filter((item) => {
      if (!isEssentialNotification(item)) {
        return false;
      }

      if (isSelfAuthoredNotification(item, email, fullName)) {
        return false;
      }

      if (role === "admin" || role === "staff") {
        return true;
      }

      if (isStockNotification(item)) {
        return false;
      }

      return isCustomerRelatedNotification(item, email, fullName);
    })
    .slice(0, 20);

  return [...mapAlertsToNotifications(alerts, role), ...essentialAuditNotifications].slice(0, 20);
}

function decorateNotificationsWithUnread(items, lastReadNotificationId) {
  if (!items.length) return [];

  let unreadUntilIndex = 0;
  if (lastReadNotificationId) {
    const readIndex = items.findIndex((item) => item.id === lastReadNotificationId);
    unreadUntilIndex = readIndex === -1 ? items.length : readIndex;
  }

  return items.map((item, index) => ({
    ...item,
    isUnread: index < unreadUntilIndex,
  }));
}

function normalizeBootstrapPayload(payload) {
  const nextPayload = payload && typeof payload === "object" ? payload : {};
  const inventory = Array.isArray(nextPayload.inventory)
    ? nextPayload.inventory
    : Array.isArray(nextPayload.stockMonitoring)
      ? nextPayload.stockMonitoring
      : Array.isArray(nextPayload.stock)
        ? nextPayload.stock
        : Array.isArray(nextPayload.supplies)
          ? nextPayload.supplies
          : [];

  const payments = Array.isArray(nextPayload.payments)
    ? nextPayload.payments
    : Array.isArray(nextPayload.paymentRecords)
      ? nextPayload.paymentRecords
      : Array.isArray(nextPayload.billings)
        ? nextPayload.billings
        : [];

  const bookings = Array.isArray(nextPayload.bookings)
    ? nextPayload.bookings
    : Array.isArray(nextPayload.appointments)
      ? nextPayload.appointments
      : [];

  const rawQuoteRequests = extractQuoteRequestsFromPayload(nextPayload);
  const quoteRequests = (Array.isArray(rawQuoteRequests) ? rawQuoteRequests : []).map(normalizeQuoteRequest);

  const quoteRequestCount = Number(
    nextPayload.quoteRequestCount !== undefined
      ? nextPayload.quoteRequestCount
      : (nextPayload.summary?.quoteRequestCount !== undefined
        ? nextPayload.summary.quoteRequestCount
        : quoteRequests.length)
  );

  const baseSummary =
    nextPayload.summary && typeof nextPayload.summary === "object"
      ? nextPayload.summary
      : {};

  const summary = {
    ...baseSummary,
    ...(nextPayload.bookingsToday !== undefined ? { bookingsToday: nextPayload.bookingsToday } : {}),
    ...(nextPayload.inProgressCount !== undefined ? { inProgressCount: nextPayload.inProgressCount } : {}),
    ...(nextPayload.lowStockCount !== undefined ? { lowStockCount: nextPayload.lowStockCount } : {}),
    ...(nextPayload.paidRevenue !== undefined ? { paidRevenue: nextPayload.paidRevenue } : {}),
    quoteRequestCount,
  };

  const rewards = Array.isArray(nextPayload.rewards)
    ? nextPayload.rewards.map(normalizeRewardRecord)
    : [];
  const customerRewards = Array.isArray(nextPayload.customerRewards)
    ? nextPayload.customerRewards.map(normalizeRewardRecord)
    : [];

  const rawAuditLogs = extractAuditLogsFromPayload(nextPayload);
  let auditLogs = rawAuditLogs.map(normalizeAuditLog);
  if (!auditLogs || auditLogs.length === 0) {
    auditLogs = generateOperationalAuditLogs(inventory, bookings);
  }

  return {
    ...INITIAL_DATA,
    ...nextPayload,
    bookings,
    payments,
    inventory,
    stockMonitoring: inventory,
    quoteRequests,
    auditLogs,
    summary,
    rewards,
    customerRewards,
  };
}

function normalizeRewardRecord(reward) {
  const nextReward = reward && typeof reward === "object" ? reward : {};
  const rewardName = String(
    nextReward.rewardName || nextReward.name || nextReward.title || ""
  ).trim();
  const rewardValue = String(
    nextReward.rewardValue || nextReward.value || nextReward.description || ""
  ).trim();
  const derivedStatus = typeof nextReward.active === "boolean"
    ? (nextReward.active ? "Active" : "Disabled")
    : "";

  return {
    ...nextReward,
    id: nextReward.id || nextReward._id || nextReward.rewardId || "",
    title: nextReward.title || rewardName,
    name: nextReward.name || rewardName,
    rewardName,
    value: nextReward.value || rewardValue,
    rewardValue,
    description: nextReward.description || rewardValue,
    status: nextReward.status || derivedStatus,
  };
}

// Web utils from AutoFlow-main (invoice, rewards, status)
const SALES_TAX_RATE = 0.12;

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr || "-");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatCurrency(value) {
  return `P ${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function statusMeta(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("paid")) return { cls: "paid", label: "Paid" };
  if (s.includes("verification")) return { cls: "review", label: "For Verification" };
  if (s.includes("reject")) return { cls: "rejected", label: "Rejected" };
  return { cls: "pending", label: status || "Pending" };
}

export function normalizeStageStatus(status, fallback = "Pending") {
  const raw = String(status || "").trim();
  return raw || fallback;
}

export function getPaymentTotal(payment) {
  return Number(payment?.finalAmount || payment?.amount || 0);
}

export function getAmountPaid(payment) {
  const downPaymentPaid =
    String(payment?.downPaymentStatus || "").trim().toLowerCase() === "paid"
      ? Number(payment?.downPaymentAmount || 0)
      : 0;
  const fullPaymentPaid =
    String(payment?.finalPaymentStatus || payment?.status || "").trim().toLowerCase() === "paid"
      ? Math.max(0, getPaymentTotal(payment) - downPaymentPaid)
      : 0;
  return downPaymentPaid + fullPaymentPaid;
}

export function getRemainingBalance(payment) {
  return Math.max(0, getPaymentTotal(payment) - getAmountPaid(payment));
}

export function getPaymentStageLabel(payment = {}) {
  const nextPayment = payment && typeof payment === "object" ? payment : {};
  const legacyStatus = normalizeStageStatus(nextPayment.status, "Pending");
  const downPaymentStatus = normalizeStageStatus(
    nextPayment.downPaymentStatus,
    nextPayment.downPaymentRequired === false ? "Not Required" : "Pending"
  );
  const finalPaymentStatus = normalizeStageStatus(nextPayment.finalPaymentStatus, legacyStatus);

  if (nextPayment.autoCancelledForNoDownPaymentProof) return "Cancelled";
  if (finalPaymentStatus === "Paid" || legacyStatus === "Paid") return "Paid";
  if (finalPaymentStatus === "For Verification") return "Full Payment For Verification";
  if (finalPaymentStatus === "Rejected") return "Rejected";
  if (nextPayment.downPaymentRequired === true && downPaymentStatus === "Paid") return "DP Paid / Balance Pending";
  if (nextPayment.downPaymentRequired === true && downPaymentStatus === "For Verification") return "DP For Verification";
  if (nextPayment.downPaymentRequired === true && downPaymentStatus === "Rejected") return "DP Rejected";
  if (nextPayment.downPaymentRequired === true) return "DP Pending";
  if (finalPaymentStatus === "Pending") return "Balance Pending";
  return legacyStatus;
}

export function getInvoiceBreakdown(payment) {
  const total = Number(payment?.amount || 0);
  const originalTotal = Number(payment?.originalAmount || total);
  const promoDiscount = Number(payment?.promoDiscountAmount || 0);
  const rewardDiscount = Number(payment?.discountAmount || payment?.rewardDiscountAmount || 0);
  const originalSubtotal = Math.round((originalTotal / (1 + SALES_TAX_RATE)) * 100) / 100;
  const subtotal = Number(payment?.subtotalAfterDiscount || 0) || Math.round((total / (1 + SALES_TAX_RATE)) * 100) / 100;
  const tax = Number(payment?.taxAmount || 0) || Math.round((total - subtotal) * 100) / 100;
  const finalAmount = Number(payment?.finalAmount || 0) || total;

  return { originalTotal, promoDiscount, rewardDiscount, subtotal, tax, total: finalAmount };
}

export function isRewardExpired(reward) {
  const expirationDate = String(reward?.expirationDate || "").trim();
  if (!expirationDate) return false;
  return new Date(expirationDate) < new Date();
}

export function isRewardUsable(reward) {
  return String(reward?.status || "").trim().toLowerCase() === "unused" && !isRewardExpired(reward);
}

export function getUsableCustomerRewards(customerRewards, currentUser, matchFn = matchUserScopedRecord) {
  const customerRewardsFiltered = customerRewards.filter((r) => matchFn(r, currentUser));
  return customerRewardsFiltered.filter(isRewardUsable);
}

export function parseRewardDiscount(value, amount) {
  const raw = String(value || "").trim();
  const baseAmount = Math.max(0, Number(amount || 0));
  if (!raw || baseAmount <= 0) return 0;

  const percentMatch = raw.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const percent = Math.min(100, Math.max(0, Number(percentMatch[1]) || 0));
    return Math.min(baseAmount, Number(((baseAmount * percent) / 100).toFixed(2)));
  }

  const fixedMatch = raw.replace(/,/g, "").match(/(?:php|p|₱)?\s*(\d+(?:\.\d+)?)/i);
  if (fixedMatch && /discount|off|php|₱|p\s*\d/i.test(raw)) {
    return Math.min(baseAmount, Number((Number(fixedMatch[1]) || 0).toFixed(2)));
  }

  return 0;
}

export function getRewardPreview(reward, amount) {
  const discountAmount = parseRewardDiscount(reward?.rewardValue, amount);
  return {
    discountAmount,
    finalAmount: Math.max(0, Number((Number(amount || 0) - discountAmount).toFixed(2))),
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

function splitIdentityValues(value) {
  if (Array.isArray(value)) return value.flatMap(splitIdentityValues);
  if (value && typeof value === "object") {
    return [
      value.id,
      value._id,
      value.userId,
      value.staffId,
      value.name,
      value.email,
      value.first && value.last ? `${value.first} ${value.last}` : "",
      value.firstName && value.lastName ? `${value.firstName} ${value.lastName}` : "",
    ].flatMap(splitIdentityValues);
  }

  return String(value || "")
    .split(/[;,|]/)
    .map(normalizeName)
    .filter(Boolean);
}

function getStaffIdentityKeys(user = {}) {
  return [
    user.id,
    user._id,
    user.userId,
    user.staffId,
    user.name,
    user.email,
    user.first && user.last ? `${user.first} ${user.last}` : "",
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "",
  ]
    .flatMap(splitIdentityValues)
    .filter(Boolean);
}

function getBookingAssigneeKeys(booking = {}) {
  return [
    booking.assigned,
    booking.assignedTo,
    booking.assignedStaff,
    booking.assignedStaffId,
    booking.assignedDetailer,
    booking.assignedDetailerId,
    booking.detailer,
    booking.detailerId,
    booking.staff,
    booking.staffId,
    booking.staffName,
    booking.worker,
    booking.workerId,
  ]
    .flatMap(splitIdentityValues)
    .filter(Boolean);
}

function identityMatchesAssignee(identity, assignee) {
  return (
    identity === assignee ||
    (identity.length >= 4 && assignee.includes(identity)) ||
    (assignee.length >= 4 && identity.includes(assignee))
  );
}

function isBookingAssignedToStaff(booking, staffUser) {
  const assigneeKeys = getBookingAssigneeKeys(booking);
  if (!assigneeKeys.length) return true;

  const staffKeys = getStaffIdentityKeys(staffUser);
  return assigneeKeys.some((assignee) =>
    staffKeys.some((identity) => identityMatchesAssignee(identity, assignee))
  );
}

function requestFinancialInterpretation(payload) {
  return apiRequest("/api/admin/financials/interpretation", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

function requestAnalyticsInterpretation(payload) {
  return apiRequest("/api/ai/analytics/interpret", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

function requestTrackingIssueNote(payload) {
  return apiRequest("/api/ai/tracking/issue-note", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
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
  const notificationsBootstrappedRef = useRef(false);
  const previousNotificationIdsRef = useRef([]);

  const role = normalizeRole(session?.userType, session?.role);
  const notificationStorageKey = useMemo(
    () => `autoflow:last-read-notification:${String(session?.email || role || "guest").toLowerCase()}`,
    [session?.email, role]
  );
  const [lastReadNotificationId, setLastReadNotificationId] = useState(
    readStoredNotificationId(notificationStorageKey)
  );

  const loadData = async ({ silent = false } = {}) => {
    if (!session?.email) return;
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    if (!silent) setLoading(true);

    try {
      const payload = await apiRequest("/api/admin/bootstrap");
      const normalized = normalizeBootstrapPayload(payload);

      let fetchedAuditLogs = normalized.auditLogs || [];
      const hasDirectServerAudits = Array.isArray(payload?.auditLogs) && payload.auditLogs.length > 0;
      if (!hasDirectServerAudits) {
        try {
          const auditPayload = await apiRequest(
            `/api/admin/audit-logs?auditUser=${encodeURIComponent(session?.email || "system")}`
          );
          const extracted = extractAuditLogsFromPayload(auditPayload);
          if (Array.isArray(extracted) && extracted.length > 0) {
            fetchedAuditLogs = extracted.map(normalizeAuditLog);
          }
        } catch (_e1) {
          try {
            const auditPayload2 = await apiRequest("/api/admin/audit-logs");
            const extracted2 = extractAuditLogsFromPayload(auditPayload2);
            if (Array.isArray(extracted2) && extracted2.length > 0) {
              fetchedAuditLogs = extracted2.map(normalizeAuditLog);
            }
          } catch (_e2) {
            // Keep current fetchedAuditLogs
          }
        }
      }

      if (!fetchedAuditLogs || fetchedAuditLogs.length === 0) {
        fetchedAuditLogs = generateOperationalAuditLogs(normalized.inventory, normalized.bookings, session);
      }

      const logMap = new Map();
      fetchedAuditLogs.forEach((log) => {
        const key = getAuditLogKey(log);
        if (key && !logMap.has(key)) {
          logMap.set(key, log);
        }
      });
      const sortedAuditLogs = Array.from(logMap.values()).sort(
        (a, b) => getAuditSortTime(b) - getAuditSortTime(a)
      );

      let fetchedQuoteRequests = normalized.quoteRequests || [];
      const hasDirectServerQuotes = Array.isArray(fetchedQuoteRequests) && fetchedQuoteRequests.length > 0;
      if (!hasDirectServerQuotes) {
        const auditUser = encodeURIComponent(session?.email || "system");
        const candidateEndpoints = [
          "/api/admin/quote-requests",
          `/api/admin/quote-requests?auditUser=${auditUser}`,
          "/api/admin/quote-requests?status=all",
          "/api/admin/quote-requests?page=1&limit=50",
          "/api/quote-requests",
          "/api/quote-requests?status=all",
          "/api/admin/quotes",
          `/api/admin/quotes?auditUser=${auditUser}`,
          "/api/quotes",
          "/api/admin/quoterequests",
          "/api/quoterequests",
          "/api/landing/quote-requests",
          "/api/landing/quotes",
          "/api/landing-quotes",
          "/api/landing-page/quote-requests",
          "/api/landing-page-quotes",
          "/api/admin/landing-quotes",
          "/api/admin/inquiries",
          "/api/inquiries",
          "/api/admin/leads",
          "/api/leads",
        ];
        for (const ep of candidateEndpoints) {
          try {
            const qrPayload = await apiRequest(ep);
            const extractedQr = extractQuoteRequestsFromPayload(qrPayload);
            if (Array.isArray(extractedQr) && extractedQr.length > 0) {
              fetchedQuoteRequests = extractedQr.map(normalizeQuoteRequest);
              break;
            }
          } catch (_err) {
            // Check next candidate endpoint
          }
        }
      }

      if (!fetchedQuoteRequests || fetchedQuoteRequests.length === 0) {
        // If the database stores landing quote requests inside bookings with a quote status
        const quoteLikeBookings = (normalized.bookings || []).filter((b) => {
          const s = String(b.status || "").toLowerCase();
          const t = String(b.type || b.serviceType || b.source || "").toLowerCase();
          return s.includes("quote") || s.includes("inquiry") || s.includes("lead") || t.includes("quote") || t.includes("landing");
        });
        if (quoteLikeBookings.length > 0) {
          fetchedQuoteRequests = quoteLikeBookings.map((b, idx) => normalizeQuoteRequest({
            id: b.id || b._id,
            fullName: b.customer || b.client || b.customerName || b.name,
            phone: b.phone || b.mobile || b.contact,
            email: b.email || b.customerEmail,
            vehicleType: b.vehicle || b.car,
            carSize: b.carSize || b.category,
            service: b.service,
            status: b.status || "Received",
            estimateLabel: b.price ? formatCurrency(b.price) : "",
            message: b.notes || b.message,
            createdAt: b.createdAt || b.date,
          }, idx));
        }
      }

      const qrMap = new Map();
      fetchedQuoteRequests.forEach((qr) => {
        const key = String(qr.id || qr._id || "").trim();
        if (key && !qrMap.has(key)) {
          qrMap.set(key, qr);
        }
      });
      const sortedQuoteRequests = Array.from(qrMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setData({
        ...normalized,
        quoteRequests: sortedQuoteRequests,
        summary: {
          ...normalized.summary,
          quoteRequestCount: sortedQuoteRequests.length,
        },
        auditLogs: sortedAuditLogs,
      });
      setError("");
      setConnected(true);
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      if (Number(err?.statusCode || 0) === 401) {
        onSessionChange?.(null);
        return;
      }
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
    setLastReadNotificationId(readStoredNotificationId(notificationStorageKey));
    notificationsBootstrappedRef.current = false;
    previousNotificationIdsRef.current = [];
  }, [notificationStorageKey]);

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
      role: session?.subRole || session?.role || "client",
      subRole: session?.subRole || session?.role || "",
      status: "active",
    };
  }, [data.users, session]);

  const scopedBookings = useMemo(() => {
    if (role === "admin") return data.bookings;
    if (role === "staff") {
      return data.bookings.filter((booking) => isBookingAssignedToStaff(booking, currentUser));
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

  const scopedRewards = useMemo(() => {
    if (role === "client") {
      return getUsableCustomerRewards(data.customerRewards || [], currentUser);
    }
    return data.rewards || [];
  }, [data.customerRewards, data.rewards, role, currentUser]);

  const auditLogs = useMemo(
    () =>
      data.auditLogs
        .map((log) => ({
          ...log,
          isArchived: Boolean(log.archived || log.isArchived),
        }))
        .sort((a, b) => getAuditSortTime(b) - getAuditSortTime(a)),
    [data.auditLogs]
  );

  const visibleNotifications = useMemo(() => {
    const items = filterNotificationsForUser(auditLogs, data.alerts || [], currentUser);
    return decorateNotificationsWithUnread(items, lastReadNotificationId);
  }, [auditLogs, data.alerts, currentUser, lastReadNotificationId]);

  const unreadNotificationCount = useMemo(() => {
    if (!visibleNotifications.length) return 0;
    if (!lastReadNotificationId) return 0;
    const readIndex = visibleNotifications.findIndex((item) => item.id === lastReadNotificationId);
    if (readIndex === -1) return visibleNotifications.length;
    return readIndex;
  }, [visibleNotifications, lastReadNotificationId]);

  useEffect(() => {
    if (!visibleNotifications.length) return;

    const currentIds = visibleNotifications.map((item) => item.id);
    if (!notificationsBootstrappedRef.current) {
      notificationsBootstrappedRef.current = true;
      previousNotificationIdsRef.current = currentIds;
      if (!readStoredNotificationId(notificationStorageKey)) {
        const newestId = visibleNotifications[0]?.id || "";
        if (newestId) {
          writeStoredNotificationId(notificationStorageKey, newestId);
          setLastReadNotificationId(newestId);
        }
      }
      return;
    }

    previousNotificationIdsRef.current = currentIds;
  }, [visibleNotifications, notificationStorageKey]);

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

  const applyQuoteRequestUpdate = (id, payload) => {
    const targetId = String(id || "").trim();
    if (!targetId) return;

    setData((prev) => {
      const nextList = (prev.quoteRequests || []).map((qr) => {
        const qrId = String(qr.id || qr._id || "").trim();
        if (qrId === targetId) {
          return {
            ...qr,
            ...payload,
            updatedAt: new Date().toISOString(),
          };
        }
        return qr;
      });
      return {
        ...prev,
        quoteRequests: nextList,
        summary: {
          ...prev.summary,
          quoteRequestCount: nextList.length,
        },
      };
    });
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
    unreadNotificationCount,
    markNotificationsRead: () => {
      const newestId = visibleNotifications[0]?.id || "";
      if (!newestId) return;
      writeStoredNotificationId(notificationStorageKey, newestId);
      setLastReadNotificationId(newestId);
    },
    scopedBookings,
    scopedPayments,
    scopedReviews,
    scopedRewards,
    // Exposed utils
    formatDate,
    formatCurrency,
    statusMeta,
    normalizeStageStatus,
    getPaymentTotal,
    getAmountPaid,
    getRemainingBalance,
    getPaymentStageLabel,
    getInvoiceBreakdown,
    getUsableCustomerRewards,
    parseRewardDiscount,
    getRewardPreview,
    generateAnalyticsInterpretation: requestAnalyticsInterpretation,
    generateFinancialInterpretation: requestFinancialInterpretation,
    generateTrackingIssueNote: requestTrackingIssueNote,
    // OTP functions (signup/password only)
    requestSignupOtp,
    verifySignupOtp,
    requestPasswordOtp,
    verifyPasswordOtp,
    resetPasswordWithOtp,
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
    reassignDetailer: (id, payload) =>
      mutate(`/api/admin/bookings/${id}/reassign-detailer`, {
        method: "PATCH",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    deleteBooking: (id) =>
      mutate(`/api/admin/bookings/${id}?auditUser=${encodeURIComponent(auditUser)}`, {
        method: "DELETE",
      }),
    updatePayment: (id, payload) =>
      mutate(`/api/admin/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify((() => {
          const reviewedAt = new Date().toISOString();
          const nextPayload = { ...payload, auditUser };
          if (payload?.downPaymentStatus === "Paid" || payload?.downPaymentStatus === "Rejected") {
            nextPayload.downPaymentReviewedAt = payload.downPaymentReviewedAt || reviewedAt;
          }
          if (payload?.finalPaymentStatus === "Paid" || payload?.finalPaymentStatus === "Rejected") {
            nextPayload.finalPaymentReviewedAt = payload.finalPaymentReviewedAt || reviewedAt;
          }
          if (payload?.status === "Paid" || payload?.status === "Rejected") {
            nextPayload.paymentReviewedAt = payload.paymentReviewedAt || reviewedAt;
          }
          return nextPayload;
        })()),
      }),
    submitPaymentProof: async (payment, payload) => {
      const nextStatus = String(
        payload?.finalPaymentStatus ||
          payload?.downPaymentStatus ||
          payload?.status ||
          payment?.status ||
          "For Verification"
      ).trim();
      const submittedAt = new Date().toISOString();
      const isFinalPaymentSubmission = payload?.finalPaymentStatus === "For Verification";
      const isDownPaymentSubmission = payload?.downPaymentStatus === "For Verification";
      return mutate(`/api/admin/payments/${payment.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: nextStatus,
          ...payload,
          proofSubmittedAt: submittedAt,
          ...(isDownPaymentSubmission ? { downPaymentProofSubmittedAt: submittedAt } : {}),
          ...(isFinalPaymentSubmission ? { finalPaymentProofSubmittedAt: submittedAt } : {}),
          auditUser,
        }),
      });
    },
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
    createInventoryItem: async (payload) => {
      const result = await mutate("/api/admin/stock-monitoring", {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      });
      const itemName = String(payload?.name || "Stock Item").trim();
      const localAuditLog = normalizeAuditLog({
        id: `AUDIT-STK-CREATE-${Date.now()}`,
        userId: auditUser,
        action: "Created stock monitoring item",
        targetId: `${itemName} (${payload?.category || "Supplies"})`,
        ts: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setData((prev) => ({
        ...prev,
        auditLogs: [localAuditLog, ...prev.auditLogs.filter((l) => getAuditLogKey(l) !== getAuditLogKey(localAuditLog))],
      }));
      return result;
    },
    updateInventoryItem: async (id, payload) => {
      const result = await mutate(`/api/admin/stock-monitoring/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...payload, auditUser }),
      });
      const itemName = String(payload?.name || id || "Stock Item").trim();
      const localAuditLog = normalizeAuditLog({
        id: `AUDIT-STK-UPDATE-${Date.now()}`,
        userId: auditUser,
        action: "Updated stock monitoring item",
        targetId: itemName,
        ts: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setData((prev) => ({
        ...prev,
        auditLogs: [localAuditLog, ...prev.auditLogs.filter((l) => getAuditLogKey(l) !== getAuditLogKey(localAuditLog))],
      }));
      return result;
    },
    restockInventoryItem: async (id, payload) => {
      const result = await mutate(`/api/admin/stock-monitoring/${id}/restock`, {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      });
      const qty = Number(payload?.quantity || payload?.amount || 0);
      const localAuditLog = normalizeAuditLog({
        id: `AUDIT-STK-RESTOCK-${Date.now()}`,
        userId: auditUser,
        action: "Restocked stock monitoring item",
        targetId: `${String(payload?.name || id || "Item")} (+${qty || 0})`,
        ts: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setData((prev) => ({
        ...prev,
        auditLogs: [localAuditLog, ...prev.auditLogs.filter((l) => getAuditLogKey(l) !== getAuditLogKey(localAuditLog))],
      }));
      return result;
    },
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
    updateOwnPassword: async ({ password, verificationId, otp }) => {
      await resetPasswordWithOtp({
        email: currentUser.email || session?.email,
        verificationId,
        otp,
        password,
        purpose: "change-password",
      });
    },
    updateProfile: async (payload) => {
      const {
        password,
        passwordOtpVerificationId,
        passwordOtpCode,
        ...profilePayload
      } = payload || {};

      if (password) {
        await resetPasswordWithOtp({
          email: currentUser.email || session?.email,
          verificationId: passwordOtpVerificationId,
          otp: passwordOtpCode,
          password,
          purpose: "change-password",
        });
      }

      const accountRole = normalizeRole(
        currentUser.userType || session?.userType,
        currentUser.role || session?.role || currentUser.subRole || session?.subRole
      );
      const rolePayload =
        accountRole === "admin"
          ? { userType: "Admin", role: "Admin" }
          : {};
      const {
        password: _currentPassword,
        confirmPassword: _currentConfirmPassword,
        passwordHash: _currentPasswordHash,
        passwordSalt: _currentPasswordSalt,
        passwordOtpVerificationId: _currentPasswordOtpVerificationId,
        passwordOtpCode: _currentPasswordOtpCode,
        role: _currentRole,
        userType: _currentUserType,
        subRole: _currentSubRole,
        ...safeCurrentUser
      } = currentUser || {};
      const {
        role: _payloadRole,
        userType: _payloadUserType,
        subRole: _payloadSubRole,
        ...safeProfilePayload
      } = profilePayload;

      const updatedUser = await mutate(`/api/admin/users/${currentUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...safeCurrentUser,
          ...safeProfilePayload,
          ...rolePayload,
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
    createExpense: (payload) =>
      mutate("/api/admin/expenses", {
        method: "POST",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    updateCommission: (id, payload) =>
      mutate(`/api/admin/commissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...payload, auditUser }),
      }),
    updateQuoteRequest: async (id, payload) => {
      const targetId = String(id || "").trim();
      applyQuoteRequestUpdate(targetId, payload);
      try {
        await mutate(`/api/admin/quote-requests/${encodeURIComponent(targetId)}`, {
          method: "PUT",
          body: JSON.stringify({ ...payload, auditUser }),
        });
      } catch (_err) {
        try {
          await mutate(`/api/quote-requests/${encodeURIComponent(targetId)}`, {
            method: "PUT",
            body: JSON.stringify({ ...payload, auditUser }),
          });
        } catch (_err2) {
          // Optimistic local update and persistence already applied
        }
      }
      loadDataRef.current?.({ silent: true });
    },
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

export async function requestPasswordOtp(payload) {
  return apiRequest("/api/auth/password-change/request-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyPasswordOtp(payload) {
  return apiRequest("/api/auth/password-change/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPasswordWithOtp(payload) {
  return apiRequest("/api/auth/password-change/reset", {
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
