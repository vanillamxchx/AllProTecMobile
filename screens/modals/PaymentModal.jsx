import React from "react";
import { Modal, View, Text, Pressable, TouchableOpacity } from "react-native";
import styles from "../../styles/css/modals/paymentModalStyles";

export default function PaymentModal({
  visible,
  payment,
  onClose,
  onViewInvoice,   // ✅ new prop
}) {
  if (!visible) return null;

  const status = String(payment?.status || "");
  const s = status.toLowerCase();

  const pillStyle =
    s.includes("paid")
      ? styles.stPaid
      : s.includes("pending")
      ? styles.stPending
      : styles.stDefault;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>View Payment Details</Text>

            <Row label="Booking ID:" value={payment?.id} />
            <Row label="Booking Date:" value={payment?.date} />
            <Row label="Customer:" value={payment?.customer} />
            <Row label="Service:" value={payment?.service} />

            <Row
              label="Amount:"
              value={
                payment?.amount != null
                  ? `₱ ${Number(payment.amount).toLocaleString()}`
                  : "—"
              }
            />

            {/* ✅ Status pill */}
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <View style={[styles.statusPill, pillStyle]}>
                <Text style={styles.statusTxt}>{status || "—"}</Text>
              </View>
            </View>

            <Row label="Method:" value={payment?.method} />

            {/* ✅ NEW: Invoice row */}
            <View style={styles.row}>
              <Text style={styles.label}>Invoice:</Text>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.invoiceBtn}
                onPress={() =>
                  onViewInvoice
                    ? onViewInvoice(payment)
                    : console.log("VIEW INVOICE:", payment)
                }
              >
                <Text style={styles.invoiceTxt}>View</Text>
              </TouchableOpacity>
            </View>

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
