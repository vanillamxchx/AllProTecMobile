import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  root: { flex: 1 },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFF",
    borderRadius: 46,
    paddingVertical: 26,
    paddingHorizontal: 26,
    borderWidth: 2,
    borderColor: "#111827",

    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.35 : 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "950",
    color: "#111827",
    marginBottom: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  label: {
    width: 165,
    fontSize: 14,
    fontWeight: "950",
    color: "#111827",
  },

  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
  },

  /* ✅ status pill */
  statusPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusTxt: {
    fontSize: 13,
    fontWeight: "950",
    color: "#A16207",
  },

  stPending: { backgroundColor: "#FEF3C7" },
  stPaid: { backgroundColor: "#DCFCE7" },
  stDefault: { backgroundColor: "#E5E7EB" },

  miniBtn: {
    minWidth: 120,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  miniBtnTxt: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  proofBtn: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  proofBtnTxt: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  actions: {
    marginTop: 18,
    alignItems: "flex-end",
  },

  closeBtn: {
    minWidth: 140,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#D7B24A",
    borderWidth: 1,
    borderColor: "#B38B1F",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.25 : 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  closeTxt: {
    fontSize: 16,
    fontWeight: "950",
    color: "#111827",
  },
});
