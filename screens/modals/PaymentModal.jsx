import React from "react";
import { Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { getReferenceValidationDisplay } from "../../services/paymentReferenceChecker";
import styles from "../../styles/css/modals/paymentModalStyles";

function formatDateTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const nextDate = new Date(raw);
  if (Number.isNaN(nextDate.getTime())) return raw;
  return nextDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PaymentModal({
  visible,
  payment,
  onClose,
  onViewInvoice,
}) {
  const {
    formatDate,
    getPaymentStageLabel,
    getPaymentTotal,
    getAmountPaid,
    getRemainingBalance,
    normalizeStageStatus,
  } = useMobileData();

  if (!visible) return null;

  const status = String(getPaymentStageLabel?.(payment) || payment?.status || "-");
  const downPaymentStatus = normalizeStageStatus?.(
    payment?.downPaymentStatus,
    payment?.downPaymentRequired === false ? "Not Required" : "Pending"
  ) || "Pending";
  const finalPaymentStatus = normalizeStageStatus?.(payment?.finalPaymentStatus, payment?.status || "Pending") || "Pending";
  const downPaymentProofImage = String(payment?.downPaymentProofUrl || payment?.proofImage || "").trim();
  const finalPaymentProofImage = String(payment?.finalPaymentProofUrl || "").trim();
  const statusLower = status.toLowerCase();

  const pillStyle = statusLower.includes("paid")
    ? styles.stPaid
    : statusLower.includes("verification")
      ? styles.stReview
      : statusLower.includes("reject") || statusLower.includes("cancel")
        ? styles.stRejected
        : styles.stPending;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>View Payment Details</Text>

              <Row label="Booking ID:" value={payment?.bookingId || payment?.id} />
              <Row label="Booking Date:" value={formatDate?.(payment?.date) || payment?.date} />
              <Row label="Customer:" value={payment?.customer} />
              <Row label="Service:" value={payment?.service} />
              <Row label="Amount:" value={`₱ ${Number(getPaymentTotal?.(payment) || payment?.amount || 0).toLocaleString()}`} />

              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <View style={[styles.statusPill, pillStyle]}>
                  <Text style={styles.statusTxt}>{status}</Text>
                </View>
              </View>

              <Row label="DP Status:" value={downPaymentStatus} />
              <Row label="Balance Status:" value={finalPaymentStatus} />
              <Row label="Amount Paid:" value={`₱ ${Number(getAmountPaid?.(payment) || 0).toLocaleString()}`} />
              <Row label="Remaining:" value={`₱ ${Number(getRemainingBalance?.(payment) || 0).toLocaleString()}`} />

              <Text style={styles.sectionTitle}>Down Payment</Text>
              <Row label="Method:" value={payment?.downPaymentMethod || payment?.method} />
              <Row label="Reference:" value={payment?.downPaymentReference || payment?.reference} />
              <Row label="Submitted:" value={payment?.downPaymentProofSubmittedAt ? formatDateTime(payment.downPaymentProofSubmittedAt) : "-"} />
              <Row label="Receipt Time:" value={payment?.downPaymentTransactionTimestamp ? formatDateTime(payment.downPaymentTransactionTimestamp) : "-"} />
              <Row
                label="Validation:"
                value={getReferenceValidationDisplay({
                  method: payment?.downPaymentMethod || payment?.method,
                  reference: payment?.downPaymentReference || payment?.reference,
                  proofImage: downPaymentProofImage,
                  status: payment?.downPaymentReferenceCheckStatus,
                  checkedAt: payment?.downPaymentReferenceCheckedAt,
                }).message}
              />
              {downPaymentProofImage ? (
                <Image source={{ uri: downPaymentProofImage }} style={styles.proofImage} resizeMode="cover" />
              ) : null}

              <Text style={styles.sectionTitle}>Balance Payment</Text>
              <Row label="Method:" value={payment?.finalPaymentMethod} />
              <Row label="Reference:" value={payment?.finalPaymentReference} />
              <Row label="Submitted:" value={payment?.finalPaymentProofSubmittedAt ? formatDateTime(payment.finalPaymentProofSubmittedAt) : "-"} />
              <Row label="Receipt Time:" value={payment?.finalPaymentTransactionTimestamp ? formatDateTime(payment.finalPaymentTransactionTimestamp) : "-"} />
              <Row
                label="Validation:"
                value={getReferenceValidationDisplay({
                  method: payment?.finalPaymentMethod,
                  reference: payment?.finalPaymentReference,
                  proofImage: finalPaymentProofImage,
                  status: payment?.finalPaymentReferenceCheckStatus,
                  checkedAt: payment?.finalPaymentReferenceCheckedAt,
                }).message}
              />
              {finalPaymentProofImage ? (
                <Image source={{ uri: finalPaymentProofImage }} style={styles.proofImage} resizeMode="cover" />
              ) : null}

              <View style={styles.row}>
                <Text style={styles.label}>Invoice:</Text>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.invoiceBtn}
                  onPress={() => onViewInvoice?.(payment)}
                >
                  <Text style={styles.invoiceTxt}>View</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

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
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}
