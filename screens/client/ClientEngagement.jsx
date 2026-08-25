import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";

import styles from "../../styles/css/client/clientEngagementStyles";
import ReviewModal from "../modals/ReviewModal";
import { useMobileData } from "../../context/MobileDataContext.jsx";

const stars = (n = 0) => {
  const count = Math.max(0, Math.min(5, Number(n) || 0));
  return "★★★★★".slice(0, count);
};

export default function ClientEngagement() {
  const { scopedReviews, promos, currentUser, createReview } = useMobileData();
  const [reviewOpen, setReviewOpen] = useState(false);

  const addReview = async (payload) => {
    try {
      await createReview({
        client: currentUser?.name || payload?.name || "Customer",
        clientEmail: currentUser?.email || "",
        rating: payload?.rating || 0,
        comment: payload?.comment || "",
      });
    } catch (error) {
      Alert.alert("Review failed", error.message || "Could not submit your review.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.headBlock}>
          <Text style={styles.h1}>Engagement</Text>
          <Text style={styles.h2}>Reviews, promos, and messaging.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.cardTitle}>Reviews</Text>
              <Text style={styles.cardSub}>Add feedback</Text>
            </View>

            <TouchableOpacity activeOpacity={0.9} style={styles.goldBtn} onPress={() => setReviewOpen(true)}>
              <Text style={styles.goldBtnTxt}>Add Review</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.table}>
            <View style={styles.tHead}>
              <Text style={[styles.th, styles.thClient]}>Client</Text>
              <Text style={[styles.th, styles.thRate]}>Rating</Text>
              <Text style={[styles.th, styles.thComment]}>Comment</Text>
            </View>

            {scopedReviews.length ? (
              scopedReviews.map((review, idx) => (
                <View key={review.id || idx} style={[styles.tRow, idx === 0 && styles.tRowFirst]}>
                  <Text style={[styles.td, styles.tdClient]}>{review.client}</Text>
                  <Text style={[styles.td, styles.tdRate]}>{stars(review.rating)}</Text>
                  <Text style={[styles.td, styles.tdComment]}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tRow}>
                <Text style={styles.tdComment}>No reviews submitted yet.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Promos & Messages</Text>
          <Text style={styles.cardSub}>View updates or manage promotions.</Text>

          {promos.length ? (
            promos.map((promo) => (
              <View key={promo.id} style={styles.emptyBox}>
                <Text style={styles.cardTitle}>{promo.title}</Text>
                <Text style={styles.cardSub}>{promo.message}</Text>
                <Text style={styles.emptyTxt}>{promo.channel} • {promo.status}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTxt}>No active promo for now</Text>
            </View>
          )}
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>

      <ReviewModal visible={reviewOpen} onClose={() => setReviewOpen(false)} onSubmit={addReview} />
    </View>
  );
}
