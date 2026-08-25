import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  root: { flex: 1 },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
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
    borderRadius: 44,
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#111827",

    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.35 : 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  /* ✅ heading 15 */
  title: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  /* ✅ body 12 */
  label: {
    width: 150,
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },

  value: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  /* ✅ status pill */
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  statusTxt: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },

  stPending: { backgroundColor: "#FEF3C7" }, // yellow
  stPaid: { backgroundColor: "#DCFCE7" },    // green
  stDefault: { backgroundColor: "#E5E7EB" }, // gray

  actions: {
    marginTop: 14,
    alignItems: "flex-end",
  },

  closeBtn: {
    minWidth: 120,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#D7B24A",
    borderWidth: 1,
    borderColor: "#B38B1F",

    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.25 : 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  closeTxt: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  invoiceBtn: {
  minWidth: 120,
  height: 34,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  backgroundColor: "#FFF",
  alignItems: "center",
  justifyContent: "center",
},

invoiceTxt: {
  fontSize: 13,
  fontWeight: "900",
  color: "#111827",
},

});
