import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MobileFilterModal({
  open,
  title = "Filter",
  fields = [],
  values = {},
  onApply,
  onClose,
}) {
  const [draftValues, setDraftValues] = useState(values);

  useEffect(() => {
    if (open) {
      setDraftValues(values);
    }
  }, [open, values]);

  const resetDraft = () => {
    const nextValues = {};
    fields.forEach((field) => {
      nextValues[field.key] = field.defaultValue ?? "All";
    });
    setDraftValues(nextValues);
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={onClose}>
                <Text style={styles.closeText}>x</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
              {fields.map((field) => {
                const currentValue = draftValues[field.key] ?? field.defaultValue ?? "All";
                const options = Array.from(new Set([field.defaultValue ?? "All", ...(field.options || [])]));

                return (
                  <View key={field.key} style={styles.fieldBlock}>
                    <Text style={styles.label}>{field.label}</Text>
                    <View style={styles.chips}>
                      {options.map((option) => {
                        const active = currentValue === option;
                        return (
                          <TouchableOpacity
                            key={option}
                            activeOpacity={0.85}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() =>
                              setDraftValues((prev) => ({
                                ...prev,
                                [field.key]: option,
                              }))
                            }
                          >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity activeOpacity={0.85} style={styles.ghostBtn} onPress={resetDraft}>
                <Text style={styles.ghostTxt}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} style={styles.ghostBtn} onPress={onClose}>
                <Text style={styles.ghostTxt}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.applyBtn}
                onPress={() => onApply?.(draftValues)}
              >
                <Text style={styles.applyTxt}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "80%",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "950",
    color: "#111827",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "950",
    color: "#111827",
    paddingHorizontal: 4,
  },
  body: {
    maxHeight: 420,
  },
  bodyContent: {
    paddingBottom: 8,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "#FEF3C7",
    borderColor: "#D4A72C",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#374151",
  },
  chipTextActive: {
    color: "#111827",
  },
  footer: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  ghostBtn: {
    minWidth: 64,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  ghostTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#374151",
  },
  applyBtn: {
    minWidth: 72,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#D4A72C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  applyTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFF",
  },
});
