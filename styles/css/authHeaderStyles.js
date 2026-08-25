import { StyleSheet } from "react-native";

const TEXT = "#111827";
const SUB = "#6B7280";
const BORDER = "#E5E7EB";
const GOLD = "#D7B23A";

export default StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },

  textWrap: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 21,
    fontWeight: "900",
    color: TEXT,
    letterSpacing: 0.4,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: SUB,
  },

  accent: {
    width: 4,
    height: 32,
    borderRadius: 999,
    backgroundColor: GOLD,
  },
});
