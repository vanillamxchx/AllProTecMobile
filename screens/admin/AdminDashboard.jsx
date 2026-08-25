import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import styles from "../../styles/css/admin/adminDashboardStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";

const pad2 = (n) => String(n).padStart(2, "0");
const toKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const sameDay = (a, b) => toKey(a) === toKey(b);

function addMonths(date, delta) {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  const last = endOfMonth(d).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

function monthLabel(date) {
  const m = date.toLocaleString("en-US", { month: "long" });
  return `${m} ${date.getFullYear()}`;
}

function buildCalendarGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const firstDow = first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - firstDow);

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({
      date: d,
      inMonth: d.getMonth() === monthDate.getMonth(),
    });
  }
  return cells;
}

function getAlertRoute(title, description) {
  const normalizedTitle = String(title || "").trim().toLowerCase();
  const normalizedDescription = String(description || "").trim().toLowerCase();
  const haystack = `${normalizedTitle} ${normalizedDescription}`;

  if (
    haystack.includes("low stock") ||
    haystack.includes("stock monitoring") ||
    haystack.includes("restock") ||
    haystack.includes("inventory")
  ) {
    return "inventory";
  }

  if (
    haystack.includes("progress") ||
    haystack.includes("job") ||
    haystack.includes("tracking") ||
    haystack.includes("service tracking") ||
    haystack.includes("completion")
  ) {
    return "tracking";
  }

  return "";
}

export default function AdminDashboard({ onNavigate }) {
  const { bookings, inventory, alerts, summary } = useMobileData();

  const today = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => new Date(today));

  const { width } = useWindowDimensions();
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const stageW = useMemo(() => clamp(width, 320, 520), [width]);

  const bookingsByDate = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const key = String(booking.date || "");
      const arr = map.get(key) || [];
      arr.push(booking);
      map.set(key, arr);
    });
    return map;
  }, [bookings]);

  const calendarCells = useMemo(() => buildCalendarGrid(monthDate), [monthDate]);
  const selectedKey = useMemo(() => toKey(selectedDate), [selectedDate]);
  const selectedBookings = useMemo(() => bookingsByDate.get(selectedKey) || [], [bookingsByDate, selectedKey]);
  const todayKey = useMemo(() => toKey(today), [today]);

  const bookingsToday = Number(summary.bookingsToday || (bookingsByDate.get(todayKey) || []).length);
  const inProgressCount = Number(
    summary.inProgressCount ||
      bookings.filter((booking) => String(booking.status || "").toLowerCase().includes("progress")).length
  );
  const lowStockCount = Number(
    summary.lowStockCount ||
      inventory.filter((item) => item.maxStock && item.currentStock / item.maxStock <= 0.25).length
  );
  const paidRevenue = Number(summary.paidRevenue || 0);
  const attentionAlerts = useMemo(() => {
    const nextAlerts = alerts.map((item) => {
      const title = String(item.title || "").trim();
      const description = item.description || item.sub || "";

      return {
        key: `${title}-${description}`,
        title,
        description,
        route: getAlertRoute(title, description),
      };
    });

    const hasProgressAlert = nextAlerts.some((item) =>
      String(item.title || "").toLowerCase().includes("progress")
    );

    if (inProgressCount && !hasProgressAlert) {
      nextAlerts.push({
        key: `jobs-in-progress-${inProgressCount}`,
        title: `Jobs in progress (${inProgressCount})`,
        description: "Monitor service completion times.",
        route: "tracking",
      });
    }

    return nextAlerts;
  }, [alerts, inProgressCount]);

  const goPrevMonth = () => setMonthDate((d) => startOfMonth(addMonths(d, -1)));
  const goNextMonth = () => setMonthDate((d) => startOfMonth(addMonths(d, 1)));
  const goToday = () => {
    setMonthDate(startOfMonth(new Date()));
    setSelectedDate(new Date());
  };

  const onPickDay = (d) => {
    setSelectedDate(new Date(d));
    if (d.getMonth() !== monthDate.getMonth() || d.getFullYear() !== monthDate.getFullYear()) {
      setMonthDate(startOfMonth(d));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.stage, { width: stageW }]}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.headBlock}>
            <Text style={styles.h1}>Dashboard</Text>
            <Text style={styles.h2}>Overview and quick stats.</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{bookingsToday}</Text>
              <Text style={styles.statLabel}>Bookings today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{inProgressCount}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{lowStockCount}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>PHP {paidRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Paid Revenues</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attention Needed</Text>
            <Text style={styles.sectionSub}>Quick alerts that need review.</Text>

            <View style={styles.stack}>
              {attentionAlerts.length === 0 ? (
                <View style={styles.alertCard}>
                  <Text style={styles.alertTitle}>No alerts</Text>
                  <Text style={styles.alertSub}>Everything looks good.</Text>
                </View>
              ) : (
                attentionAlerts.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={item.route ? 0.85 : 1}
                    onPress={() => item.route && onNavigate?.(item.route)}
                    style={styles.alertCard}
                  >
                    <Text style={styles.alertTitle}>{item.title}</Text>
                    <Text style={styles.alertSub}>{item.description}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calendar Summary</Text>
            <Text style={styles.sectionSub}>Monthly view of bookings and daily totals.</Text>

            <View style={styles.card}>
              <View style={styles.calTop}>
                <View>
                  <Text style={styles.cardTitle}>Bookings Calendar</Text>
                  <Text style={styles.cardSub}>{monthLabel(monthDate)} - tap a day to view</Text>
                </View>

                <View style={styles.calControls}>
                  <TouchableOpacity activeOpacity={0.85} style={styles.ctrlBtn} onPress={goPrevMonth}>
                    <Text style={styles.ctrlTxt}>{"<"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.85} style={styles.todayBtn} onPress={goToday}>
                    <Text style={styles.todayTxt}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.85} style={styles.ctrlBtn} onPress={goNextMonth}>
                    <Text style={styles.ctrlTxt}>{">"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dowRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"].map((d) => (
                  <Text key={d} style={styles.dow}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.calGrid}>
                {calendarCells.map(({ date, inMonth }) => {
                  const key = toKey(date);
                  const count = (bookingsByDate.get(key) || []).length;
                  const isSelected = sameDay(date, selectedDate);
                  const isToday = sameDay(date, today);

                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.85}
                      onPress={() => onPickDay(date)}
                      style={[
                        styles.dayCell,
                        !inMonth && styles.dayCellOut,
                        isSelected && styles.dayCellSelected,
                        isToday && styles.dayCellToday,
                      ]}
                    >
                      <Text style={[styles.dayNum, !inMonth && styles.dayNumOut]}>{date.getDate()}</Text>

                      {count > 0 ? (
                        <View style={styles.dayBadge}>
                          <Text style={styles.dayBadgeTxt}>{count}</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <Text style={styles.cardTitle}>Bookings Overview</Text>
              <Text style={styles.cardSub}>
                Selected: {selectedKey} - {selectedBookings.length} booking(s)
              </Text>

              <View style={styles.stack}>
                {selectedBookings.length === 0 ? (
                  <View style={styles.bookingCard}>
                    <Text style={styles.bookingTitle}>No bookings</Text>
                    <Text style={styles.bookingSub}>No records for this day.</Text>
                  </View>
                ) : (
                  selectedBookings.map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                      <Text style={styles.bookingTitle}>
                        {booking.customer} - {booking.service}
                      </Text>
                      <Text style={styles.bookingSub}>
                        {booking.vehicle || "Vehicle not set"} - Status: {booking.status}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
