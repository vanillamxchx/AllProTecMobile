import { isValidStaffRole, normalizeStaffRole } from "./staffRoles.js";

export const MODULE_KEYS = {
  dashboard: "module.dashboard",
  analytics: "module.analytics",
  auditLogs: "module.auditLogs",
  bookings: "module.bookings",
  services: "module.services",
  serviceTracking: "module.serviceTracking",
  stockMonitoring: "module.stockMonitoring",
  paymentTracking: "module.paymentTracking",
  financialTracker: "module.financialTracker",
  engagement: "module.engagement",
  userManagement: "module.userManagement",
  detailerManagement: "module.detailerManagement",
  myWork: "module.myWork",
  profile: "module.profile",
  settings: "module.settings",
};

export const ACTION_KEYS = {
  bookingView: "booking.view",
  bookingCreate: "booking.create",
  bookingUpdate: "booking.update",
  bookingDelete: "booking.delete",
  bookingReassignDetailer: "booking.reassignDetailer",
  detailerReassign: "detailer.reassign",
  bookingUpdateStatus: "booking.updateStatus",
  trackingView: "tracking.view",
  trackingUpdateIssueNotes: "tracking.updateIssueNotes",
  trackingUpdateWarranty: "tracking.updateWarranty",
  trackingComplete: "tracking.complete",
  paymentView: "payment.view",
  paymentVerify: "payment.verify",
  paymentOverride: "payment.override",
  stockView: "stock.view",
  stockManage: "stock.manage",
  engagementView: "engagement.view",
  engagementManage: "engagement.manage",
  usersViewStaff: "users.viewStaff",
  usersManageStaff: "users.manageStaff",
  usersPromote: "users.promote",
  usersDelete: "users.delete",
  commissionViewOwn: "commission.viewOwn",
  commissionViewAll: "commission.viewAll",
  commissionMarkPaid: "commission.markPaid",
  commissionVoid: "commission.void",
  commissionPrint: "commission.print",
  commissionExport: "commission.export",
  settingsManageSecurity: "settings.manageSecurity",
  settingsManageDownPayment: "settings.manageDownPayment",
  auditViewAll: "audit.viewAll",
  auditViewOperational: "audit.viewOperational",
  auditViewOwn: "audit.viewOwn",
  servicesManage: "services.manage",
};

const STAFF_JOB_ROLE_KEYS = new Set([
  "mechanic",
  "inspector",
  "coordinator",
  "detailer",
  "technician",
  "employee",
  "manager",
  "senior staff",
  "junior staff",
]);

const ROLE_MODULES = {
  admin: Object.values(MODULE_KEYS),
  "general manager": [
    MODULE_KEYS.dashboard,
    MODULE_KEYS.analytics,
    MODULE_KEYS.bookings,
    MODULE_KEYS.services,
    MODULE_KEYS.serviceTracking,
    MODULE_KEYS.stockMonitoring,
    MODULE_KEYS.paymentTracking,
    MODULE_KEYS.financialTracker,
    MODULE_KEYS.engagement,
    MODULE_KEYS.userManagement,
    MODULE_KEYS.profile,
  ],
  "sales manager": [
    MODULE_KEYS.dashboard,
    MODULE_KEYS.analytics,
    MODULE_KEYS.bookings,
    MODULE_KEYS.services,
    MODULE_KEYS.serviceTracking,
    MODULE_KEYS.paymentTracking,
    MODULE_KEYS.engagement,
    MODULE_KEYS.profile,
  ],
  "sales associate": [
    MODULE_KEYS.dashboard,
    MODULE_KEYS.bookings,
    MODULE_KEYS.services,
    MODULE_KEYS.paymentTracking,
    MODULE_KEYS.engagement,
    MODULE_KEYS.profile,
  ],
  "inventory clerk": [
    MODULE_KEYS.dashboard,
    MODULE_KEYS.stockMonitoring,
    MODULE_KEYS.serviceTracking,
    MODULE_KEYS.bookings,
    MODULE_KEYS.auditLogs,
    MODULE_KEYS.profile,
  ],
  "junior detailer": [
    MODULE_KEYS.myWork,
    MODULE_KEYS.bookings,
    MODULE_KEYS.serviceTracking,
    MODULE_KEYS.profile,
  ],
  "senior detailer": [
    MODULE_KEYS.myWork,
    MODULE_KEYS.bookings,
    MODULE_KEYS.serviceTracking,
    MODULE_KEYS.profile,
  ],
  marketing: [
    MODULE_KEYS.dashboard,
    MODULE_KEYS.analytics,
    MODULE_KEYS.services,
    MODULE_KEYS.engagement,
    MODULE_KEYS.profile,
  ],
};

const ROLE_ACTIONS = {
  admin: Object.values(ACTION_KEYS),
  "general manager": [
    ACTION_KEYS.bookingView,
    ACTION_KEYS.bookingCreate,
    ACTION_KEYS.bookingUpdate,
    ACTION_KEYS.bookingUpdateStatus,
    ACTION_KEYS.trackingView,
    ACTION_KEYS.trackingUpdateIssueNotes,
    ACTION_KEYS.trackingUpdateWarranty,
    ACTION_KEYS.trackingComplete,
    ACTION_KEYS.paymentView,
    ACTION_KEYS.paymentVerify,
    ACTION_KEYS.stockView,
    ACTION_KEYS.stockManage,
    ACTION_KEYS.engagementView,
    ACTION_KEYS.engagementManage,
    ACTION_KEYS.usersViewStaff,
    ACTION_KEYS.commissionViewAll,
    ACTION_KEYS.commissionMarkPaid,
    ACTION_KEYS.commissionVoid,
    ACTION_KEYS.commissionPrint,
    ACTION_KEYS.commissionExport,
    ACTION_KEYS.servicesManage,
  ],
  "sales manager": [
    ACTION_KEYS.bookingView,
    ACTION_KEYS.bookingCreate,
    ACTION_KEYS.bookingUpdate,
    ACTION_KEYS.bookingUpdateStatus,
    ACTION_KEYS.trackingView,
    ACTION_KEYS.paymentView,
    ACTION_KEYS.paymentVerify,
    ACTION_KEYS.engagementView,
    ACTION_KEYS.engagementManage,
    ACTION_KEYS.servicesManage,
  ],
  "sales associate": [
    ACTION_KEYS.bookingView,
    ACTION_KEYS.bookingCreate,
    ACTION_KEYS.bookingUpdate,
    ACTION_KEYS.paymentView,
    ACTION_KEYS.engagementView,
  ],
  "inventory clerk": [
    ACTION_KEYS.bookingView,
    ACTION_KEYS.trackingView,
    ACTION_KEYS.stockView,
    ACTION_KEYS.stockManage,
    ACTION_KEYS.auditViewOperational,
  ],
  "junior detailer": [
    ACTION_KEYS.bookingView,
    ACTION_KEYS.trackingView,
    ACTION_KEYS.trackingUpdateIssueNotes,
    ACTION_KEYS.trackingUpdateWarranty,
    ACTION_KEYS.trackingComplete,
    ACTION_KEYS.commissionViewOwn,
    ACTION_KEYS.commissionPrint,
    ACTION_KEYS.commissionExport,
    ACTION_KEYS.auditViewOwn,
  ],
  "senior detailer": [
    ACTION_KEYS.bookingView,
    ACTION_KEYS.trackingView,
    ACTION_KEYS.trackingUpdateIssueNotes,
    ACTION_KEYS.trackingUpdateWarranty,
    ACTION_KEYS.trackingComplete,
    ACTION_KEYS.commissionViewOwn,
    ACTION_KEYS.commissionPrint,
    ACTION_KEYS.commissionExport,
    ACTION_KEYS.auditViewOwn,
  ],
  marketing: [
    ACTION_KEYS.engagementView,
    ACTION_KEYS.engagementManage,
  ],
};

export function normalizeUserType(user) {
  const rawUserType = String(user?.userType || "").trim().toLowerCase();
  if (["admin", "staff"].includes(rawUserType)) return rawUserType;
  if (["customer", "client"].includes(rawUserType)) return "customer";

  const role = normalizeStaffRole(user?.role);
  if (["admin", "owner", "co-owner"].includes(role)) return "admin";
  if (role === "staff" || STAFF_JOB_ROLE_KEYS.has(role) || (isValidStaffRole(role) && role !== "admin")) return "staff";
  return "customer";
}

export function normalizeRole(user) {
  const primaryRole = normalizeStaffRole(user?.role || "");
  if (primaryRole && primaryRole !== "staff" && primaryRole !== "customer" && primaryRole !== "client") {
    return primaryRole;
  }
  const sub = normalizeStaffRole(user?.subRole || user?.jobRole);
  if (sub) {
    return sub;
  }
  return primaryRole;
}

export function isAdmin(user) {
  return normalizeUserType(user) === "admin";
}

export function isStaff(user) {
  return normalizeUserType(user) === "staff";
}

export function getEffectiveRole(user) {
  if (isAdmin(user)) return "admin";
  const role = normalizeRole(user);
  if (role === "admin") return "general manager";
  if (role && ROLE_MODULES[role]) return role;
  return "general manager";
}

export function canAccessModule(user, moduleKey) {
  if (isAdmin(user)) return true;
  if (!isStaff(user)) return moduleKey === MODULE_KEYS.profile;
  return (ROLE_MODULES[getEffectiveRole(user)] || []).includes(moduleKey);
}

export function canPerformAction(user, actionKey) {
  if (isAdmin(user)) return true;
  if (!isStaff(user)) return false;
  return (ROLE_ACTIONS[getEffectiveRole(user)] || []).includes(actionKey);
}

export function getAllowedModules(user) {
  if (isAdmin(user)) return Object.values(MODULE_KEYS);
  if (isStaff(user)) {
    const modules = new Set(ROLE_MODULES[getEffectiveRole(user)] || []);
    return Array.from(modules);
  }
  return [];
}

export function getDefaultModule(user) {
  const modules = getAllowedModules(user);
  if (modules.includes(MODULE_KEYS.dashboard)) return "dashboard";
  if (modules.includes(MODULE_KEYS.myWork)) return "my-work";
  if (modules.includes(MODULE_KEYS.profile)) return "profile";
  return "profile";
}
