import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import styles from "../../styles/css/admin/adminAnalyticsStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";

function PayMini({ title, value }) {
  return (
    <View style={styles.payMini}>
      <Text style={styles.payMiniTitle}>{title}</Text>
      <Text style={styles.payMiniValue}>{value}</Text>
      <Text style={styles.payMiniSub}>Transactions</Text>
    </View>
  );
}

export default function AdminAnalytics() {
  const { payments, bookings, reviews } = useMobileData();

  const totalSales = useMemo(
    () =>
      payments
        .filter((payment) => String(payment.status || "").toLowerCase() === "paid")
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [payments]
  );

  const countByMethod = useMemo(() => {
    const map = { Cash: 0, GCash: 0, Paypal: 0, "Bank Transfer": 0 };
    payments.forEach((payment) => {
      const method = String(payment.method || "").trim();
      if (!method) return;
      const normalized =
        method.toLowerCase() === "gcash"
          ? "GCash"
          : method.toLowerCase() === "bank transfer"
            ? "Bank Transfer"
            : method;
      map[normalized] = (map[normalized] || 0) + 1;
    });
    return map;
  }, [payments]);

  const totalBookings = bookings.length;

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const values = reviews
      .map((review) => Math.max(1, Math.min(5, Number(review.rating || 0))))
      .filter((value) => !Number.isNaN(value));
    if (!values.length) return 0;
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  }, [reviews]);

  const topServices = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const key = String(booking.service || "Unknown");
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [bookings]);

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Analytics Report",
      subtitle: "Tabular export of analytics metrics and paid payment summaries.",
      sections: [
        {
          title: "Overview",
          columns: ["Metric", "Value"],
          rows: [
            ["Total Paid Sales", `PHP ${totalSales.toLocaleString()}`],
            ["Total Bookings", totalBookings],
            ["Average Ratings", avgRating || 0],
          ],
        },
        {
          title: "Payment Methods",
          columns: ["Method", "Transactions"],
          rows: Object.entries(countByMethod).map(([method, count]) => [method, count]),
        },
        {
          title: "Top Services",
          columns: ["Rank", "Service", "Bookings"],
          rows: topServices.map((service, index) => [index + 1, service.name, service.count]),
          emptyMessage: "No booking data available.",
        },
      ],
    });

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Analytics</Text>
          <Text style={styles.h2}>Trends and performance insights.</Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} style={styles.exportBtn} onPress={exportPdf}>
          <Text style={styles.exportTxt}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.salesCard}>
        <Text style={styles.salesTitle}>Total Paid Sales</Text>
        <Text style={styles.salesValue}>Php {totalSales.toLocaleString()}</Text>
        <Text style={styles.salesSub}>Calculated from paid transactions in the shared database</Text>

        <Text style={styles.paySummaryTitle}>Clients' mode of payment summary</Text>

        <View style={styles.payGrid}>
          <PayMini title="Cash" value={countByMethod.Cash || 0} />
          <PayMini title="GCash" value={countByMethod.GCash || 0} />
          <PayMini title="Paypal" value={countByMethod.Paypal || 0} />
          <PayMini title="Bank Transfer" value={countByMethod["Bank Transfer"] || 0} />
        </View>
      </View>

      <View style={styles.duoRow}>
        <View style={styles.blueCard}>
          <Text style={styles.duoTitleBlue}>Total Bookings</Text>
          <Text style={styles.duoValueBlue}>{totalBookings}</Text>
          <Text style={styles.duoSubBlue}>Live booking volume</Text>
        </View>

        <View style={styles.yellowCard}>
          <Text style={styles.duoTitleYellow}>Average Ratings</Text>
          <Text style={styles.duoValueYellow}>{avgRating || 0}</Text>
          <Text style={styles.duoSubYellow}>Based on submitted reviews</Text>
        </View>
      </View>

      <View style={styles.topServicesCard}>
        <Text style={styles.sectionTitle}>Top Services</Text>

        {topServices.length ? (
          topServices.map((service, idx) => (
            <View key={service.name} style={styles.rankRow}>
              <View style={styles.rankBubble}>
                <Text style={styles.rankBubbleTxt}>{idx + 1}</Text>
              </View>

              <Text style={styles.rankName}>{service.name}</Text>
              <Text style={styles.rankCount}>{service.count} bookings</Text>
            </View>
          ))
        ) : (
          <View style={styles.rankRow}>
            <Text style={styles.rankName}>No booking data yet</Text>
          </View>
        )}
      </View>

      <View style={styles.aiCard}>
        <View style={styles.aiHead}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconTxt}>↗</Text>
          </View>
          <Text style={styles.aiTitle}>Live Insights</Text>
        </View>

        <View style={styles.aiBullets}>
          <Text style={styles.aiBullet}>• Analytics are now based on the same backend collections as the web app.</Text>
          <Text style={styles.aiBullet}>• Top services update from booking history instead of placeholder numbers.</Text>
          <Text style={styles.aiBullet}>• Sales totals use only paid records from the shared payments collection.</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
