import React from "react";
import { Modal, View, Text, Pressable, TouchableOpacity } from "react-native";
import styles from "../../styles/css/modals/trackingModalStyles";

export default function TrackingModal({ visible, booking, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>Track Service Details</Text>

            <Row label="Booking ID:" value={booking?.id} />
            <Row label="Booking Date:" value={booking?.date} />
            <Row label="Customer:" value={booking?.customer} />
            <Row label="Vehicle Model:" value={booking?.vehicleModel} />
            <Row label="Service:" value={booking?.service} />

            {/* ✅ STATUS BADGE */}
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <StatusBadge status={booking?.status} />
            </View>

            <Row label="Assigned To:" value={booking?.assignedTo} />

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.closeBtn}
                onPress={onClose}
              >
                <Text style={styles.closeTxt}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const type = String(status || "").trim().toLowerCase();

  let badgeStyle = styles.statusDefault;

  if (type.includes("progress")) badgeStyle = styles.statusProgress;
  else if (type.includes("complete")) badgeStyle = styles.statusCompleted;
  else if (type.includes("arriv")) badgeStyle = styles.statusArrived;
  else if (type.includes("book")) badgeStyle = styles.statusBooked;

  return (
    <View style={[styles.statusBadge, badgeStyle]}>
      <Text style={styles.statusText}>{status || "—"}</Text>
    </View>
  );
}

