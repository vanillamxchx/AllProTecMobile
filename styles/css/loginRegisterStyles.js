import { StyleSheet } from "react-native";

const GOLD = "#D7B23A";
const GOLD_SOFT = "#F3E7B8";
const GOLD_FAINT = "#FBF6E3";
const BG = "#FFFFFF";
const TEXT = "#111827";
const SUB = "#6B7280";
const BORDER = "#E5E7EB";

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  page: {
    flex: 1,
    backgroundColor: BG,
  },

  pageBgImage: {
    opacity: 0.18,
  },

  pageOverlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },

  stage: {
    alignSelf: "center",
  },

  hero: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },

  heroCompact: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },

  heroTitle: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "900",
    color: TEXT,
    textAlign: "center",
  },

  heroTitleCompact: {
    marginTop: 0,
    fontSize: 18,
  },

  heroSub: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    color: SUB,
    lineHeight: 19,
    maxWidth: 300,
  },

  heroSubCompact: {
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 270,
  },

  cardWrap: {
    marginTop: 8,
    backgroundColor: BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  cardWrapCompact: {
    marginTop: 6,
    borderRadius: 20,
  },

  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 5,
    gap: 8,
    borderRadius: 16,
    backgroundColor: "#F4F5F6",
  },

  tabsCompact: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 4,
    gap: 6,
  },

  tabBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },

  tabBtnActive: {
    backgroundColor: GOLD_SOFT,
    borderColor: GOLD,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "900",
    color: SUB,
  },

  tabTextActive: {
    color: TEXT,
  },

  cardBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },

  cardBodyCompact: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT,
  },

  formSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: SUB,
    lineHeight: 18,
  },

  sectionLabel: {
    marginTop: 14,
    marginBottom: 2,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: GOLD,
    textTransform: "uppercase",
  },

  sectionDivider: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  field: {
    marginTop: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 7,
  },

  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: BG,
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },

  row2: {
    flexDirection: "row",
    gap: 10,
  },

  row2Compact: {
    flexDirection: "column",
    gap: 0,
  },

  col: {
    flex: 1,
  },

  passRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  passInput: {
    flex: 1,
  },

  showBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },

  showTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
  },

  inlineActionRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  inlineActionRowCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 6,
  },

  helperText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: SUB,
    lineHeight: 18,
  },

  helperTextCompact: {
    flex: 0,
  },

  primaryBtn: {
    marginTop: 14,
    backgroundColor: GOLD,
    borderRadius: 16,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  primaryBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111111",
  },

  linkBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },

  linkBtnInline: {
    alignSelf: "flex-start",
  },

  inlineLinks: {
    alignItems: "flex-start",
    gap: 6,
  },

  linkTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
    textDecorationLine: "underline",
  },

  switchRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },

  switchText: {
    fontSize: 12,
    fontWeight: "700",
    color: SUB,
  },

  switchLink: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
    textDecorationLine: "underline",
  },

  helpBtn: {
    marginTop: 12,
    alignItems: "center",
  },

  helpTxt: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT,
    textDecorationLine: "underline",
  },

  inputError: {
    borderColor: "#EF4444",
  },

  errorTxt: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalCenter: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 20,
  },

  modalCard: {
    width: "92%",
    maxWidth: 360,
    backgroundColor: BG,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT,
  },

  modalSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: SUB,
    lineHeight: 17,
  },

  modalBtnRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },

  modalBtn: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  modalBtnTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  modalBtnGhost: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    shadowOpacity: 0,
    elevation: 0,
  },

  modalBtnGhostTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
    textAlign: "center",
  },

  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: TEXT,
  },

  resendBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },

  resendTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
    textDecorationLine: "underline",
  },

  secondaryBtn: {
    marginTop: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
  },

  secondaryBtnTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
    textAlign: "center",
  },

  apiHint: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    color: SUB,
    lineHeight: 16,
  },

  apiQuickRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },

  apiQuickBtn: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD_FAINT,
    borderWidth: 1,
    borderColor: GOLD_SOFT,
  },

  apiQuickBtnTxt: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
    textAlign: "center",
  },

  apiStatus: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },

  apiStatusSuccess: {
    color: "#166534",
  },

  apiStatusError: {
    color: "#B91C1C",
  },

  rulesBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GOLD_SOFT,
    backgroundColor: GOLD_FAINT,
  },

  rulesTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: TEXT,
    marginBottom: 8,
  },

  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 6,
  },

  ruleDot: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
  },

  ruleText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },

  ruleOk: { color: "#16A34A" },
  ruleBad: { color: "#EF4444" },
  ruleOkTxt: { color: "#166534" },
  ruleBadTxt: { color: "#B91C1C" },
});
