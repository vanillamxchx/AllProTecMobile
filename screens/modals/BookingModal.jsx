import React, { useMemo } from "react";
import { Modal, View, Text, Pressable, TouchableOpacity, ScrollView, Image } from "react-native";
import styles from "../../styles/css/modals/bookingModalStyles.js";

function normalizeChecklist(booking) {
  if (Array.isArray(booking?.serviceChecklist)) return booking.serviceChecklist.filter(Boolean);
  if (Array.isArray(booking?.checklist)) return booking.checklist.filter(Boolean);
  if (booking?.serviceChecklist && typeof booking.serviceChecklist === "object") {
    return Object.entries(booking.serviceChecklist)
      .filter(([, checked]) => Boolean(checked))
      .map(([label]) => label);
  }
  return [];
}

function normalizeWarranty(booking) {
  if (booking?.warranty && typeof booking.warranty === "object") {
    return {
      period: booking.warranty.period || "Not specified",
      notes: booking.warranty.notes || "",
      termsAccepted: Boolean(booking.warranty.termsAccepted ?? booking.termsAccepted),
      signature: booking.warranty.signature || booking.eSignature || "",
    };
  }

  return {
    period: booking?.warrantyPeriod || "Not specified",
    notes: booking?.warrantyNotes || "",
    termsAccepted: Boolean(booking?.termsAccepted),
    signature: booking?.eSignature || "",
  };
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return amount > 0 ? `PHP ${amount.toLocaleString()}` : "PHP 0";
}

function formatDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const nextDate = new Date(raw);
  if (Number.isNaN(nextDate.getTime())) return raw;
  return nextDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("complete") || value.includes("paid")) return styles.statusDone;
  if (value.includes("progress") || value.includes("verify")) return styles.statusActive;
  if (value.includes("pending") || value.includes("schedule")) return styles.statusPending;
  return styles.statusDefault;
}

function DetailRow({ label, value, valueStyle }) {
  const displayValue =
    value === null || value === undefined || String(value).trim() === "" ? "-" : String(value);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{displayValue}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function BookingModal({ visible, booking, onClose }) {
  const checklist = useMemo(() => normalizeChecklist(booking), [booking]);
  const warranty = useMemo(() => normalizeWarranty(booking), [booking]);
  const displayDate = useMemo(
    () => formatDate(booking?.rawDate || booking?.date),
    [booking?.date, booking?.rawDate]
  );
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Booking Details</Text>
                <Text style={styles.subtitle}>View the appointment and vehicle information.</Text>
              </View>
              <TouchableOpacity activeOpacity={0.9} style={styles.closeIconBtn} onPress={onClose}>
                <Text style={styles.closeIconTxt}>x</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {booking?._id ? (
                <Section title="Record Reference">
                  <DetailRow label="Mongo ID:" value={booking._id} valueStyle={styles.valueCode} />
                  <DetailRow label="Booking ID:" value={booking?.id} valueStyle={styles.valueCode} />
                </Section>
              ) : null}

              <Section title="Appointment">
                {!booking?._id ? <DetailRow label="Booking ID:" value={booking?.id} /> : null}
                <DetailRow label="Booking Date:" value={displayDate} />
                <DetailRow label="Time:" value={booking?.time || "-"} />
                <DetailRow label="Place Slot:" value={booking?.placeSlot ? String(booking.placeSlot) : "-"} />
                <View style={styles.row}>
                  <Text style={styles.label}>Status:</Text>
                  <View style={[styles.statusPill, statusTone(booking?.status)]}>
                    <Text style={styles.statusTxt}>{booking?.status || "-"}</Text>
                  </View>
                </View>
                <DetailRow label="Amount:" value={formatMoney(booking?.amount)} />
                {Number(booking?.originalAmount || 0) > 0 &&
                Number(booking?.originalAmount || 0) !== Number(booking?.amount || 0) ? (
                  <DetailRow label="Original Amount:" value={formatMoney(booking?.originalAmount)} />
                ) : null}
              </Section>

              <Section title="Customer And Vehicle">
                <DetailRow label="Customer:" value={booking?.customer} />
                <DetailRow label="Customer Email:" value={booking?.customerEmail} />
                <DetailRow label="Vehicle Model:" value={booking?.vehicleModel || booking?.vehicle} />
                <DetailRow label="Plate Number:" value={booking?.plate} />
                <DetailRow label="Car Size:" value={booking?.carSize} />
                <DetailRow label="Service:" value={booking?.service} />
                <DetailRow label="Promo ID:" value={booking?.promoId} />
                <DetailRow label="Assigned To:" value={booking?.assignedTo || booking?.assigned} />
              </Section>

              {String(booking?.issueNote || "").trim() ? (
                <Section title="Booking Note">
                  <Text style={styles.noteBox}>{booking.issueNote}</Text>
                </Section>
              ) : null}


              {checklist.length ? (
                <Section title="Service Checklist">
                  <View style={styles.checkList}>
                    {checklist.map((item) => (
                      <View key={item} style={styles.checkItem}>
                        <View style={styles.checkBadge}>
                          <Text style={styles.checkBadgeTxt}>OK</Text>
                        </View>
                        <Text style={styles.checkItemTxt}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Section>
              ) : null}

              {booking?.warranty || booking?.warrantyPeriod || booking?.eSignature ? (
                <Section title="Warranty">
                  <DetailRow label="Coverage:" value={warranty.period} />
                  <DetailRow
                    label="Terms Accepted:"
                    value={warranty.termsAccepted ? "Yes" : "No"}
                  />
                  <DetailRow label="E-signature:" value={warranty.signature || "Not signed"} />
                  <Text style={styles.noteLabel}>Warranty Notes</Text>
                  <Text style={styles.noteBox}>
                    {warranty.notes || "No warranty notes recorded."}
                  </Text>
                </Section>
              ) : null}
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
