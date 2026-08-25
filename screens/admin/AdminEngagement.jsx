import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import styles from "../../styles/css/admin/adminEngagementStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";

export default function AdminEngagement() {
  const { reviews, promos } = useMobileData();

  const ratingLabel = (value) => {
    const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
    return `${safeValue}/5`;
  };

  const exportReviewsPdf = () =>
    exportTabularPdf({
      title: "Admin Reviews Report",
      subtitle: "Client feedback exported in tabular format.",
      sections: [
        {
          columns: ["Client", "Rating", "Comment"],
          rows: reviews.map((review) => [
            review.client || "Client",
            ratingLabel(review.rating),
            review.comment || "-",
          ]),
          emptyMessage: "No reviews available.",
        },
      ],
    });

  const exportPromosPdf = () =>
    exportTabularPdf({
      title: "Admin Promos Report",
      subtitle: "Current promo records exported in tabular format.",
      sections: [
        {
          columns: ["Title", "Message", "Channel", "Status"],
          rows: promos.map((promo) => [
            promo.title || "-",
            promo.message || "-",
            promo.channel || "-",
            promo.status || "-",
          ]),
          emptyMessage: "No active promos available.",
        },
      ],
    });

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHead}>
        <Text style={styles.h1}>Engagement</Text>
        <Text style={styles.h2}>Reviews, promos, and messaging.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Reviews</Text>
            <Text style={styles.cardSub}>Client feedback</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.exportBtn} onPress={exportReviewsPdf}>
            <Text style={styles.exportTxt}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colClient]}>Client</Text>
            <Text style={[styles.th, styles.colRating]}>Rating</Text>
            <Text style={[styles.th, styles.colComment]}>Comment</Text>
          </View>

          {reviews.length ? (
            reviews.map((review, idx) => (
              <View key={review.id || `${review.client}-${idx}`} style={[styles.tr, idx === reviews.length - 1 && styles.trLast]}>
                <Text style={[styles.td, styles.colClient]}>{review.client || "Client"}</Text>
                <Text style={[styles.td, styles.colRating]}>{ratingLabel(review.rating)}</Text>
                <Text style={[styles.td, styles.colComment]}>{review.comment || "-"}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTxt}>No reviews yet</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Promos & Messages</Text>
            <Text style={styles.cardSub}>Current promo records from the shared database.</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.exportBtn} onPress={exportPromosPdf}>
            <Text style={styles.exportTxt}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        {promos.length ? (
          promos.map((promo) => (
            <View key={promo.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
              <Text style={styles.cardTitle}>{promo.title}</Text>
              <Text style={styles.cardSub}>{promo.message}</Text>
              <Text style={[styles.cardSub, { marginTop: 4 }]}>
                {promo.channel} | {promo.status}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTxt}>No active promo for now</Text>
          </View>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
