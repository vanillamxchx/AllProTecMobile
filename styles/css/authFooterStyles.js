import { StyleSheet } from "react-native";

const TEXT = "#111827";
const SUB = "#6B7280";
const BORDER = "#E5E7EB";

export default StyleSheet.create({
  footerBar: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    fontWeight: "700",
    color: SUB,
  },

  footerBrand: {
    color: TEXT,
    fontWeight: "900",
  },
});
