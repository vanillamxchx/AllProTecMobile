// mobile/styles/css/admin/adminAnalyticsStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 30 },

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

  /* TOTAL SALES CARD */
  salesCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
  },

  salesTitle: {
    fontSize: 16,
    fontWeight: "950",
    color: "#16A34A",
    textAlign: "center",
  },
  salesValue: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "950",
    color: "#16A34A",
    textAlign: "center",
  },
  salesSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
    textAlign: "center",
  },

  paySummaryTitle: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  payGrid: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  payMini: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  payMiniTitle: { fontSize: 12, fontWeight: "950", color: "#111827" },
  payMiniValue: { marginTop: 6, fontSize: 22, fontWeight: "950", color: "#111827" },
  payMiniSub: { marginTop: 2, fontSize: 11, fontWeight: "800", color: "#6B7280" },

  /* duo row */
  duoRow: { marginTop: 12, flexDirection: "row", gap: 10 },

  blueCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
    backgroundColor: "#DBEAFE",
  },
  duoTitleBlue: { fontSize: 13, fontWeight: "950", color: "#2563EB" },
  duoValueBlue: { marginTop: 6, fontSize: 28, fontWeight: "950", color: "#111827" },
  duoSubBlue: { marginTop: 2, fontSize: 11, fontWeight: "800", color: "#2563EB" },

  yellowCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FEF9C3",
  },
  duoTitleYellow: { fontSize: 13, fontWeight: "950", color: "#B45309" },
  duoValueYellow: { marginTop: 6, fontSize: 28, fontWeight: "950", color: "#111827" },
  duoSubYellow: { marginTop: 2, fontSize: 11, fontWeight: "800", color: "#B45309" },

  /* top services */
  topServicesCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "950", color: "#111827" },

  rankRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E9D5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  rankBubbleTxt: { fontSize: 12, fontWeight: "950", color: "#6D28D9" },

  rankName: { flex: 1, fontSize: 13, fontWeight: "900", color: "#111827" },
  rankCount: { fontSize: 12, fontWeight: "800", color: "#111827" },

  aiCard: {
    marginTop: 12,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "#111827",
  },
  aiHeadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  aiHeadCopy: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: "950",
    color: "#FFF",
  },
  aiCardSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.82)",
    lineHeight: 18,
  },
  aiGenerateBtn: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: "#F8D35F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  aiGenerateBtnDisabled: {
    opacity: 0.65,
  },
  aiGenerateTxt: {
    fontSize: 11,
    fontWeight: "950",
    color: "#111827",
  },
  aiList: {
    marginTop: 12,
    gap: 8,
  },
  aiSummaryCard: {
    borderRadius: 16,
    backgroundColor: "rgba(248,211,95,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,211,95,0.35)",
    padding: 14,
  },
  aiSummaryLabel: {
    fontSize: 11,
    fontWeight: "950",
    color: "#F8D35F",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  aiSummaryTxt: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 20,
  },
  aiSectionCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 12,
  },
  aiSectionCardWarning: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(248,113,113,0.28)",
  },
  aiSectionTitle: {
    fontSize: 13,
    fontWeight: "950",
    color: "#FFFFFF",
  },
  aiBulletList: {
    marginTop: 10,
    gap: 10,
  },
  aiBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  aiBulletDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: "#F8D35F",
  },
  aiBulletDotWarning: {
    backgroundColor: "#F87171",
  },
  aiBulletTxt: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 19,
  },
  aiListItem: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 12,
  },
  aiListTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  aiEmpty: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 12,
  },
  aiEmptyTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.82)",
  },
});
