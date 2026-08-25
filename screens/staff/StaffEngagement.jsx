import React from "react";
import { View, Text, ScrollView } from "react-native";

import styles from "../../styles/css/staff/staffEngagementStyles";
import { useMobileData } from "../../context/MobileDataContext.jsx";

export default function StaffEngagement() {
  const { reviews, promos, rewards, customerRewards, formatDate } = useMobileData();
  const rewardRecords = rewards.length ? rewards : customerRewards;

  const ratingLabel = (value) => {
    const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
    return `${safeValue}/5`;
  };

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHead}>
        <Text style={styles.h1}>Engagement</Text>
        <Text style={styles.h2}>Reviews and promos (view only).</Text>
      </View>

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

          {reviews.length ? (
            reviews.map((review, idx) => (
              <View key={review.id || idx} style={[styles.tr, idx === reviews.length - 1 && styles.trLast]}>
                <Text style={[styles.td, styles.colClient]}>{review.client || "-"}</Text>
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
            <Text style={styles.cardTitle}>Rewards</Text>
            <Text style={styles.cardSub}>View-only reward catalog.</Text>
          </View>
        </View>

        {rewardRecords.length ? (
          rewardRecords.map((reward) => (
            <View key={reward.id || reward.rewardId || reward.title} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
              <Text style={styles.cardTitle}>{reward.rewardName || reward.name || reward.title || "Reward"}</Text>
              <Text style={styles.cardSub}>{reward.rewardValue || reward.value || reward.description || "-"}</Text>
              <Text style={[styles.cardSub, { marginTop: 4 }]}>
                {reward.status || "Unused"}{reward.expirationDate ? ` | Expires ${formatDate(reward.expirationDate)}` : ""}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTxt}>No rewards configured</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Promos & Messages</Text>
            <Text style={styles.cardSub}>Send updates or manage promotions.</Text>
          </View>
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
            <Text style={styles.emptyTxt}>No active promos</Text>
          </View>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
