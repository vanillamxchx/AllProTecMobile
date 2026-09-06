import React, { useState } from "react";
import { SafeAreaView, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import StaffBottomNav from "../../components/staff/StaffBottomNav";

import styles from "../../styles/css/staff/staffMainStyles";

import StaffDashboard from "./StaffDashboard";
import StaffBookings from "./StaffBookings";
import StaffTracking from "./StaffTracking";
import StaffPayments from "./StaffPayments";
import StaffMore from "./StaffMore";
import StaffServices from "./StaffServices";
import StaffInventory from "./StaffInventory";
import StaffEngagement from "./StaffEngagement";
import StaffProfile from "./StaffProfile";
import StaffMyWork from "./StaffMyWork.jsx";
import AdminDetailerManagement from "../admin/AdminDetailerManagement.jsx";
import AdminAnalytics from "../admin/AdminAnalytics.jsx";
import AdminFinancialTracker from "../admin/AdminFinancialTracker.jsx";
import AdminAuditLogs from "../admin/AdminAuditLogs.jsx";
import NotificationCenterModal from "../../components/common/NotificationCenterModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { MODULE_KEYS, canAccessModule } from "../../services/rbac";

export default function StaffMain({ session, onLogout }) {
  const { notifications, unreadNotificationCount, markNotificationsRead, loading, currentUser } = useMobileData();
  const [screen, setScreen] = useState("dashboard");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const goTo = (key) => setScreen(String(key || "").trim().toLowerCase());

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        role="staff"
        name={session?.name || "S"}
        onBell={() => setNotificationsOpen(true)}
        unreadCount={unreadNotificationCount}
        onProfile={() => goTo("profile")}
        onLogout={onLogout}
      />

      <NotificationCenterModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        loading={loading}
        onMarkRead={markNotificationsRead}
      />

      <View style={styles.stage}>
        <View style={styles.content}>
          {screen === "dashboard" ? <StaffDashboard session={session} goTo={goTo} /> : null}
          {screen === "my-work" && canAccessModule(currentUser, MODULE_KEYS.myWork) ? (
            <StaffMyWork session={session} />
          ) : null}
          {screen === "bookings" && canAccessModule(currentUser, MODULE_KEYS.bookings) ? (
            <StaffBookings />
          ) : null}
          {screen === "tracking" && canAccessModule(currentUser, MODULE_KEYS.serviceTracking) ? (
            <StaffTracking session={session} />
          ) : null}
          {screen === "payments" && canAccessModule(currentUser, MODULE_KEYS.paymentTracking) ? (
            <StaffPayments session={session} onBack={() => goTo("more")} />
          ) : null}
          {screen === "more" ? <StaffMore goTo={goTo} currentUser={currentUser} /> : null}
          {screen === "services" && canAccessModule(currentUser, MODULE_KEYS.services) ? (
            <StaffServices />
          ) : null}
          {screen === "inventory" && canAccessModule(currentUser, MODULE_KEYS.stockMonitoring) ? (
            <StaffInventory onBack={() => goTo("more")} />
          ) : null}
          {screen === "engagement" && canAccessModule(currentUser, MODULE_KEYS.engagement) ? (
            <StaffEngagement />
          ) : null}
          {screen === "detailer-management" && canAccessModule(currentUser, MODULE_KEYS.detailerManagement) ? (
            <AdminDetailerManagement />
          ) : null}
          {screen === "analytics" && canAccessModule(currentUser, MODULE_KEYS.analytics) ? (
            <AdminAnalytics onBack={() => goTo("more")} />
          ) : null}
          {screen === "financial" && canAccessModule(currentUser, MODULE_KEYS.financialTracker) ? (
            <AdminFinancialTracker onBack={() => goTo("more")} />
          ) : null}
          {screen === "audit" && canAccessModule(currentUser, MODULE_KEYS.auditLogs) ? (
            <AdminAuditLogs onBack={() => goTo("more")} />
          ) : null}
          {screen === "profile" && <StaffProfile session={session} />}
        </View>

        <StaffBottomNav active={screen} onTab={goTo} currentUser={currentUser} />
      </View>
    </SafeAreaView>
  );
}
