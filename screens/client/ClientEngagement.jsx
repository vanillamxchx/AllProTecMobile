import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as MobileDataModule from "../../context/MobileDataContext";

const useMobileDataHook =
  MobileDataModule.useMobileData ||
  MobileDataModule.useMobileDataContext ||
  (() => ({}));

const colors = {
  background: "#f4f3ef",
  card: "#ffffff",
  border: "#e6e3da",
  text: "#1f2533",
  muted: "#6d7688",
  accent: "#e2bb3d",
  line: "#ece8de",
  success: "#3d7a4f",
};

const styles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    gap: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 14,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f7",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  colClient: {
    flex: 1.2,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  colRating: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  colComment: {
    flex: 1.5,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.muted,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  starButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  starText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#d5d9e2",
  },
  starTextActive: {
    color: colors.accent,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d9dce3",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    backgroundColor: "#ffffff",
    marginBottom: 14,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
  },
  listItem: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 2,
  },
  itemStatus: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.success,
  },
};

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isActiveItem(item) {
  if (!item || typeof item !== "object") return false;
  const status = normalizeText(item.status || item.state || item.availability);
  if (item.isActive === true || item.active === true) return true;
  return status === "active" || status === "published" || status === "enabled";
}

function getCurrentUser(data) {
  return (
    data?.currentUser ||
    data?.user ||
    data?.session?.user ||
    data?.authUser ||
    {}
  );
}

function getUserIdentity(user) {
  return {
    id: user?.id || user?._id || user?.userId || "",
    email: normalizeText(user?.email),
    name: normalizeText(
      user?.name ||
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ")
    ),
  };
}

function isOwnReview(review, identity) {
  if (!review || !identity) return false;
  const reviewUserId = review.userId || review.clientId || review.customerId || review.accountId || "";
  const reviewEmail = normalizeText(review.email || review.clientEmail || review.customerEmail);
  const reviewName = normalizeText(
    review.client ||
      review.clientName ||
      review.customer ||
      review.customerName ||
      review.name
  );

  return Boolean(
    (identity.id && reviewUserId && String(identity.id) === String(reviewUserId)) ||
      (identity.email && reviewEmail && identity.email === reviewEmail) ||
      (identity.name && reviewName && identity.name === reviewName)
  );
}

function isAssignedToUser(item, identity) {
  if (!item || !identity) return false;
  const assignedUserId =
    item.userId ||
    item.clientId ||
    item.customerId ||
    item.accountId ||
    item.assignedTo ||
    item.assignedUserId ||
    "";
  const assignedEmail = normalizeText(
    item.email || item.clientEmail || item.customerEmail || item.assignedEmail
  );
  const assignedName = normalizeText(
    item.clientName ||
      item.customerName ||
      item.name ||
      item.assignedToName ||
      item.assignedName
  );

  return Boolean(
    (identity.id && assignedUserId && String(identity.id) === String(assignedUserId)) ||
      (identity.email && assignedEmail && identity.email === assignedEmail) ||
      (identity.name && assignedName && identity.name === assignedName)
  );
}

function getDisplayName(review, fallbackName) {
  return (
    review.client ||
    review.clientName ||
    review.customer ||
    review.customerName ||
    review.name ||
    fallbackName ||
    "You"
  );
}

function getRating(review) {
  const raw = review.rating ?? review.stars ?? review.score ?? 0;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) return "No rating";
  const safeValue = Math.max(1, Math.min(5, Math.round(numeric)));
  return `${"★".repeat(safeValue)}${"☆".repeat(5 - safeValue)}`;
}

function getComment(review) {
  return review.comment || review.message || review.feedback || review.review || "-";
}

export default function ClientEngagement() {
  const data = useMobileDataHook() || {};
  const currentUser = getCurrentUser(data);
  const identity = getUserIdentity(currentUser);

  const allReviews = asArray(
    data.reviews || data.feedback || data.clientReviews || data.customerReviews
  );
  const assignedRewards = asArray(
    data.customerRewards ||
      data.assignedRewards ||
      data.userRewards ||
      data.myRewards
  ).filter((reward) => isActiveItem(reward) && isAssignedToUser(reward, identity));
  const activePromos = asArray(
    data.promos ||
      data.promotions ||
      data.messages ||
      data.promosAndMessages ||
      data.promotionalMessages
  ).filter(isActiveItem);

  const visibleReviews = useMemo(
    () => allReviews.filter((review) => isOwnReview(review, identity)),
    [allReviews, identity.id, identity.email, identity.name]
  );

  const reviewSubmitters = [
    data.addReview,
    data.createReview,
    data.submitReview,
    data.createCustomerReview,
  ].filter((fn) => typeof fn === "function");
  const submitReview = reviewSubmitters[0] || null;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState([]);

  const combinedReviews = useMemo(
    () => [...localReviews, ...visibleReviews],
    [localReviews, visibleReviews]
  );

  const handleSubmit = async () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      Alert.alert("Missing comment", "Please enter your review first.");
      return;
    }

    const payload = {
      rating,
      comment: trimmedComment,
      clientName:
        currentUser?.name ||
        currentUser?.fullName ||
        [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
        "You",
      clientEmail: currentUser?.email || "",
      customerId: currentUser?.id || currentUser?._id || currentUser?.userId || "",
    };

    try {
      setIsSubmitting(true);

      if (submitReview) {
        await submitReview(payload);
      } else {
        setLocalReviews((previous) => [payload, ...previous]);
      }

      setComment("");
      setRating(5);
      Alert.alert("Review added", "Your review has been saved.");
    } catch (error) {
      Alert.alert(
        "Review not saved",
        error?.message || "Something went wrong while saving your review."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.firstName ||
    "You";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.heroTitle}>Engagement</Text>
        <Text style={styles.heroSubtitle}>
          Reviews, assigned rewards, and active promos.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <Text style={styles.sectionSubtitle}>Your feedback only.</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colClient}>Client</Text>
            <Text style={styles.colRating}>Rating</Text>
            <Text style={styles.colComment}>Comment</Text>
          </View>

          {combinedReviews.length ? (
            combinedReviews.map((review, index) => (
              <View
                key={`${review.id || review._id || review.comment || "review"}-${index}`}
                style={styles.tableRow}
              >
                <Text style={styles.colClient}>
                  {getDisplayName(review, displayName)}
                </Text>
                <Text style={styles.colRating}>{getRating(review)}</Text>
                <Text style={styles.colComment}>{getComment(review)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.emptyText}>You have not added any reviews yet.</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.formLabel}>Add Review</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.starButton}
                onPress={() => setRating(value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.starText,
                    value <= rating ? styles.starTextActive : null,
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Write your review"
            placeholderTextColor="#98a0ae"
            multiline
            style={[styles.input, styles.textarea]}
          />
          <TouchableOpacity
            style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Saving..." : "Submit Review"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        <Text style={styles.sectionSubtitle}>Only rewards assigned by admin.</Text>

        {assignedRewards.length ? (
          assignedRewards.map((reward, index) => (
            <View
              key={`${reward.id || reward._id || reward.title || reward.name || "reward"}-${index}`}
              style={styles.listItem}
            >
              <Text style={styles.itemTitle}>
                {reward.title || reward.name || reward.rewardName || "Reward"}
              </Text>
              <Text style={styles.itemMeta}>
                {reward.description || reward.type || reward.label || "-"}
              </Text>
              <Text style={styles.itemStatus}>Active</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No active assigned rewards right now.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Promos & Messages</Text>
        <Text style={styles.sectionSubtitle}>Active promos and announcements.</Text>

        {activePromos.length ? (
          activePromos.map((promo, index) => (
            <View
              key={`${promo.id || promo._id || promo.title || promo.name || "promo"}-${index}`}
              style={styles.listItem}
            >
              <Text style={styles.itemTitle}>
                {promo.title || promo.name || promo.subject || "Promo"}
              </Text>
              <Text style={styles.itemMeta}>
                {promo.message || promo.description || promo.body || "-"}
              </Text>
              <Text style={styles.itemStatus}>Active</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No active promos or messages right now.</Text>
        )}
      </View>
    </ScrollView>
  );
}
