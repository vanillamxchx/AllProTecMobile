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

export default function StaffMain({ session, onLogout }) {
  const [screen, setScreen] = useState("dashboard");

  const goTo = (key) => setScreen(String(key || "").trim().toLowerCase());

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        role="staff"
        name={session?.name || "S"}
        onProfile={() => goTo("profile")}
        onLogout={onLogout}
      />

      <View style={styles.stage}>
        <View style={styles.content}>
          {screen === "dashboard" ? <StaffDashboard session={session} goTo={goTo} /> : null}
          {screen === "bookings" ? <StaffBookings /> : null}
          {screen === "tracking" ? <StaffTracking session={session} /> : null}
          {screen === "payments" ? <StaffPayments session={session} /> : null}
          {screen === "more" ? <StaffMore goTo={goTo} /> : null}
          {screen === "services" && <StaffServices />}
          {screen === "inventory" && <StaffInventory />}
          {screen === "engagement" && <StaffEngagement />}
          {screen === "profile" && <StaffProfile session={session} />}
        </View>

        <StaffBottomNav active={screen} onTab={goTo} />
      </View>
    </SafeAreaView>
  );
}
