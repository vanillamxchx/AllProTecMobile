import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf";
import { getStaffRoleLabel, normalizeStaffRole } from "../../services/staffRoles";
import styles from "../../styles/css/staff/staffMyWorkStyles.js";

const STATUS_OPTIONS = ["Pending", "Scheduled", "In Progress", "Completed", "Cancelled"];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function includesText(value, query) {
  return normalize(value).includes(normalize(query));
}

function getVehicleLabel(booking) {
  const vehicle = String(booking?.vehicle || "").trim() || "-";
  const plate = String(booking?.plate || "").trim() || "-";
  return `${vehicle} / ${plate}`;
}

function getIssueNotesStatus(booking) {
  return booking?.issueNote || booking?.issueTypes?.length || booking?.issueMarkers?.length
    ? "Saved"
    : "Needed";
}

function getWarrantyStatus(booking) {
  if (booking?.warrantyReleased) return "Released";
  if (
    booking?.warrantyChecklist ||
    booking?.warrantyChecklistItems?.some((item) => item.done || item.notes)
  ) {
    return "Drafted";
  }
  return "Pending";
}

function getCommissionForBooking(commissions, bookingId) {
  return (
    commissions.find((commission) => String(commission.bookingId || "") === String(bookingId || "")) ||
    {}
  );
}

function getCommissionStatus(commissions, bookingId) {
  return getCommissionForBooking(commissions, bookingId).status || "Pending";
}

function getPersonNames(user = {}) {
  return [user.name, user.email].map((value) => normalize(value)).filter(Boolean);
}

function getAssignedName(booking) {
  return normalize(
    booking?.assigned || booking?.assignedTo || booking?.assignedStaff || booking?.assignedDetailer
  );
}

function isAssignedToUser(booking, user = {}) {
  const assignedName = getAssignedName(booking);
  return Boolean(assignedName && getPersonNames(user).includes(assignedName));
}

function getDetailerNamesByRole(users, role) {
  return new Set(
    users
      .filter((user) => normalize(user.role) === normalize(role))
      .flatMap((user) => getPersonNames(user))
      .filter(Boolean)
  );
}

function filterBookings(bookings, filters, commissions) {
  return bookings.filter((booking) => {
    const commissionStatus = getCommissionStatus(commissions, booking.id);
    const isCompleted = normalize(booking.status) === "completed";
    const haystack = [
      booking.id,
      booking.customer,
      booking.service,
      booking.vehicle,
      booking.plate,
      booking.assigned,
    ].join(" ");

    return (
      (!filters.query || includesText(haystack, filters.query)) &&
      (!filters.status || booking.status === filters.status) &&
      (!filters.assigned || normalize(booking.assigned) === normalize(filters.assigned)) &&
      (!filters.commissionStatus ||
        normalize(commissionStatus) === normalize(filters.commissionStatus)) &&
      (!filters.completedOnly || isCompleted) &&
      (!filters.dateFrom || String(booking.date || "") >= filters.dateFrom) &&
      (!filters.dateTo || String(booking.date || "") <= filters.dateTo)
    );
  });
}

function createFilters() {
  return {
    query: "",
    status: "",
    assigned: "",
    commissionStatus: "",
    completedOnly: false,
    dateFrom: "",
    dateTo: "",
  };
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "-"}</Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function WorkList({ rows, commissions, emptyMessage, showAssigned = false }) {
  if (!rows.length) {
    return <Text style={styles.emptyText}>{emptyMessage}</Text>;
  }

  return rows.map((booking) => {
    const commissionStatus = getCommissionStatus(commissions, booking.id);
    return (
      <View key={booking.id} style={styles.workCard}>
        <Text style={styles.workTitle}>{booking.customer || "Customer"}</Text>
        <Text style={styles.workMeta}>
          {booking.id || "-"} | {booking.service || "-"}
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{booking.status || "-"}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Issue Notes: {getIssueNotesStatus(booking)}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Warranty: {getWarrantyStatus(booking)}</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <DetailRow label="Vehicle / Plate" value={getVehicleLabel(booking)} />
          {showAssigned ? <DetailRow label="Assigned Detailer" value={booking.assigned || "-"} /> : null}
          <DetailRow label="Date" value={booking.date || "-"} />
          <DetailRow label="Commission" value={commissionStatus} />
        </View>
      </View>
    );
  });
}

export default function StaffMyWork({ session }) {
  const { bookings, commissions, users, currentUser } = useMobileData();
  const [personalFilters, setPersonalFilters] = useState(createFilters);
  const [juniorFilters, setJuniorFilters] = useState(createFilters);

  const effectiveUser = currentUser?.email ? currentUser : session;
  const role = normalizeStaffRole(effectiveUser?.role);
  const juniorDetailerNames = useMemo(
    () => getDetailerNamesByRole(users, "Junior Detailer"),
    [users]
  );
  const juniorDetailerDisplayNames = useMemo(
    () =>
      [...new Set(
        users
          .filter((user) => normalize(user.role) === "junior detailer")
          .map((user) => String(user.name || user.email || "").trim())
          .filter(Boolean)
      )],
    [users]
  );

  const personalBookings = useMemo(
    () => bookings.filter((booking) => isAssignedToUser(booking, effectiveUser)),
    [bookings, effectiveUser]
  );

  const juniorBookings = useMemo(
    () => bookings.filter((booking) => juniorDetailerNames.has(getAssignedName(booking))),
    [bookings, juniorDetailerNames]
  );

  const visiblePersonalBookings = useMemo(
    () => filterBookings(personalBookings, personalFilters, commissions),
    [commissions, personalBookings, personalFilters]
  );

  const visibleJuniorBookings = useMemo(
    () => filterBookings(juniorBookings, juniorFilters, commissions),
    [commissions, juniorBookings, juniorFilters]
  );

  const ownCommissions = useMemo(() => {
    const workerNames = new Set(getPersonNames(effectiveUser));
    return commissions.filter((commission) => workerNames.has(normalize(commission.worker)));
  }, [commissions, effectiveUser]);

  const updatePersonalFilter = (key, value) => {
    setPersonalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateJuniorFilter = (key, value) => {
    setJuniorFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportPdf = () =>
    exportTabularPdf({
      title: "My Work Report",
      subtitle: "Assigned bookings, service tracking tasks, warranty tasks, and commission history.",
      sections: [
        {
          title: "Assigned Work",
          columns: [
            "Booking ID",
            "Customer",
            "Service",
            "Vehicle / Plate",
            "Date",
            "Status",
            "Issue Notes",
            "Warranty",
            "Commission",
          ],
          rows: visiblePersonalBookings.map((booking) => [
            booking.id,
            booking.customer,
            booking.service,
            getVehicleLabel(booking),
            booking.date || "-",
            booking.status || "-",
            getIssueNotesStatus(booking),
            getWarrantyStatus(booking),
            getCommissionStatus(commissions, booking.id),
          ]),
          emptyMessage: "No assigned work matched the filters.",
        },
        ...(role === "senior detailer"
          ? [
              {
                title: "Junior Detailer Work View",
                columns: [
                  "Booking ID",
                  "Customer",
                  "Service",
                  "Vehicle / Plate",
                  "Assigned Detailer",
                  "Date",
                  "Status",
                  "Issue Notes",
                  "Warranty",
                  "Commission",
                ],
                rows: visibleJuniorBookings.map((booking) => [
                  booking.id,
                  booking.customer,
                  booking.service,
                  getVehicleLabel(booking),
                  booking.assigned || "-",
                  booking.date || "-",
                  booking.status || "-",
                  getIssueNotesStatus(booking),
                  getWarrantyStatus(booking),
                  getCommissionStatus(commissions, booking.id),
                ]),
                emptyMessage: "No junior detailer work matched the filters.",
              },
            ]
          : []),
        {
          title: "Commission Audit",
          columns: ["Commission ID", "Booking ID", "Service", "Rate", "Amount", "Status", "Date Paid"],
          rows: ownCommissions.map((commission) => [
            commission.id,
            commission.bookingId,
            commission.service,
            `${commission.rate || 0}%`,
            `P${Number(commission.earned || 0).toLocaleString("en-PH")}`,
            commission.status || "Pending",
            commission.datePaid || "-",
          ]),
          emptyMessage: "No commission records yet.",
        },
      ],
    });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Detailer Dashboard</Text>
          <Text style={styles.heroTitle}>My Work</Text>
          <Text style={styles.heroSub}>
            Review assigned bookings, tracking tasks, warranty progress, and commission status.
          </Text>
          <TouchableOpacity activeOpacity={0.9} onPress={exportPdf} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Assigned Work</Text>
          <Text style={styles.panelSub}>
            Your assigned booking and service tracking queue.
          </Text>
          <TextInput
            value={personalFilters.query}
            onChangeText={(value) => updatePersonalFilter("query", value)}
            placeholder="Search booking ID, customer, service..."
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
          <View style={styles.chipRow}>
            <FilterChip
              label={personalFilters.completedOnly ? "Completed only" : "All progress"}
              active={personalFilters.completedOnly}
              onPress={() =>
                updatePersonalFilter("completedOnly", !personalFilters.completedOnly)
              }
            />
            {["All", ...STATUS_OPTIONS].map((status) => (
              <FilterChip
                key={status}
                label={status}
                active={(status === "All" ? "" : status) === personalFilters.status}
                onPress={() => updatePersonalFilter("status", status === "All" ? "" : status)}
              />
            ))}
          </View>
          <View style={styles.chipRow}>
            {["All commissions", "Pending", "Earned", "Paid", "Cancelled", "Voided"].map((status) => (
              <FilterChip
                key={status}
                label={status}
                active={(status === "All commissions" ? "" : status) === personalFilters.commissionStatus}
                onPress={() =>
                  updatePersonalFilter(
                    "commissionStatus",
                    status === "All commissions" ? "" : status
                  )
                }
              />
            ))}
          </View>
          <WorkList
            rows={visiblePersonalBookings}
            commissions={commissions}
            emptyMessage="No assigned work found."
          />
        </View>

        {role === "senior detailer" ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Junior Detailer Work View</Text>
            <Text style={styles.panelSub}>
              Supervise all bookings currently assigned to Junior Detailers.
            </Text>
            <TextInput
              value={juniorFilters.query}
              onChangeText={(value) => updateJuniorFilter("query", value)}
              placeholder="Search junior detailer work..."
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
            <View style={styles.chipRow}>
              {["All", ...juniorDetailerDisplayNames].map((name) => (
                <FilterChip
                  key={name}
                  label={name}
                  active={(name === "All" ? "" : name) === juniorFilters.assigned}
                  onPress={() => updateJuniorFilter("assigned", name === "All" ? "" : name)}
                />
              ))}
            </View>
            <View style={styles.chipRow}>
              {["All", ...STATUS_OPTIONS].map((status) => (
                <FilterChip
                  key={status}
                  label={status}
                  active={(status === "All" ? "" : status) === juniorFilters.status}
                  onPress={() => updateJuniorFilter("status", status === "All" ? "" : status)}
                />
              ))}
            </View>
            <WorkList
              rows={visibleJuniorBookings}
              commissions={commissions}
              emptyMessage="No junior detailer work found."
              showAssigned
            />
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Commission Audit</Text>
          <Text style={styles.panelSub}>
            Your own commission history and payout status.
          </Text>
          {ownCommissions.length ? (
            ownCommissions.map((commission) => (
              <View key={commission.id} style={styles.commissionCard}>
                <Text style={styles.commissionTitle}>
                  {commission.service || "Service"} | {commission.status || "Pending"}
                </Text>
                <Text style={styles.commissionMeta}>
                  {commission.id || "-"} | Booking {commission.bookingId || "-"}
                </Text>
                <Text style={styles.commissionMeta}>
                  {commission.rate || 0}% | P
                  {Number(commission.earned || 0).toLocaleString("en-PH")} | Paid:{" "}
                  {commission.datePaid || "-"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No commission records yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
