import React from "react";
import { Modal, View, Text, Pressable, TouchableOpacity } from "react-native";

import styles from "../../styles/css/modals/inventoryModalStyles.js";

export default function InventoryModal({ visible, item, onClose }) {
  if (!visible) return null;

  const remark = String(item?.remarks || "").trim();
  const isLow = remark.toLowerCase().includes("low");

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>View Stock Monitoring Details</Text>

            <Row label="Item ID:" value={item?.id} />
            <Row label="Item Name:" value={item?.name} />
            <Row label="Type:" value={item?.type} />
            <Row label="Stocks:" value={item?.stocks} />
            <Row label="Stocks Used:" value={item?.used} />
            <Row label="Remaining Stocks:" value={item?.remaining} />

            <View style={styles.row}>
              <Text style={styles.label}>Remarks:</Text>
              <Text style={[styles.value, isLow && styles.lowRemark]}>
                {remark || "—"}
              </Text>
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
