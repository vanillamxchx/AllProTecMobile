// mobile/styles/css/admin/adminServicesStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
  paddingHorizontal: 14,
  paddingTop: 12,
  paddingBottom: 120, // ✅ reserve fixed nav space
    },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  h1: { fontSize: 22, fontWeight: "950", color: "#111827" },
  h2: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  exportBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exportTxt: { color: "#FFF", fontWeight: "900", fontSize: 12 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },

  searchIcon: { width: 18, height: 18, opacity: 0.65 },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: { width: 20, height: 20, opacity: 0.75 },

  section: { marginTop: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "950", color: "#111827", marginBottom: 10 },
  list: { gap: 12 },
  emptyCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
  },
  emptyTxt: { fontSize: 13, fontWeight: "700", color: "#6B7280" },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
  },

  cardTop: { gap: 6 },

  title: { fontSize: 18, fontWeight: "950", color: "#111827" },
  desc: { fontSize: 13, fontWeight: "700", color: "#6B7280" },

  meta: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "900",
    color: "#4B5563",
    textAlign: "right",
  },

  cardBottom: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusPill: {
    flex: 1,
    height: 28,
    borderRadius: 999,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  statusTxt: { fontSize: 12, fontWeight: "950" },

  enabled: {
    backgroundColor: "#A7E6BF",
    borderColor: "#16A34A",
  },
  disabled: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },

  viewBtn: {
    marginLeft: 10,
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  viewTxt: { fontSize: 12, fontWeight: "900", color: "#111827" },
});
