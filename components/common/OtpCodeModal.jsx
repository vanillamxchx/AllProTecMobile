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

export default function OtpCodeModal({
  visible,
  title = "Enter Security Code",
  subtitle = "Please check your email for the OTP code.",
  value = "",
  error,
  busy = false,
  confirmEnabled = true,
  resendDisabledUntil,
  onChangeText,
  onClose,
  onConfirm,
  onResend,
}) {
  const codeLength = 6;
  const normalizedValue = String(value || "").replace(/[^\d]/g, "").slice(0, codeLength);
  const isResendDisabled = Boolean(resendDisabledUntil && Date.now() < resendDisabledUntil);
  const resendTimer = Math.max(0, Math.ceil(((resendDisabledUntil || 0) - Date.now()) / 1000));
  const canSubmit = normalizedValue.length === codeLength && !busy && confirmEnabled;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={busy ? undefined : onClose}>
      <Pressable style={styles.modalOverlay} onPress={busy ? undefined : onClose} />
      <View style={styles.modalCenter}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSub}>{subtitle}</Text>

          <Text style={styles.label}>Code</Text>
          <TextInput
            value={normalizedValue}
            onChangeText={(nextValue) => onChangeText?.(nextValue.replace(/[^\d]/g, "").slice(0, codeLength))}
            placeholder={busy ? "Sending code..." : "Enter code"}
            placeholderTextColor="#9AA0A6"
            keyboardType="number-pad"
            editable={!busy}
            autoFocus={!busy}
            maxLength={codeLength}
            style={[styles.input, busy && styles.inputDisabled, error && styles.inputError]}
          />

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
              disabled={!canSubmit}
              style={[styles.modalBtn, !canSubmit && styles.disabled]}
            >
              <Text style={styles.modalBtnTxt}>{busy ? "Sending..." : "Continue"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onResend}
            disabled={busy || isResendDisabled}
            style={[styles.resendBtn, (busy || isResendDisabled) && styles.disabled]}
          >
            <Text style={styles.resendTxt}>
              {isResendDisabled ? `Resend in ${resendTimer}s` : "Resend code"}
            </Text>
          </TouchableOpacity>
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
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
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
    color: "#111827",
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
  resendBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  resendTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    textDecorationLine: "underline",
  },
  disabled: {
    opacity: 0.6,
  },
});
