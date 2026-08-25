import React, { useState } from "react";
import { SafeAreaView, View } from "react-native";

import AppHeader from "../../components/AppHeader.jsx";
import AdminBottomNav from "../../components/admin/AdminBottomNav.jsx";
import styles from "../../styles/css/admin/adminMainStyles.js";

import AdminDashboard from "./AdminDashboard.jsx";
import AdminBookings from "./AdminBookings.jsx";
import AdminTracking from "./AdminTracking.jsx";
import AdminMore from "./AdminMore.jsx";

import AdminServices from "./AdminServices.jsx";
import AdminInventory from "./AdminInventory.jsx";
import AdminPayments from "./AdminPayments.jsx";
import AdminAnalytics from "./AdminAnalytics.jsx";
import AdminFinancialTracker from "./AdminFinancialTracker.jsx";
import AdminEngagement from "./AdminEngagement.jsx";
import AdminUsersOverview from "./AdminUsersOverview.jsx";
import AdminAuditLogs from "./AdminAuditLogs.jsx";
import AdminProfile from "./AdminProfile.jsx";

import BookingModal from "../modals/BookingModal.jsx";

export default function AdminMain({ session, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [module, setModule] = useState(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSelected, setBookingSelected] = useState(null);

  const openModule = (key) => setModule(key);
  const closeModule = () => setModule(null);
  const navigateFromDashboard = (key) => {
    const route = String(key || "").trim().toLowerCase();
    if (!route) return;

    if (["dashboard", "bookings", "tracking", "more"].includes(route)) {
      setActiveTab(route);
      setModule(null);
      return;
    }

    setModule(route);
  };

  const openBookingModal = (booking) => {
    console.log("AdminMain openBookingModal:", booking);
    setBookingSelected(booking);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setBookingSelected(null);
  };

  const renderContent = () => {
    if (module === "services") return <AdminServices onBack={closeModule} />;
    if (module === "inventory") return <AdminInventory onBack={closeModule} />;
    if (module === "payments") return <AdminPayments onBack={closeModule} />;
    if (module === "analytics") return <AdminAnalytics onBack={closeModule} />;
    if (module === "financial") return <AdminFinancialTracker onBack={closeModule} />;
    if (module === "engagement") return <AdminEngagement onBack={closeModule} />;
    if (module === "users") return <AdminUsersOverview onBack={closeModule} />;
    if (module === "audit") return <AdminAuditLogs onBack={closeModule} />;

    // ✅ FIX: pass session to AdminProfile
    if (module === "profile")
      return <AdminProfile session={session} onBack={closeModule} />;

    if (activeTab === "bookings") return <AdminBookings onOpenDetails={openBookingModal} />;
    if (activeTab === "tracking") return <AdminTracking />;
    if (activeTab === "more") return <AdminMore onOpenModule={openModule} />;

    return <AdminDashboard session={session} onNavigate={navigateFromDashboard} />;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.stage}>
        <AppHeader
          role="admin"
          name={session?.name || "A"}
          onBell={() => console.log("ADMIN: bell")}
          onProfile={() => openModule("profile")}
          onLogout={onLogout}
        />

        <View style={styles.content}>{renderContent()}</View>

        <AdminBottomNav
          active={module ? null : activeTab}
          onTab={(key) => {
            setActiveTab(key);
            setModule(null);
          }}
        />

        <BookingModal
          visible={bookingModalOpen}
          booking={bookingSelected}
          onClose={closeBookingModal}
        />
      </View>
    </SafeAreaView>
  );
}
