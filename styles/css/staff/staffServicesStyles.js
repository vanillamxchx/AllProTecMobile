import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 170, // ✅ space for bottom nav
  },

  /* header */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  h1: { fontSize: 22, fontWeight: "950", color: "#111827" },
  h2: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  /* search */
  searchRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchBox: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchIcon: { width: 18, height: 18, opacity: 0.7 },

  searchInput: {
    flex: 1,
    height: 52,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  filterIcon: { width: 22, height: 22, opacity: 0.9 },

  /* list */
  list: { marginTop: 12, gap: 12 },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 18,
    padding: 14,
  },

  cardTop: {
    gap: 8,
  },

  title: { fontSize: 18, fontWeight: "950", color: "#111827" },
  desc: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  meta: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "900",
    color: "#6B7280",
    textAlign: "right",
  },

  cardBottom: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  statusPill: {
    flex: 1,
    height: 26,
    borderRadius: 999,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  enabled: {
    backgroundColor: "#A7E7B8",
    borderColor: "#1F7A3F",
  },

  disabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
  },

  statusTxt: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
  },

  viewBtn: {
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  viewTxt: { fontSize: 12, fontWeight: "950", color: "#111827" },
});
