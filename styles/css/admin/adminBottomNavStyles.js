import { StyleSheet } from "react-native";

export default StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",

    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  btn: {
    flex: 1,
    height: 54,              // ✅ fixed height
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,          // ✅ keep border always
    borderColor: "transparent",
    backgroundColor: "transparent",
  },

  // ✅ active now ONLY changes colors (no padding changes)
  btnActive: {
    borderColor: "#D7B24A",
    backgroundColor: "#F6E7B6",
  },

  iconImg: { width: 22, height: 22 },
  iconImgInactive: { opacity: 0.65 },
  iconImgActive: { opacity: 1 },

  label: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
  },
  labelActive: {
    fontWeight: "950",
  },
});
