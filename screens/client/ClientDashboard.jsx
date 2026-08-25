import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import styles from "../../styles/css/client/clientDashboardStyles";
import { useMobileData } from "../../context/MobileDataContext.jsx";

function formatBookingTitle(booking) {
  return `${booking.service || "Service"} - ${booking.vehicle || booking.plate || "Vehicle"}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr || "");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ClientDashboard({ goTo }) {
  const { scopedBookings, getClientStats } = useMobileData();
  const stats = getClientStats();

  const upcomingBookings = useMemo(
    () =>
      scopedBookings
        .filter((booking) => String(booking.status || "").toLowerCase() !== "completed")
        .slice(0, 4)
        .map((booking) => ({
          id: booking.id,
          title: formatBookingTitle(booking),
          date: formatDate(booking.date),
        })),
    [scopedBookings]
  );

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <Text style={styles.h1}>Dashboard</Text>
        <Text style={styles.sub}>Overview and quick stats.</Text>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.bigCard} onPress={() => goTo?.("bookings")}>
        <Text style={styles.bigNum}>{stats.today}</Text>
        <Text style={styles.bigLabel}>Bookings today</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity activeOpacity={0.85} style={styles.smallCard} onPress={() => goTo?.("bookings")}>
          <Text style={styles.smallNum}>{stats.upcoming}</Text>
          <Text style={styles.smallLabel}>Upcoming</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} style={styles.smallCard} onPress={() => goTo?.("tracking")}>
          <Text style={styles.smallNum}>{stats.completed}</Text>
          <Text style={styles.smallLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Upcoming bookings</Text>
        <Text style={styles.sectionSub}>Here are your next appointments</Text>

        <View style={styles.list}>
          {upcomingBookings.length ? (
            upcomingBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                activeOpacity={0.85}
                style={styles.listItem}
                onPress={() => goTo?.("bookings")}
              >
                <Text style={styles.itemTitle}>{booking.title}</Text>
                <Text style={styles.itemSub}>{booking.date}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>No upcoming bookings</Text>
              <Text style={styles.itemSub}>Create a booking to see it here.</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Text style={styles.sectionSub}>Common tasks you do often.</Text>

        <View style={styles.row}>
          <TouchableOpacity activeOpacity={0.85} style={styles.actionCard} onPress={() => goTo?.("bookings")}>
            <Text style={styles.actionTitle}>Create Booking</Text>
            <Text style={styles.actionSub}>Add a new appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} style={styles.actionCard} onPress={() => goTo?.("payments")}>
            <Text style={styles.actionTitle}>View Payments</Text>
            <Text style={styles.actionSub}>Check your billing records</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 18 }} />
    </ScrollView>
  );
}
