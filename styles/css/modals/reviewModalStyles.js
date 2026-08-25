import { StyleSheet, Platform } from "react-native";

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
    backgroundColor: "#FFF",
    borderRadius: 46,
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#111827",

    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.35 : 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "950",
    color: "#111827",
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
    marginBottom: 6,
  },

  label2: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
    marginBottom: 8,
  },

  inputWrap: {
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  inputWrapErr: { borderColor: "#EF4444" },

  input: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    height: 40,
  },

  errTxt: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "900",
    color: "#EF4444",
  },

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },

  starBtn: { paddingVertical: 2 },
  star: {
    fontSize: 40,
    fontWeight: "900",
    color: "#9CA3AF",
    lineHeight: 40,
  },
  starFilled: { color: "#6B7280" },

  textAreaWrap: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },

  textArea: {
    minHeight: 96,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  actions: {
    marginTop: 16,
    alignItems: "flex-end",
  },

  submitBtn: {
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

  submitBtnDisabled: { opacity: 0.55 },

  submitTxt: {
    fontSize: 16,
    fontWeight: "950",
    color: "#111827",
  },
});
