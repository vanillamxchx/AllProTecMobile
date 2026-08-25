import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 28,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  exportBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  exportTxt: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
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

  searchIcon: {
    width: 17,
    height: 17,
    opacity: 0.65,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  searchBtn: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBtnTxt: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
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

  filterBtnActive: {
    backgroundColor: "#F3F4F6",
    borderColor: "#111827",
  },

  filterIcon: {
    width: 20,
    height: 20,
    opacity: 0.75,
  },

  resultsTxt: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },

  tableCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  tableHead: {
    flexDirection: "row",
    backgroundColor: "#D1D5DB",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },

  th: {
    fontSize: 11,
    fontWeight: "950",
    color: "#111827",
  },

  td: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 16,
  },

  tr: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },

  trLast: {
    borderBottomWidth: 0,
  },

  emptyState: {
    paddingHorizontal: 16,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyStateTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
  },

  colId: {
    flex: 0.9,
    paddingRight: 6,
  },

  colDate: {
    flex: 1.15,
    paddingRight: 6,
  },

  colCustomer: {
    flex: 1.05,
    paddingRight: 6,
  },

  colAction: {
    flex: 0.92,
  },

  actionCell: {
    alignItems: "flex-end",
  },

  viewBtn: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  viewTxt: {
    fontSize: 10,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    lineHeight: 12,
  },

  pager: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  pageBtn: {
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
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  pageNum: {
    width: 48,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  pageNumTxt: {
    fontSize: 14,
    fontWeight: "950",
    color: "#111827",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
  },

  modalCenter: {
    justifyContent: "center",
    alignItems: "center",
  },

  filterModalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  filterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  filterModalTitle: {
    fontSize: 18,
    fontWeight: "950",
    color: "#111827",
  },

  filterModalClose: {
    fontSize: 16,
    fontWeight: "950",
    color: "#111827",
    paddingHorizontal: 4,
  },

  filterFieldWrap: {
    marginBottom: 12,
  },

  filterFieldLabel: {
    marginBottom: 6,
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
  },

  filterSelect: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterSelectTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  filterSelectChevron: {
    fontSize: 14,
    fontWeight: "900",
    color: "#6B7280",
  },

  filterOptionsCard: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },

  filterOptionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  filterOptionBtnActive: {
    backgroundColor: "#FEF3C7",
  },

  filterOptionTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  filterOptionTxtActive: {
    color: "#111827",
  },

  filterModalFooter: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },

  modalGhostBtn: {
    minWidth: 64,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  modalGhostTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#374151",
  },

  modalApplyBtn: {
    minWidth: 72,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#D4A72C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  modalApplyTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFF",
  },
});
