import { StyleSheet } from "react-native";

export default StyleSheet.create({
  root: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 18,
  },

  card: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "92%",
    alignSelf: "center",
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "950",
    color: "#111827",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 18,
  },

  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  closeIconTxt: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 20,
  },

  scrollBody: {
    padding: 14,
    gap: 12,
  },

  section: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },

  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
  },

  value: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    textAlign: "right",
  },

  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusTxt: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },

  statusPending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },

  statusActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB",
  },

  statusDone: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },

  statusDefault: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  },

  noteLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  noteBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    lineHeight: 18,
  },

  mapWrap: {
    gap: 12,
  },

  mapPanel: {
    borderWidth: 1,
    borderColor: "#D7DEEA",
    borderRadius: 14,
    backgroundColor: "#F8FBFF",
    padding: 12,
    gap: 10,
  },

  carCanvas: {
    width: "100%",
    aspectRatio: 735 / 482,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5DEED",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  carImage: {
    width: "100%",
    height: "100%",
  },

  markerDot: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -14,
    marginTop: -14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  markerDotText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  mapHint: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    lineHeight: 16,
  },

  markerLegend: {
    gap: 10,
  },

  markerLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 22,
  },

  markerLegendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },

  markerLegendText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  checkList: {
    gap: 8,
  },

  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D7B24A",
    alignItems: "center",
    justifyContent: "center",
  },

  checkBadgeTxt: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },

  checkItemTxt: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 18,
  },

  actions: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
  },

  closeBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "#D7B24A",
    borderWidth: 1,
    borderColor: "#B38B1F",
    alignItems: "center",
    justifyContent: "center",
  },

  closeTxt: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
});
