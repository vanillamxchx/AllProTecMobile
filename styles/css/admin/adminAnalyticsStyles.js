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

  /* ai card */
  aiCard: {
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#8B5CF6",
  },
  aiHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiIconTxt: { color: "#FFF", fontSize: 16, fontWeight: "950" },

  aiTitle: { fontSize: 18, fontWeight: "950", color: "#FFF" },

  aiBullets: { marginTop: 10, gap: 6 },
  aiBullet: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.95)" },
});
