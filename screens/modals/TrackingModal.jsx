import React, { useMemo } from "react";
import { Linking, Modal, Pressable, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";

import { buildPublicTrackingUrl } from "../../services/api";
import {
  createWarrantyAcknowledgement,
  normalizeWarrantyChecklist,
  WARRANTY_COVERAGE_NOTES,
} from "../../services/warrantyChecklist";
import { getTrackingStatusMeta, getTrackingTimeline } from "../../services/trackingStatus";
import styles from "../../styles/css/modals/trackingModalStyles";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr || "-");
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function openExternalUrl(url) {
  if (!url) return;
  Linking.openURL(url).catch(() => {});
}

export default function TrackingModal({ visible, booking, onClose }) {
  const bookingId = String(booking?.id || "").trim();
  const serviceDetailsUrl = buildPublicTrackingUrl(bookingId);
  const warrantyUrl = buildPublicTrackingUrl(bookingId, "warranty");
  const serviceQrUrl = serviceDetailsUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(serviceDetailsUrl)}`
    : "";
  const warrantyQrUrl = warrantyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(warrantyUrl)}`
    : "";

  const timeline = useMemo(() => getTrackingTimeline(booking), [booking]);
  const issueMarkers = Array.isArray(booking?.issueMarkers) ? booking.issueMarkers : [];
  const checklistItems = useMemo(
    () => normalizeWarrantyChecklist(booking?.warrantyChecklistItems || []),
    [booking?.warrantyChecklistItems]
  );
  const acknowledgement = useMemo(() => createWarrantyAcknowledgement(booking || {}), [booking]);
  const warrantyReleased = Boolean(booking?.warrantyReleased);
  const warrantyStatus = warrantyReleased ? "Available" : "Pending completion";

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Track Service Details</Text>

              <Row label="Booking ID:" value={booking?.id} />
              <Row label="Booking Date:" value={formatDate(booking?.date)} />
              <Row label="Customer:" value={booking?.customer} />
              <Row label="Vehicle:" value={booking?.vehicleModel || booking?.vehicle} />
              <Row label="Plate Number:" value={booking?.plate} />
              <Row label="Service:" value={booking?.service} />

              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <StatusBadge status={booking?.status} />
              </View>

              <Row label="Assigned To:" value={booking?.assignedTo || booking?.assigned} />
              <Row label="Warranty:" value={warrantyStatus} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Progress</Text>
                <View style={styles.timeline}>
                  {timeline.map((item) => (
                    <View key={item.label} style={[styles.timelineItem, item.active && styles.timelineItemActive]}>
                      <Text style={[styles.timelineTxt, item.active && styles.timelineTxtActive]}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.qrSection}>
                <Text style={styles.sectionTitle}>Service Details QR</Text>
                {serviceQrUrl ? <Image source={{ uri: serviceQrUrl }} style={styles.qrImage} /> : null}
                <TouchableOpacity activeOpacity={0.85} onPress={() => openExternalUrl(serviceDetailsUrl)}>
                  <Text style={styles.linkTxt}>{serviceDetailsUrl || "Tracking link unavailable."}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Issue Notes</Text>
                <Text style={styles.panelText}>{booking?.issueNote || "No issue notes were added for this booking."}</Text>
                <View style={styles.markerList}>
                  {issueMarkers.length ? (
                    issueMarkers.map((marker, index) => (
                      <View key={`${marker.issueType || "issue"}-${index}`} style={styles.markerCard}>
                        <Text style={styles.markerTitle}>{marker.issueType || "Issue marker"}</Text>
                        <Text style={styles.markerMeta}>
                          {(marker.panel || marker.position || "Panel not specified") +
                            (marker.severity ? ` • ${marker.severity}` : "")}
                        </Text>
                        {!!marker.note && <Text style={styles.markerNote}>{marker.note}</Text>}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyTxt}>No issue markers were saved for this booking.</Text>
                  )}
                </View>
              </View>

              <View style={styles.qrSection}>
                <Text style={styles.sectionTitle}>Warranty QR</Text>
                {warrantyQrUrl ? <Image source={{ uri: warrantyQrUrl }} style={styles.qrImage} /> : null}
                <TouchableOpacity activeOpacity={0.85} onPress={() => openExternalUrl(warrantyUrl)}>
                  <Text style={styles.linkTxt}>{warrantyUrl || "Warranty link unavailable."}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Warranty Document</Text>
                {!warrantyReleased ? (
                  <Text style={styles.panelText}>
                    Warranty details will appear here once the booking is completed and the warranty is released from the web system.
                  </Text>
                ) : (
                  <>
                    <View style={styles.detailGrid}>
                      <DetailChip label="Coverage" value={booking?.warrantyCoveragePackage || "-"} />
                      <DetailChip
                        label="Released"
                        value={booking?.warrantyReleasedAt ? formatDate(booking.warrantyReleasedAt) : "Released"}
                      />
                    </View>

                    <View style={styles.checklistWrap}>
                      {checklistItems.map((item) => (
                        <View key={item.id} style={styles.checklistItem}>
                          <View style={styles.checklistHead}>
                            <Text style={styles.checklistLabel}>{item.label}</Text>
                            <Text style={item.done ? styles.doneYes : styles.doneNo}>
                              {item.done ? "Checked" : "Not checked"}
                            </Text>
                          </View>
                          <Text style={styles.checklistMeta}>Done by: {item.doneBy || "-"}</Text>
                          <Text style={styles.checklistMeta}>Notes: {item.notes || "-"}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.notePanel}>
                      {WARRANTY_COVERAGE_NOTES.map((note) => (
                        <Text key={note} style={styles.panelBullet}>
                          • {note}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.detailGrid}>
                      <DetailChip label="Date / Location" value={acknowledgement.dateLocation || "-"} />
                      <DetailChip label="Car Model / Year / Color" value={acknowledgement.carModelYearColor || "-"} />
                      <DetailChip label="Plate / CS Number" value={acknowledgement.plateCsNumber || "-"} />
                      <DetailChip label="Service Availed" value={acknowledgement.serviceAvailed || "-"} />
                      <DetailChip label="Client Name" value={acknowledgement.clientName || "-"} />
                      <DetailChip label="Client Signature" value={acknowledgement.clientSignature || "-"} />
                    </View>

                    {!!booking?.warrantyChecklist && (
                      <View style={styles.notePanel}>
                        <Text style={styles.panelText}>{booking.warrantyChecklist}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity activeOpacity={0.9} style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeTxt}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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

function DetailChip({ label, value }) {
  return (
    <View style={styles.detailChip}>
      <Text style={styles.detailChipLabel}>{label}</Text>
      <Text style={styles.detailChipValue}>{value || "-"}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const meta = getTrackingStatusMeta(status);
  let badgeStyle = styles.statusDefault;

  if (meta.key === "inProgress") badgeStyle = styles.statusProgress;
  else if (meta.key === "completed") badgeStyle = styles.statusCompleted;
  else if (meta.key === "arrived") badgeStyle = styles.statusArrived;
  else if (meta.key === "scheduled" || meta.key === "confirmed") badgeStyle = styles.statusBooked;

  return (
    <View style={[styles.statusBadge, badgeStyle]}>
      <Text style={styles.statusText}>{meta.label}</Text>
    </View>
  );
}
