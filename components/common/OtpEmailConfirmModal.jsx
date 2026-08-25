import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OtpEmailConfirmModal({
  visible,
  title = "Verify Email",
  subtitle = "We will send a security code to verify your email.",
  email = "",
  error,
  busy = false,
  onClose,
  onConfirm,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={busy ? undefined : onClose}>
      <Pressable style={styles.modalOverlay} onPress={busy ? undefined : onClose} />
      <View style={styles.modalCenter}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSub}>{subtitle}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              editable={false}
              selectTextOnFocus={false}
              style={[styles.input, styles.inputDisabled, error && styles.inputError]}
            />
          </View>

          {!!error && <Text style={styles.errorTxt}>{error}</Text>}

          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              disabled={busy}
              style={[styles.modalBtn, styles.modalBtnGhost, busy && styles.disabled]}
            >
              <Text style={styles.modalBtnGhostTxt}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirm}
              disabled={busy}
              style={[styles.modalBtn, busy && styles.disabled]}
            >
              <Text style={styles.modalBtnTxt}>{busy ? "Sending..." : "Send OTP"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCenter: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  modalCard: {
    width: "92%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  field: {
    marginTop: 14,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  modalSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    lineHeight: 17,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorTxt: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  modalBtnRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  modalBtn: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E1BC35",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  modalBtnTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },
  modalBtnGhost: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    shadowOpacity: 0,
    elevation: 0,
  },
  modalBtnGhostTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.6,
  },
});
