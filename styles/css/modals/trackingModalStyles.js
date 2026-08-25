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
    paddingVertical: 26,
    paddingHorizontal: 26,
    borderWidth: 2,
    borderColor: "#111827",

    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.35 : 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "950",
    color: "#111827",
    marginBottom: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  label: {
    width: 165,
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
  },

  value: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  /* ✅ STATUS BADGE (names that your TrackingModal uses) */
  statusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "950",
    color: "#111827",
  },

  statusProgress: { backgroundColor: "#DBEAFE" },  // blue
  statusCompleted: { backgroundColor: "#DCFCE7" }, // green
  statusArrived: { backgroundColor: "#FEF3C7" },   // yellow
  statusBooked: { backgroundColor: "#FED7AA" },    // orange
  statusDefault: { backgroundColor: "#E5E7EB" },   // gray

  actions: {
    marginTop: 18,
    alignItems: "flex-end",
  },

  closeBtn: {
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

  closeTxt: {
    fontSize: 16,
    fontWeight: "950",
    color: "#111827",
  },
});
