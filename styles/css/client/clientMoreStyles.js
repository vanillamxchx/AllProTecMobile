import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 170, // keep space for bottom nav
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  tile: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",

    // same soft shadow as staff
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  icon: {
    width: 28,
    height: 28,
  },

  label: {
    fontSize: 15,
    fontWeight: "950",
    color: "#111827",
    textAlign: "center",
  },
});
