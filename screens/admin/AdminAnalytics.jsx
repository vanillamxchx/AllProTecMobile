import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import styles from "../../styles/css/admin/adminAnalyticsStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";

function PayMini({ title, value }) {
  return (
    <View style={styles.payMini}>
      <Text style={styles.payMiniTitle}>{title}</Text>
      <Text style={styles.payMiniValue}>{value.count}</Text>
      <Text style={styles.payMiniSub}>{`PHP ${value.amount.toLocaleString("en-PH")}`}</Text>
    </View>
  );
}

function normalizePaymentMethod(method) {
  const normalizedMethod = String(method || "").trim().toLowerCase();
  if (!normalizedMethod) return "Other";
  if (normalizedMethod === "cash") return "Cash";
  if (["gcash", "e-wallet", "ewallet", "e wallet", "maya", "paymaya"].includes(normalizedMethod)) return "E-Wallet";
  if (normalizedMethod === "bank transfer") return "Bank Transfer";
  if (normalizedMethod === "online transfer") return "Online Transfer";
  return "Other";
}

export default function AdminAnalytics() {
  const { payments, bookings, reviews, generateAnalyticsInterpretation } = useMobileData();
  const [aiState, setAiState] = useState({
    status: "idle",
    message: "",
    summary: "",
    keyObservations: [],
    possibleCauses: [],
    recommendations: [],
    warnings: [],
    model: "",
  });
  const paidPayments = useMemo(
    () => payments.filter((payment) => String(payment.status || "").toLowerCase() === "paid"),
    [payments]
  );

  const totalSales = useMemo(
    () => paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [paidPayments]
  );

  const countByMethod = useMemo(() => {
    const map = {
      Cash: { count: 0, amount: 0 },
      "E-Wallet": { count: 0, amount: 0 },
      "Bank Transfer": { count: 0, amount: 0 },
      "Online Transfer": { count: 0, amount: 0 },
    };

    paidPayments.forEach((payment) => {
      const normalized = normalizePaymentMethod(payment.method);
      if (!map[normalized]) return;
      map[normalized].count += 1;
      map[normalized].amount += Number(payment.amount || 0);
    });
    return map;
  }, [paidPayments]);

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

  const analyticsAiPayload = useMemo(
    () => ({
      totals: {
        totalSales,
        totalBookings,
        avgRating,
        paidPayments: paidPayments.length,
        totalReviews: reviews.length,
      },
      topServices: topServices.map((service) => ({
        name: service.name,
        count: service.count,
      })),
      paymentSummary: Object.entries(countByMethod).map(([method, summary]) => ({
        method,
        count: summary.count,
        amount: summary.amount,
      })),
      trends: [
        paidPayments.length ? `${paidPayments.length} paid payment record(s) are included in sales totals.` : "",
        topServices[0] ? `${topServices[0].name} is currently the most-booked service.` : "",
        avgRating > 0 ? `Average customer rating is ${avgRating} out of 5.` : "No review ratings are available yet.",
      ].filter(Boolean),
    }),
    [avgRating, countByMethod, paidPayments.length, reviews.length, topServices, totalBookings, totalSales]
  );

  const aiLines = useMemo(() => {
    const lines = [];
    if (aiState.summary) lines.push(aiState.summary);
    aiState.keyObservations.forEach((item) => lines.push(`Observation: ${item}`));
    aiState.possibleCauses.forEach((item) => lines.push(`Possible cause: ${item}`));
    aiState.recommendations.forEach((item) => lines.push(`Recommendation: ${item}`));
    aiState.warnings.forEach((item) => lines.push(`Warning: ${item}`));
    return lines;
  }, [aiState]);
  const aiSections = useMemo(
    () => [
      {
        key: "observations",
        title: "Key Observations",
        items: aiState.keyObservations,
      },
      {
        key: "causes",
        title: "Possible Causes",
        items: aiState.possibleCauses,
      },
      {
        key: "recommendations",
        title: "Recommendations",
        items: aiState.recommendations,
      },
      {
        key: "warnings",
        title: "Warnings",
        items: aiState.warnings,
        tone: "warning",
      },
    ].filter((section) => Array.isArray(section.items) && section.items.length),
    [aiState]
  );

  const handleGenerateAnalysis = async () => {
    setAiState({
      status: "loading",
      message: "",
      summary: "",
      keyObservations: [],
      possibleCauses: [],
      recommendations: [],
      warnings: [],
      model: "",
    });

    try {
      const response = await generateAnalyticsInterpretation(analyticsAiPayload);
      if (!response?.available) {
        setAiState({
          status: "unavailable",
          message: response?.message || "AI unavailable right now.",
          summary: "",
          keyObservations: [],
          possibleCauses: [],
          recommendations: [],
          warnings: [],
          model: "",
        });
        return;
      }

      setAiState({
        status: "success",
        message: "",
        summary: response.summary || "",
        keyObservations: Array.isArray(response.keyObservations) ? response.keyObservations : [],
        possibleCauses: Array.isArray(response.possibleCauses) ? response.possibleCauses : [],
        recommendations: Array.isArray(response.recommendations) ? response.recommendations : [],
        warnings: Array.isArray(response.warnings) ? response.warnings : [],
        model: response.model || "",
      });
    } catch (error) {
      setAiState({
        status: "error",
        message: error.message || "Unable to generate analysis right now.",
        summary: "",
        keyObservations: [],
        possibleCauses: [],
        recommendations: [],
        warnings: [],
        model: "",
      });
    }
  };

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
          columns: ["Method", "Transactions", "Amount"],
          rows: Object.entries(countByMethod).map(([method, summary]) => [
            method,
            summary.count,
            `PHP ${summary.amount.toLocaleString("en-PH")}`,
          ]),
        },
        {
          title: "Top Services",
          columns: ["Rank", "Service", "Bookings"],
          rows: topServices.map((service, index) => [index + 1, service.name, service.count]),
          emptyMessage: "No booking data available.",
        },
        {
          title: "Interpretation",
          columns: ["Insight"],
          rows: aiLines.map((line) => [line]),
          emptyMessage: "No AI analysis generated yet.",
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
          <PayMini title="Cash" value={countByMethod.Cash} />
          <PayMini title="E-Wallet" value={countByMethod["E-Wallet"]} />
          <PayMini title="Bank Transfer" value={countByMethod["Bank Transfer"]} />
          <PayMini title="Online Transfer" value={countByMethod["Online Transfer"]} />
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
        <View style={styles.aiHeadRow}>
          <View style={styles.aiHeadCopy}>
            <Text style={styles.aiCardTitle}>AI Interpretation</Text>
            <Text style={styles.aiCardSub}>
              {aiState.status === "idle" && "Generate a concise AI summary from the current analytics data."}
              {aiState.status === "loading" && "Analyzing current analytics totals and service trends..."}
              {aiState.status === "success" && `AI analysis ready${aiState.model ? ` • ${aiState.model}` : ""}`}
              {aiState.status === "unavailable" && (aiState.message || "AI unavailable right now.")}
              {aiState.status === "error" && (aiState.message || "Unable to generate analysis right now.")}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.aiGenerateBtn, aiState.status === "loading" && styles.aiGenerateBtnDisabled]}
            onPress={handleGenerateAnalysis}
            disabled={aiState.status === "loading"}
          >
            <Text style={styles.aiGenerateTxt}>
              {aiState.status === "loading" ? "Generating..." : "Generate AI"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aiList}>
          {aiLines.length ? (
            <>
              {!!aiState.summary && (
                <View style={styles.aiSummaryCard}>
                  <Text style={styles.aiSummaryLabel}>Summary</Text>
                  <Text style={styles.aiSummaryTxt}>{aiState.summary}</Text>
                </View>
              )}

              {aiSections.map((section) => (
                <View
                  key={section.key}
                  style={[
                    styles.aiSectionCard,
                    section.tone === "warning" && styles.aiSectionCardWarning,
                  ]}
                >
                  <Text style={styles.aiSectionTitle}>{section.title}</Text>
                  <View style={styles.aiBulletList}>
                    {section.items.map((item, index) => (
                      <View key={section.key + "-" + index} style={styles.aiBulletRow}>
                        <View
                          style={[
                            styles.aiBulletDot,
                            section.tone === "warning" && styles.aiBulletDotWarning,
                          ]}
                        />
                        <Text style={styles.aiBulletTxt}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.aiEmpty}>
              <Text style={styles.aiEmptyTxt}>No AI analysis generated yet.</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
