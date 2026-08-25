// mobile/styles/css/admin/adminDashboardStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F2" },

  // centers UI on wide screens (RN Web)
  stage: { flex: 1, alignSelf: "center", backgroundColor: "#F2F2F2" },

  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 120, // space for bottom nav
  },

  headBlock: { marginBottom: 10 },
  h1: { fontSize: 22, fontWeight: "950", color: "#111827" },
  h2: { marginTop: 2, fontSize: 13, fontWeight: "700", color: "#6B7280" },

  /* STATS (2x2) */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginTop: 6,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 16,
    padding: 14,
  },
  statValue: { fontSize: 26, fontWeight: "950", color: "#111827" },
  statLabel: { marginTop: 2, fontSize: 12, fontWeight: "800", color: "#374151" },

  /* SECTIONS */
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "950", color: "#111827" },
  sectionSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "#6B7280" },

  stack: { marginTop: 10, gap: 10 },

  /* ALERT CARDS */
  alertCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 12,
  },
  alertTitle: { fontSize: 14, fontWeight: "950", color: "#111827" },
  alertSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "#6B7280" },
  quoteCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 12,
  },
  quoteCardSelected: {
    borderColor: "#D7B24A",
    backgroundColor: "#FFF7DB",
  },
  quoteHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  quoteTitle: { flex: 1, fontSize: 13, fontWeight: "950", color: "#111827" },
  quoteMeta: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "#6B7280" },
  quoteStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  quoteStatusReceived: {
    backgroundColor: "#ECFDF3",
    borderColor: "#BBF7D0",
  },
  quoteStatusReview: {
    backgroundColor: "#FFF7DB",
    borderColor: "#F6E7B6",
  },
  quoteStatusText: { fontSize: 11, fontWeight: "900", color: "#111827" },
  detailCard: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 16,
    padding: 12,
  },
  detailGrid: { marginTop: 10, gap: 10 },
  detailItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailItemWide: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailLabel: { fontSize: 11, fontWeight: "800", color: "#6B7280" },
  detailValue: { marginTop: 3, fontSize: 13, fontWeight: "800", color: "#111827" },
  statusRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  statusBtnActive: {
    borderColor: "#D7B24A",
    backgroundColor: "#FFF7DB",
  },
  statusBtnText: { fontSize: 12, fontWeight: "900", color: "#111827" },
  statusBtnTextActive: { color: "#111827" },

  /* BIG WHITE CARD (calendar + overview) */
  card: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 16,
    padding: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "950", color: "#111827" },
  cardSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "#6B7280" },

  divider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  /* CALENDAR TOP CONTROLS */
  calTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  calControls: { flexDirection: "row", alignItems: "center", gap: 6 },

  ctrlBtn: {
    width: 34,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  ctrlTxt: { fontSize: 14, fontWeight: "900", color: "#111827" },

  todayBtn: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  todayTxt: { fontSize: 12, fontWeight: "900", color: "#111827" },

  /* DAYS OF WEEK */
  dowRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  dow: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
  },

  /* CALENDAR GRID (6x7) */
  calGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },

  dayCell: {
    width: "13.2%",
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 6,
    position: "relative",
  },

  dayCellOut: {
    backgroundColor: "#FAFAFA",
    borderColor: "#EEEEEE",
  },

  dayCellSelected: {
    borderColor: "#D7B24A",
    backgroundColor: "#FFF7DB",
  },

  dayCellToday: {
    borderColor: "#111827",
  },

  dayNum: { fontSize: 11, fontWeight: "900", color: "#111827" },

  dayNumOut: { color: "#9CA3AF" },

  dayBadge: {
    position: "absolute",
    right: 4,
    top: 20,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F6E7B6",
    borderWidth: 1,
    borderColor: "#D7B24A",
    alignItems: "center",
    justifyContent: "center",
  },
  dayBadgeTxt: { fontSize: 11, fontWeight: "950", color: "#111827" },

  /* BOOKINGS OVERVIEW CARDS */
  bookingCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 12,
  },
  bookingTitle: { fontSize: 13, fontWeight: "950", color: "#111827" },
  bookingSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "#6B7280" },

  /* AI INSIGHTS CARD */
  aiCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "#6D4CFF",
  },
  aiTitle: { fontSize: 16, fontWeight: "950", color: "#FFF" },
  aiBullets: { marginTop: 10, gap: 6 },
  aiBullet: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.95)" },
  aiLinkBtn: { alignSelf: "flex-end", marginTop: 10 },
  aiLink: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFF",
    textDecorationLine: "underline",
  },
});
