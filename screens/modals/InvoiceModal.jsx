import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import { getRewardPreview, isRewardExpired, useMobileData } from "../../context/MobileDataContext.jsx";
import styles from "../../styles/css/modals/invoiceModalStyles.js";

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

function formatApproxTimeLeft(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const due = new Date(raw);
  if (Number.isNaN(due.getTime())) return "";
  const hours = Math.ceil((due.getTime() - Date.now()) / (60 * 60 * 1000));
  if (hours <= 0) return "expired";
  if (hours === 1) return "approximately 1 hour";
  return `approximately ${hours} hours`;
}

function InfoRow({ label, value, children }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {children ? children : <Text style={styles.infoValue}>{value || "-"}</Text>}
    </View>
  );
}

function BreakdownRow({ label, value, total = false }) {
  return (
    <View style={[styles.breakdownRow, total && styles.breakdownRowTotal]}>
      <Text style={[styles.breakdownLabel, total && styles.breakdownLabelTotal]}>{label}</Text>
      <Text style={[styles.breakdownValue, total && styles.breakdownValueTotal]}>{value}</Text>
    </View>
  );
}

export default function InvoiceModal({ visible, payment, onClose }) {
  const {
    formatDate,
    formatCurrency,
    statusMeta,
    getInvoiceBreakdown,
    scopedRewards,
    getPaymentStageLabel,
    getPaymentTotal,
    getAmountPaid,
    getRemainingBalance,
    normalizeStageStatus,
  } = useMobileData();
  const [downPaymentProofLoadError, setDownPaymentProofLoadError] = useState(false);
  const [finalPaymentProofLoadError, setFinalPaymentProofLoadError] = useState(false);
  const breakdown = useMemo(() => getInvoiceBreakdown(payment), [payment, getInvoiceBreakdown]);
  const stageLabel = getPaymentStageLabel(payment);
  const status = statusMeta(stageLabel);
  const usableRewards = useMemo(() => scopedRewards.filter((r) => !isRewardExpired(r)), [scopedRewards]);
  const downPaymentStatus = normalizeStageStatus(
    payment?.downPaymentStatus,
    payment?.downPaymentRequired === false ? "Not Required" : "Pending"
  );
  const finalPaymentStatus = normalizeStageStatus(payment?.finalPaymentStatus, payment?.status || "Pending");
  const downPaymentProofImage = String(payment?.downPaymentProofUrl || payment?.proofImage || "").trim();
  const finalPaymentProofImage = String(payment?.finalPaymentProofUrl || "").trim();

  const hasReward = payment?.rewardId || payment?.rewardDiscountAmount > 0;
  const rewardPreview = hasReward && payment?.rewardValue ? getRewardPreview({ rewardValue: payment.rewardValue }, payment.originalAmount || 0) : null;

  if (!visible || !payment) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Sales Invoice</Text>
                <Text style={styles.subtitle}>Billing details and service amount breakdown.</Text>
              </View>
              <TouchableOpacity activeOpacity={0.9} style={styles.closeIconBtn} onPress={onClose}>
                <Text style={styles.closeIconTxt}>x</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <View style={styles.topMeta}>
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>Invoice No.</Text>
                  <Text style={styles.metaValue}>{payment?.bookingId || payment?.id || "-"}</Text>
                </View>
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>Billing Date</Text>
                  <Text style={styles.metaValue}>{formatDate(payment?.date)}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Details</Text>
                <InfoRow label="Name" value={payment?.customer} />
                <InfoRow label="Email" value={payment?.customerEmail} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appointment Details</Text>
                <InfoRow label="Service" value={payment?.service} />
                <InfoRow label="Appointment" value={payment?.service || "Checking"} />
                <InfoRow label="Status">
                  <View style={[styles.badge, { backgroundColor: status.cls === 'paid' ? '#10B981' : status.cls === 'review' ? '#F59E0B' : status.cls === 'rejected' ? '#EF4444' : '#6B7280' }]}>
                    <Text style={styles.badgeText}>{status.label}</Text>
                  </View>
                </InfoRow>
                <InfoRow label="Method" value={payment?.finalPaymentMethod || payment?.downPaymentMethod || payment?.method} />
                <InfoRow label="Reference" value={payment?.finalPaymentReference || payment?.downPaymentReference || payment?.reference} />
                <InfoRow
                  label="DP Proof Submitted"
                  value={payment?.downPaymentProofSubmittedAt ? formatDateTime(payment?.downPaymentProofSubmittedAt) : "-"}
                />
                <InfoRow
                  label="Balance Proof Submitted"
                  value={payment?.finalPaymentProofSubmittedAt ? formatDateTime(payment?.finalPaymentProofSubmittedAt) : "-"}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stage Summary</Text>
                <InfoRow label="Total Amount" value={formatCurrency(getPaymentTotal(payment))} />
                <InfoRow label="Required DP" value={formatCurrency(payment?.downPaymentAmount || 0)} />
                <InfoRow label="Amount Paid" value={formatCurrency(getAmountPaid(payment))} />
                <InfoRow label="Remaining Balance" value={formatCurrency(getRemainingBalance(payment))} />
                <InfoRow label="DP Status" value={downPaymentStatus} />
                <InfoRow label="Final Status" value={finalPaymentStatus} />
                {payment?.downPaymentDueAt && payment?.downPaymentRequired === true ? (
                  <InfoRow
                    label="DP Due"
                    value={`${formatDateTime(payment?.downPaymentDueAt)}${formatApproxTimeLeft(payment?.downPaymentDueAt) ? ` (${formatApproxTimeLeft(payment?.downPaymentDueAt)} left)` : ""}`}
                  />
                ) : null}
                {payment?.rewardId ? (
                  <InfoRow
                    label="Reward Used"
                    value={`${payment?.rewardName || "-"} (${payment?.rewardValue || payment?.rewardType || "-"})`}
                  />
                ) : null}
              </View>

              {downPaymentProofImage && !downPaymentProofLoadError && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Down Payment Proof</Text>
                  <Image
                    source={{ uri: downPaymentProofImage }}
                    style={styles.proofImage}
                    onError={() => setDownPaymentProofLoadError(true)}
                    onLoadEnd={() => setDownPaymentProofLoadError(false)}
                  />
                </View>
              )}

              {finalPaymentProofImage && !finalPaymentProofLoadError && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Final Payment Proof</Text>
                  <Image
                    source={{ uri: finalPaymentProofImage }}
                    style={styles.proofImage}
                    onError={() => setFinalPaymentProofLoadError(true)}
                    onLoadEnd={() => setFinalPaymentProofLoadError(false)}
                  />
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Amount Breakdown</Text>
                <View style={styles.breakdownCard}>
                  <BreakdownRow
                    label={payment?.service || "Service Charge"}
                    value={formatCurrency(breakdown.originalTotal)}
                  />
                  {breakdown.promoDiscount > 0 && (
                    <BreakdownRow
                      label={`${payment?.promoTitle || "Promo Discount"}`}
                      value={`- ${formatCurrency(breakdown.promoDiscount)}`}
                    />
                  )}
                  {hasReward && (
                    <>
                      <BreakdownRow label="Reward Used" value={payment?.rewardName || "Reward"} />
                      <BreakdownRow label="Discount Type" value={payment?.rewardType || "-"} />
                      <BreakdownRow label="Reward Value" value={payment?.rewardValue || "-"} />
                      <BreakdownRow
                        label="Reward Discount"
                        value={`- ${formatCurrency(rewardPreview?.discountAmount || breakdown.rewardDiscount)}`}
                      />
                    </>
                  )}
                  <BreakdownRow
                    label="Subtotal After Discounts"
                    value={formatCurrency(breakdown.subtotal)}
                  />
                  <BreakdownRow
                    label={`Tax (12%)`}
                    value={formatCurrency(breakdown.tax)}
                  />
                  <BreakdownRow label="Total Amount Due" value={formatCurrency(breakdown.total)} total />
                </View>
                {!!usableRewards.length && !hasReward && (
                  <Text style={styles.sectionNote}>
                    Available rewards: {usableRewards.slice(0, 3).map((reward) => reward.rewardName || reward.title || "Reward").join(", ")}
                  </Text>
                )}
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
