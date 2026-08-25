export function getTrackingStatusMeta(status) {
  const raw = String(status || "").trim();
  const normalized = raw.toLowerCase();

  if (normalized.includes("progress")) {
    return { key: "inProgress", label: raw || "In Progress" };
  }

  if (normalized.includes("complete")) {
    return { key: "completed", label: raw || "Completed" };
  }

  if (normalized.includes("arriv")) {
    return { key: "arrived", label: raw || "Arrived" };
  }

  if (normalized.includes("confirm")) {
    return { key: "confirmed", label: raw || "Confirmed" };
  }

  if (
    normalized.includes("book") ||
    normalized.includes("pending") ||
    normalized.includes("schedule")
  ) {
    return { key: "scheduled", label: raw || "Pending" };
  }

  return { key: "default", label: raw || "Pending" };
}

export function getTrackingTimeline(record) {
  const meta = getTrackingStatusMeta(record?.status);
  const hasConfirmedSchedule = ["confirmed", "arrived", "inProgress", "completed"].includes(meta.key);

  return [
    { label: "Booking received", active: Boolean(record?.id) },
    { label: "Schedule confirmed", active: hasConfirmedSchedule },
    { label: "Work in progress", active: meta.key === "inProgress" || meta.key === "completed" },
    { label: "Ready for release", active: meta.key === "completed" },
  ];
}
