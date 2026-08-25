// mobile/styles/css/staff/staffProfileStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 170 }, // ✅ staff nav space

  head: { marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: "950", color: "#111827" },
  h2: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  avatarWrap: { alignItems: "center", marginTop: 6, marginBottom: 12 },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#D7B24A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  avatarTxt: { fontSize: 40, fontWeight: "950", color: "#111827" },

  field: { marginBottom: 12 },
  label: { fontSize: 16, fontWeight: "950", color: "#111827", marginBottom: 8 },

  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    backgroundColor: "#FFF",
  },

  // ✅ error styles
  inputError: { borderColor: "#EF4444", borderWidth: 1 },
  errorTxt: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
    lineHeight: 18,
  },

  passRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  passInput: { flex: 1 },

  showBtn: {
    height: 52,
    minWidth: 86,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  showTxt: { fontSize: 16, fontWeight: "950", color: "#111827" },

  primaryBtn: {
    marginTop: 10,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: "#FFF", fontSize: 18, fontWeight: "950" },

  // ✅ cancel button
  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelTxt: { fontSize: 14, fontWeight: "900", color: "#111827" },
});