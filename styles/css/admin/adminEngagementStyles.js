// mobile/styles/css/admin/adminEngagementStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 30,
  },

  pageHead: { marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: "950", color: "#111827" },
  h2: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  cardTitle: { fontSize: 20, fontWeight: "950", color: "#111827" },
  cardSub: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  exportBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exportTxt: { color: "#FFF", fontWeight: "900", fontSize: 12 },

  /* table */
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    overflow: "hidden",
  },

  tableHead: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  th: { fontSize: 12, fontWeight: "950", color: "#111827" },
  td: { fontSize: 12, fontWeight: "800", color: "#111827" },

  tr: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "flex-start",
  },
  trLast: { borderBottomWidth: 0 },

  colClient: { flex: 1.1 },
  colRating: { flex: 0.9 },
  colComment: { flex: 1.6 },

  emptyWrap: {
    height: 90,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  emptyTxt: { fontSize: 13, fontWeight: "800", color: "#6B7280" },
});
