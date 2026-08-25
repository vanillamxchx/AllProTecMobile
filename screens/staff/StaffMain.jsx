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
import NotificationCenterModal from "../../components/common/NotificationCenterModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";

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
          {screen === "my-work" ? <StaffMyWork session={session} /> : null}
          {screen === "bookings" ? <StaffBookings /> : null}
          {screen === "tracking" ? <StaffTracking session={session} /> : null}
          {screen === "payments" ? <StaffPayments session={session} /> : null}
          {screen === "more" ? <StaffMore goTo={goTo} currentUser={currentUser} /> : null}
          {screen === "services" && <StaffServices />}
          {screen === "inventory" && <StaffInventory />}
          {screen === "engagement" && <StaffEngagement />}
          {screen === "detailer-management" && <AdminDetailerManagement />}
          {screen === "profile" && <StaffProfile session={session} />}
        </View>

        <StaffBottomNav active={screen} onTab={goTo} />
      </View>
    </SafeAreaView>
  );
}
