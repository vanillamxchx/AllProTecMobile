import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: "#F2F2F2",
  },

  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headLeft: { flex: 1, paddingRight: 10 },

  h1: { fontSize: 22, fontWeight: "950", color: "#111827" },
  h2: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  backBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backTxt: { color: "#FFF", fontWeight: "900", fontSize: 12 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  readOnlyWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  readOnlyTxt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  readOnlySubTxt: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  label: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    marginTop: 10,
    marginBottom: 6,
  },

  inputWrap: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  input: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  selectWrap: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectTxt: { fontSize: 13, fontWeight: "800", color: "#111827" },
  selectTxtPlaceholder: { color: "#9CA3AF", fontWeight: "700" },
  selectWrapDisabled: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  chev: { fontSize: 16, fontWeight: "900", color: "#6B7280" },

  textAreaWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  textArea: {
    minHeight: 78,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    textAlignVertical: "top",
  },

  helperTxt: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 17,
  },

  sectionHelp: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  calendarCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  calTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calTitle: { fontSize: 16, fontWeight: "950", color: "#111827" },

  calNav: { flexDirection: "row", gap: 8 },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  navTxt: { fontSize: 16, fontWeight: "900", color: "#111827" },

  dowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dowTxt: {
    width: "14.285%",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
  },

  grid: { flexDirection: "row", flexWrap: "wrap" },

  dayCell: { width: "14.285%", padding: 4 },
  dayBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  dayBtnActive: { borderColor: "#111827", backgroundColor: "#111827" },
  dayBtnDisabled: { backgroundColor: "#F9FAFB", borderColor: "#EEF2F7" },
  dayNum: { fontSize: 12, fontWeight: "900", color: "#111827" },
  dayNumActive: { color: "#FFF" },
  dayNumDisabled: { color: "#C0C7D2" },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  totalLabel: { fontSize: 16, fontWeight: "950", color: "#111827" },
  totalValue: { fontSize: 16, fontWeight: "950", color: "#111827" },

  confirmBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9B24C",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  confirmBtnDisabled: { opacity: 0.55 },
  confirmTxt: { fontSize: 14, fontWeight: "950", color: "#111827" },

  modalOverlay: { flex: 1, justifyContent: "center", padding: 16 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 16, fontWeight: "950", color: "#111827", marginBottom: 10 },
  modalList: { maxHeight: 320 },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  modalItemActive: { borderColor: "#111827", backgroundColor: "#111827" },
  modalItemTxt: { fontSize: 13, fontWeight: "900", color: "#111827" },
  modalItemTxtActive: { color: "#FFF" },

  modalCloseBtn: {
    marginTop: 6,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseTxt: { fontSize: 13, fontWeight: "950", color: "#111827" },

  inputError: {
    borderColor: "#EF4444",
  },
  errTxt: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#EF4444",
  },
  cardWarn: {
    borderColor: "#EF4444",
  },
});
