import React, { useState } from "react";
import { SafeAreaView, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import ClientBottomNav from "../../components/client/ClientBottomNav";
import styles from "../../styles/css/client/clientMainStyles";

import ClientDashboard from "./ClientDashboard";
import ClientBookings from "./ClientBookings";
import ClientTracking from "./ClientTracking";
import ClientMore from "./ClientMore";

import ClientServices from "./ClientServices";
import ClientPayments from "./ClientPayments";
import ClientEngagement from "./ClientEngagement";
import ClientProfile from "./ClientProfile";

// ✅ NEW SCREEN
import ClientAddBooking from "./ClientAddBooking";

export default function ClientMain({ session, onLogout }) {
  const [screen, setScreen] = useState("dashboard");

  const goTo = (key) => {
    const route = String(key || "").trim().toLowerCase();
    console.log("CLIENT NAV ->", route);
    setScreen(route);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        role="client"
        name={session?.email || "C"}
        onProfile={() => goTo("profile")}
        onLogout={onLogout}
      />

      <View style={styles.content}>
        {screen === "dashboard" && (
          <ClientDashboard session={session} goTo={goTo} />
        )}

        {/* ✅ UPDATED: pass onAddNew so button navigates */}
        {screen === "bookings" && (
          <ClientBookings
            session={session}
            goTo={goTo}
            onAddNew={() => goTo("addbooking")}
          />
        )}

        {screen === "tracking" && (
          <ClientTracking session={session} goTo={goTo} />
        )}

        {screen === "more" && <ClientMore goTo={goTo} />}

        {/* ✅ MORE ROUTES */}
        {screen === "services" && <ClientServices goTo={goTo} />}
        {screen === "payments" && <ClientPayments goTo={goTo} />}
        {screen === "engagement" && <ClientEngagement goTo={goTo} />}

        {screen === "profile" && (
          <ClientProfile session={session} goTo={goTo} />
        )}

        {/* ✅ NEW ROUTE */}
        {screen === "addbooking" && (
          <ClientAddBooking
            onBack={() => goTo("bookings")}
            onConfirm={(payload) => {
              console.log("BOOKING SUBMIT:", payload);
              goTo("bookings");
            }}
          />
        )}
      </View>

      <ClientBottomNav active={screen} onTab={goTo} />
    </SafeAreaView>
  );
}
