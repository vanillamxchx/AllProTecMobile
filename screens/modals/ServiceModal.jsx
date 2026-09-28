import React from "react";
import { Modal, View, Text, Pressable, TouchableOpacity } from "react-native";
import styles from "../../styles/css/modals/serviceModalStyles";
import { formatTimeLabel, normalizeAllowedArrivalTimes } from "../../services/bookingWorkflow";
import { formatPriceRangeLabel } from "../../services/servicePricing";
import { formatConsumableSizeLabel, normalizeConsumablesBySize } from "../../services/serviceConsumables";
import { getServiceDescription } from "../../services/serviceDescription";

export default function ServiceModal({ visible, service, onClose }) {
  if (!visible) return null;

  const arrivalTimes = normalizeAllowedArrivalTimes(service?.allowedArrivalTimes, service?.mins)
    .map((time) => formatTimeLabel(time))
    .join(", ");
  const consumables = Object.entries(
    normalizeConsumablesBySize(service?.consumablesBySize, service?.consumables)
  )
    .map(([name, quantities]) => formatConsumableSizeLabel(name, quantities))
    .join(", ");

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>View Service Details</Text>

            <Row label="Service Name:" value={service?.name} />
            <Row label="Description:" value={getServiceDescription(service)} multiline />
            <Row label="Category:" value={service?.category} />
            <Row label="Price:" value={formatPriceRangeLabel(service)} />
            <Row label="Est:" value={`${Number(service?.mins || 0)} mins`} />
            <Row label="Arrival Times:" value={arrivalTimes} multiline />
            <Row label="Consumables:" value={consumables} multiline />

            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <StatusPill status={service?.status || (service?.enabled ? "Enabled" : "Disabled")} />
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

function Row({ label, value, multiline }) {
  return (
    <View style={[styles.row, multiline && styles.rowTop]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, multiline && styles.valueMultiline]}>
        {value || "-"}
      </Text>
    </View>
  );
}

function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();

  const pillStyle =
    s === "enabled" ? styles.stEnabled :
    s === "disabled" ? styles.stDisabled :
    styles.stDefault;

  return (
    <View style={[styles.statusPill, pillStyle]}>
      <Text style={styles.statusTxt}>{status || "-"}</Text>
    </View>
  );
}
