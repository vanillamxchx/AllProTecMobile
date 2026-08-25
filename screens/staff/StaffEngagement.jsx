import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";

import styles from "../../styles/css/staff/staffEngagementStyles";

export default function StaffEngagement() {
  const reviews = useMemo(
    () => [
      { id: "R1", client: "Juan Dela Cruz", rating: 5, comment: "Super clean finish!" },
      { id: "R2", client: "Maria Santos", rating: 4, comment: "Great service, fast response." },
    ],
    []
  );

  const stars = (n) => {
    const x = Math.max(0, Math.min(5, Number(n) || 0));
    return "★".repeat(x) + "☆".repeat(5 - x);
  };

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      {/* page heading */}
      <View style={styles.pageHead}>
        <Text style={styles.h1}>Engagement</Text>
        <Text style={styles.h2}>Reviews, promos, and messaging.</Text>
      </View>

      {/* REVIEWS CARD */}
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Reviews</Text>
            <Text style={styles.cardSub}>Client feedback</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colClient]}>Client</Text>
            <Text style={[styles.th, styles.colRating]}>Rating</Text>
            <Text style={[styles.th, styles.colComment]}>Comment</Text>
          </View>

          {reviews.map((r, idx) => (
            <View key={r.id} style={[styles.tr, idx === reviews.length - 1 && styles.trLast]}>
              <Text style={[styles.td, styles.colClient]}>{r.client}</Text>
              <Text style={[styles.td, styles.colRating]}>{stars(r.rating)}</Text>
              <Text style={[styles.td, styles.colComment]}>{r.comment}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* PROMOS & MESSAGES CARD */}
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Promos & Messages</Text>
            <Text style={styles.cardSub}>Send updates or manage promotions.</Text>
          </View>
        </View>

        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTxt}>No active promo for now</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
