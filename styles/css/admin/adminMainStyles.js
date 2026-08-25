import { StyleSheet } from "react-native";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F2" },

  stage: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    position: "relative", // ✅ IMPORTANT for absolute nav
  },

  content: {
    flex: 1, // ✅ fills space between header and nav
  },
});
