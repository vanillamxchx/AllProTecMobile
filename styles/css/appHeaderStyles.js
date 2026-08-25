import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    zIndex: 10,
    position: "relative", // ✅ important for stacking context (web)
  },

  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },

  logo: {
    width: 34,
    height: 34,
  },

  brand: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 0.3,
  },

  portal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 2,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  bellIcon: {
    width: 24,
    height: 24,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E7C55B",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  /* =========================
     DROPDOWN MENU
  ========================== */

  menuRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    position: "absolute", // ✅ forces overlay above everything
  },

  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  menuCard: {
    position: "absolute",
    top: 62,
    right: 12,
    width: 160,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  menuText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  menuTextDanger: {
    color: "#DC2626",
  },
});
