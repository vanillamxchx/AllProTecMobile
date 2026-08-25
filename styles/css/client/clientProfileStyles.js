import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 170,
  },

  headBlock: { marginBottom: 10 },

  h1: { fontSize: 22, fontWeight: "950", color: "#111827" },
  h2: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  card: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 12,
  },

  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 999,
    backgroundColor: "#E7C75F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  avatarText: {
    fontSize: 34,
    fontWeight: "950",
    color: "#111827",
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  passRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  passInput: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  showBtn: {
    width: 86,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  showTxt: {
    fontSize: 14,
    fontWeight: "950",
    color: "#111827",
  },

  saveBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  saveTxt: {
    fontSize: 15,
    fontWeight: "950",
    color: "#FFF",
  },

  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1,
  },

  errorTxt: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
    lineHeight: 18,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "950",
    color: "#111827",
  },

  sectionSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 18,
  },

  carList: {
    marginTop: 12,
    gap: 10,
  },

  carCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 12,
  },

  carTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  carMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  removeCarBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  removeCarTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#B91C1C",
  },

  emptyCarCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    padding: 12,
  },

  emptyCarTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 18,
  },

  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  sizeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
  },

  sizeChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  sizeChipTxt: {
    fontSize: 12,
    fontWeight: "800",
    color: "#374151",
  },

  sizeChipTxtActive: {
    color: "#FFF",
  },

  addCarBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  addCarTxt: {
    fontSize: 14,
    fontWeight: "950",
    color: "#111827",
  },

  cancelBtn: {
    marginTop: 10,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelTxt: {
    fontSize: 14,
    fontWeight: "950",
    color: "#111827",
  },
});
