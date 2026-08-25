import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 112,
  },

  headBlock: {
    marginBottom: 8,
  },

  h1: {
    fontSize: 18,
    fontWeight: "950",
    color: "#111827",
  },

  h2: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  searchRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchBox: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchIcon: {
    width: 17,
    height: 17,
    opacity: 0.7,
  },

  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  filterIcon: {
    width: 20,
    height: 20,
    opacity: 0.9,
  },

  tableCard: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  tHead: {
    backgroundColor: "#D6D6D6",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  th: {
    fontSize: 11,
    fontWeight: "950",
    color: "#111827",
  },

  thId: { width: "22%" },
  thSvc: { width: "28%" },
  thStatus: { width: "24%" },
  thAct: { width: "26%", textAlign: "center" },

  tRow: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  td: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 16,
  },

  tdId: {
    width: "22%",
    paddingRight: 6,
  },

  tdSvc: {
    width: "28%",
    paddingRight: 6,
  },

  pill: {
    width: "24%",
    minHeight: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  pillText: {
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 12,
  },

  pillBlue: { backgroundColor: "#DDEAFE" },
  pillBlueText: { color: "#1D4ED8" },

  pillGreen: { backgroundColor: "#DFFBEA" },
  pillGreenText: { color: "#15803D" },

  pillYellow: { backgroundColor: "#FFF6C7" },
  pillYellowText: { color: "#A16207" },

  pillOrange: { backgroundColor: "#FFD7BE" },
  pillOrangeText: { color: "#EA580C" },

  tdAct: {
    width: "26%",
    alignItems: "center",
    justifyContent: "center",
  },

  viewBtn: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  viewBtnTxt: {
    fontSize: 10,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    lineHeight: 12,
  },

  emptyRow: {
    padding: 16,
    alignItems: "center",
  },

  emptyTxt: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  pagerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  pagerBtn: {
    width: 48,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  pagerTxt: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  pagePill: {
    width: 48,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  pageTxt: {
    fontSize: 14,
    fontWeight: "950",
    color: "#111827",
  },
});
