import React from "react";
import { Modal, View, Text, Pressable, TouchableOpacity } from "react-native";
import styles from "../../styles/css/modals/clientPaymentModalStyles";

export default function ClientPaymentModal({
  visible,
  payment,
  onClose,
  onViewInvoice,
  onUploadProof,
}) {
  if (!visible) return null;

  const statusRaw = String(payment?.status || "—");
  const s = statusRaw.toLowerCase();

  const pillStyle = s.includes("paid")
    ? styles.stPaid
    : s.includes("pending")
    ? styles.stPending
    : styles.stDefault;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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

            {/* ✅ Status row (pill like screenshot) */}
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <View style={[styles.statusPill, pillStyle]}>
                <Text style={styles.statusTxt}>{statusRaw}</Text>
              </View>
            </View>

            <Row label="Method:" value={payment?.method} />

            {/* ✅ Invoice row */}
            <View style={styles.row}>
              <Text style={styles.label}>Invoice:</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.miniBtn}
                onPress={() =>
                  onViewInvoice ? onViewInvoice(payment) : console.log("VIEW INVOICE:", payment)
                }
              >
                <Text style={styles.miniBtnTxt}>View</Text>
              </TouchableOpacity>
            </View>

            {/* ✅ Proof row (client-only) */}
            <View style={styles.row}>
              <Text style={styles.label}>Proof:</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.proofBtn}
                onPress={() =>
                  onUploadProof ? onUploadProof(payment) : console.log("UPLOAD PROOF:", payment)
                }
              >
                <Text style={styles.proofBtnTxt}>Upload Photo Proof</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity activeOpacity={0.9} style={styles.closeBtn} onPress={onClose}>
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
