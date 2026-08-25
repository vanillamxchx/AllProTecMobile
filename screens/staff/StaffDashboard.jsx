import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import styles from "../../styles/css/staff/staffDashboardStyles";
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
    cells.push({ date: d, inMonth: d.getMonth() === monthDate.getMonth() });
  }
  return cells;
}

export default function StaffDashboard({ goTo }) {
  const { scopedBookings, scopedPayments, inventory, quoteRequests } = useMobileData();
  const today = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => new Date(today));
  const [selectedQuoteRequestId, setSelectedQuoteRequestId] = useState("");

  const { width } = useWindowDimensions();
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const stageW = useMemo(() => clamp(width, 320, 520), [width]);

  const bookingsByDate = useMemo(() => {
    const map = new Map();
    scopedBookings.forEach((booking) => {
      const key = String(booking.date || "");
      const arr = map.get(key) || [];
      arr.push(booking);
      map.set(key, arr);
    });
    return map;
  }, [scopedBookings]);

  const calendarCells = useMemo(() => buildCalendarGrid(monthDate), [monthDate]);
  const selectedKey = useMemo(() => toKey(selectedDate), [selectedDate]);
  const selectedBookings = useMemo(() => bookingsByDate.get(selectedKey) || [], [bookingsByDate, selectedKey]);

  const todayKey = useMemo(() => toKey(today), [today]);
  const bookingsToday = (bookingsByDate.get(todayKey) || []).length;
  const inProgressCount = scopedBookings.filter((booking) =>
    String(booking.status || "").toLowerCase().includes("progress")
  ).length;
  const paidRevenue = scopedPayments
    .filter((payment) => String(payment.status || "").toLowerCase() === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const lowStockCount = inventory.filter(
    (item) => item.maxStock && item.currentStock / item.maxStock <= 0.25
  ).length;
  const quoteRequestCount = quoteRequests.length;
  const recentQuoteRequests = useMemo(() => quoteRequests.slice(0, 6), [quoteRequests]);
  const selectedQuoteRequest = useMemo(
    () => recentQuoteRequests.find((item) => String(item.id || item._id || "") === String(selectedQuoteRequestId || "")) || null,
    [recentQuoteRequests, selectedQuoteRequestId]
  );
  const quoteStatusLabel = (status) =>
    String(status || "").trim().toLowerCase() === "received" ? "Received" : "Under Review";

  const alerts = [];
  if (lowStockCount) {
    alerts.push({
      title: `Low stock (${lowStockCount})`,
      sub: "Stock monitoring needs attention.",
      route: "inventory",
    });
  }
  if (inProgressCount) {
    alerts.push({
      title: `Jobs in progress (${inProgressCount})`,
      sub: "Monitor service completion times.",
      route: "tracking",
    });
  }

  const statCards = [
    { key: "bookings-today", value: bookingsToday, label: "Bookings today", route: "bookings" },
    { key: "in-progress", value: inProgressCount, label: "In Progress", route: "tracking" },
    { key: "low-stock", value: lowStockCount, label: "Low Stock", route: "inventory" },
    { key: "paid-revenues", value: `PHP ${paidRevenue.toLocaleString()}`, label: "Paid Revenues", route: "payments" },
    { key: "quote-requests", value: quoteRequestCount, label: "Quote Requests" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.stage, { width: stageW }]}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.headBlock}>
            <Text style={styles.h1}>Dashboard</Text>
            <Text style={styles.h2}>Overview and quick stats.</Text>
          </View>

          <View style={styles.statsGrid}>
            {statCards.map((card) => (
              <TouchableOpacity
                key={card.key}
                activeOpacity={0.85}
                style={styles.statCard}
                onPress={() => {
                  if (card.route) {
                    goTo?.(card.route);
                    return;
                  }
                  if (recentQuoteRequests[0]) {
                    setSelectedQuoteRequestId(String(recentQuoteRequests[0].id || recentQuoteRequests[0]._id || ""));
                  }
                }}
              >
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attention Needed</Text>
            <Text style={styles.sectionSub}>Quick alerts that need review.</Text>
            <View style={styles.stack}>
              {alerts.length ? (
                alerts.map((alert) => (
                  <TouchableOpacity
                    key={alert.title}
                    activeOpacity={0.85}
                    onPress={() => goTo?.(alert.route)}
                    style={styles.alertCard}
                  >
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertSub}>{alert.sub}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.alertCard}>
                  <Text style={styles.alertTitle}>No alerts</Text>
                  <Text style={styles.alertSub}>Everything looks good.</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Quote Requests</Text>
            <Text style={styles.sectionSub}>Landing-page quote requests waiting for follow-up.</Text>

            <View style={styles.stack}>
              {recentQuoteRequests.length ? (
                recentQuoteRequests.map((request) => {
                  const requestId = String(request.id || request._id || "");
                  const isSelected = requestId === String(selectedQuoteRequestId || "");
                  return (
                    <TouchableOpacity
                      key={requestId}
                      activeOpacity={0.85}
                      style={[styles.quoteCard, isSelected && styles.quoteCardSelected]}
                      onPress={() => setSelectedQuoteRequestId(requestId)}
                    >
                      <View style={styles.quoteHead}>
                        <Text style={styles.quoteTitle}>
                          {request.fullName || "Unknown"} - {request.service || "Service"}
                        </Text>
                        <View
                          style={[
                            styles.quoteStatusPill,
                            quoteStatusLabel(request.status) === "Received"
                              ? styles.quoteStatusReceived
                              : styles.quoteStatusReview,
                          ]}
                        >
                          <Text style={styles.quoteStatusText}>{quoteStatusLabel(request.status)}</Text>
                        </View>
                      </View>
                      <Text style={styles.quoteMeta}>
                        {request.vehicleType || "Vehicle"} - {request.carSize || "Size"} - {request.phone || "No phone"}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.alertCard}>
                  <Text style={styles.alertTitle}>No quote requests yet</Text>
                  <Text style={styles.alertSub}>New quote requests will appear here.</Text>
                </View>
              )}
            </View>

            {selectedQuoteRequest ? (
              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>Quote Request Details</Text>
                <Text style={styles.cardSub}>Review the selected landing-page quote request.</Text>

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Name</Text>
                    <Text style={styles.detailValue}>{selectedQuoteRequest.fullName || "-"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedQuoteRequest.phone || "-"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Vehicle Type</Text>
                    <Text style={styles.detailValue}>{selectedQuoteRequest.vehicleType || "-"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Car Size</Text>
                    <Text style={styles.detailValue}>{selectedQuoteRequest.carSize || "-"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Service</Text>
                    <Text style={styles.detailValue}>{selectedQuoteRequest.service || "-"}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Estimate</Text>
                    <Text style={styles.detailValue}>
                      {selectedQuoteRequest.estimateLabel || "Custom quote available upon review"}
                    </Text>
                  </View>
                  <View style={styles.detailItemWide}>
                    <Text style={styles.detailLabel}>Message</Text>
                    <Text style={styles.detailValue}>
                      {selectedQuoteRequest.message || "No additional notes provided."}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
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
                  <TouchableOpacity activeOpacity={0.85} style={styles.ctrlBtn} onPress={() => setMonthDate((d) => startOfMonth(addMonths(d, -1)))}>
                    <Text style={styles.ctrlTxt}>{"<"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.85} style={styles.todayBtn} onPress={() => {
                    setMonthDate(startOfMonth(new Date()));
                    setSelectedDate(new Date());
                  }}>
                    <Text style={styles.todayTxt}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.85} style={styles.ctrlBtn} onPress={() => setMonthDate((d) => startOfMonth(addMonths(d, 1)))}>
                    <Text style={styles.ctrlTxt}>{">"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dowRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"].map((d) => (
                  <Text key={d} style={styles.dow}>{d}</Text>
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
                      onPress={() => {
                        setSelectedDate(new Date(date));
                        if (date.getMonth() !== monthDate.getMonth() || date.getFullYear() !== monthDate.getFullYear()) {
                          setMonthDate(startOfMonth(date));
                        }
                      }}
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
                {selectedBookings.length ? (
                  selectedBookings.map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                      <Text style={styles.bookingTitle}>{booking.customer} - {booking.service}</Text>
                      <Text style={styles.bookingSub}>{booking.vehicle || "Vehicle not set"} - Status: {booking.status}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.bookingCard}>
                    <Text style={styles.bookingTitle}>No bookings</Text>
                    <Text style={styles.bookingSub}>No records for this day.</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
