import { Platform, StyleSheet } from "react-native";

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
    maxHeight: "88%",
    backgroundColor: "#FFF",
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderColor: "#111827",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.35 : 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  title: {
    fontSize: 20,
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
    width: 110,
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
  },

  value: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  section: {
    marginTop: 18,
    gap: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "950",
    color: "#111827",
    marginBottom: 4,
  },

  qrSection: {
    marginTop: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  qrImage: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },

  linkTxt: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3158D8",
    textAlign: "center",
  },

  timeline: {
    gap: 8,
  },

  timelineItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  timelineItemActive: {
    borderColor: "#D7B24A",
    backgroundColor: "#FFF7DD",
  },

  timelineTxt: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  timelineTxtActive: {
    color: "#111827",
  },

  panelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    lineHeight: 18,
  },

  markerList: {
    gap: 8,
  },

  markerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    padding: 12,
  },

  markerTitle: {
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
  },

  markerMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
  },

  markerNote: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    lineHeight: 16,
  },

  emptyTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 18,
  },

  detailGrid: {
    gap: 8,
  },

  detailChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },

  detailChipLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
  },

  detailChipValue: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 18,
  },

  checklistWrap: {
    gap: 8,
  },

  checklistItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },

  checklistHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  checklistLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },

  checklistMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  doneYes: {
    fontSize: 11,
    fontWeight: "900",
    color: "#047857",
  },

  doneNo: {
    fontSize: 11,
    fontWeight: "900",
    color: "#B45309",
  },

  notePanel: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    padding: 12,
    gap: 6,
  },

  panelBullet: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    lineHeight: 16,
  },

  statusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
  },

  statusProgress: { backgroundColor: "#DBEAFE" },
  statusCompleted: { backgroundColor: "#DCFCE7" },
  statusArrived: { backgroundColor: "#FEF3C7" },
  statusBooked: { backgroundColor: "#FED7AA" },
  statusDefault: { backgroundColor: "#E5E7EB" },

  actions: {
    marginTop: 18,
    alignItems: "center",
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
