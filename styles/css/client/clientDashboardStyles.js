import { StyleSheet } from "react-native";

export default StyleSheet.create({
  wrap: {
    padding: 16,
    paddingBottom: 24,
  },

  head: {
    marginBottom: 10,
  },
  h1: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  sub: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  // cards base
  cardBase: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
  },

  bigCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  bigNum: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 38,
  },
  bigLabel: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  smallCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 14,
  },
  smallNum: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 30,
  },
  smallLabel: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  sectionCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  sectionSub: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  list: {
    marginTop: 12,
    gap: 10,
  },
  listItem: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  itemSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },
  actionSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
});
