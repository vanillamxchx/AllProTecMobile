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

  searchRow: {
    marginTop: 8,
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

  card: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 18,
    padding: 16,
  },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "950", color: "#111827" },
  emptyCard: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 16,
  },
  emptyTxt: { fontSize: 13, fontWeight: "700", color: "#6B7280" },

  serviceName: { fontSize: 18, fontWeight: "950", color: "#111827" },
  serviceDesc: { marginTop: 2, fontSize: 14, fontWeight: "600", color: "#6B7280" },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  metaText: { fontSize: 15, fontWeight: "800", color: "#4B5563" },

  bookBtn: {
    height: 34,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#D7B24A",
    alignItems: "center",
    justifyContent: "center",
  },

  bookTxt: { fontSize: 14, fontWeight: "900", color: "#111827" },
});
