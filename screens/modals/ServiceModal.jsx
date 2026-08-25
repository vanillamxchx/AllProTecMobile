import React from "react";
import { Modal, View, Text, Pressable, TouchableOpacity } from "react-native";
import styles from "../../styles/css/modals/serviceModalStyles";

export default function ServiceModal({ visible, service, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>View Service Details</Text>

            <Row label="Service Name:" value={service?.name} />
            <Row label="Description:" value={service?.description} multiline />

            <Row label="Price:" value={service?.price} />
            <Row label="Est:" value={service?.est} />

            {/* ✅ Status pill */}
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <StatusPill status={service?.status} />
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
        {value || "—"}
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
      <Text style={styles.statusTxt}>{status || "—"}</Text>
    </View>
  );
}
