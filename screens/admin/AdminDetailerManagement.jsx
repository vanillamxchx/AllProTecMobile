import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf";
import { ACTION_KEYS, canPerformAction, isAdmin } from "../../services/rbac";
import { getStaffRoleLabel, isDetailerRole, normalizeStaffRole } from "../../services/staffRoles";
import styles from "../../styles/css/admin/adminDetailerManagementStyles.js";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function matches(value, query) {
  return String(value || "").toLowerCase().includes(String(query || "").trim().toLowerCase());
}

function getPaymentForBooking(payments, bookingId) {
  return payments.find((payment) => String(payment.bookingId || "") === String(bookingId || "")) || {};
}

function getCommissionForBooking(commissions, bookingId) {
  return commissions.find((commission) => String(commission.bookingId || "") === String(bookingId || "")) || {};
}

function isActiveStaff(user) {
  const status = String(user?.status || "active").trim().toLowerCase();
  return user?.isActive !== false && !["inactive", "disabled", "deactivated"].includes(status);
}

function isTerminalCommissionStatus(status) {
  return ["paid", "voided", "cancelled"].includes(String(status || "").trim().toLowerCase());
}

function formatCurrency(value) {
  return `P ${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

const EMPTY_ACTION_FORM = {
  assigned: "",
  specialPin: "",
  remarks: "",
  reason: "",
};

export default function AdminDetailerManagement() {
  const {
    bookings,
    payments,
    commissions,
    users,
    currentUser,
    updateCommission,
    reassignDetailer,
  } = useMobileData();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [commissionFilter, setCommissionFilter] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [actionForm, setActionForm] = useState(EMPTY_ACTION_FORM);
  const [actionError, setActionError] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const canReassign =
    canPerformAction(currentUser, ACTION_KEYS.detailerReassign) ||
    canPerformAction(currentUser, ACTION_KEYS.bookingReassignDetailer);
  const canManageDetailerCommission =
    canPerformAction(currentUser, ACTION_KEYS.commissionMarkPaid) &&
    canPerformAction(currentUser, ACTION_KEYS.commissionVoid);
  const credentialLabel = isAdmin(currentUser) ? "Admin Special PIN" : "Staff Special PIN";

  const activeDetailerOptions = useMemo(
    () =>
      users.filter(
        (user) => isActiveStaff(user) && isDetailerRole(user.role) && (user.name || user.email)
      ),
    [users]
  );

  const detailerByName = useMemo(() => {
    const map = new Map();
    activeDetailerOptions.forEach((user) => {
      map.set(String(user.name || user.email || "").trim().toLowerCase(), user);
    });
    return map;
  }, [activeDetailerOptions]);

  const filterFields = useMemo(
    () => [
      {
        key: "role",
        label: "DETAILER ROLE",
        defaultValue: "All",
        options: ["Junior Detailer", "Senior Detailer"],
      },
      {
        key: "status",
        label: "BOOKING STATUS",
        defaultValue: "All",
        options: ["Pending", "Scheduled", "In Progress", "Completed", "Cancelled"],
      },
      {
        key: "commission",
        label: "COMMISSION",
        defaultValue: "All",
        options: ["Pending", "Earned", "Paid", "Cancelled", "Voided"],
      },
    ],
    []
  );

  const rows = useMemo(() => {
    return bookings
      .filter((booking) => String(booking.assigned || "").trim())
      .map((booking) => {
        const detailer =
          detailerByName.get(String(booking.assigned || "").trim().toLowerCase()) || {};
        const payment = getPaymentForBooking(payments, booking.id);
        const commission = getCommissionForBooking(commissions, booking.id);
        return { booking, detailer, payment, commission };
      })
      .filter(({ booking, detailer, commission }) => {
        const haystack = [
          booking.id,
          booking.customer,
          booking.plate,
          booking.service,
          booking.assigned,
          booking.status,
        ].join(" ");
        const detailerRole = getStaffRoleLabel(detailer.role || commission.role || "");
        const commissionStatus = commission.status || "Pending";

        return (
          (!query || matches(haystack, query)) &&
          (!roleFilter || normalizeStaffRole(detailerRole) === normalizeStaffRole(roleFilter)) &&
          (!statusFilter || booking.status === statusFilter) &&
          (!commissionFilter || commissionStatus === commissionFilter)
        );
      });
  }, [bookings, commissions, detailerByName, payments, query, roleFilter, statusFilter, commissionFilter]);

  const summary = useMemo(() => {
    const paidCount = rows.filter(({ commission }) => String(commission.status || "").trim() === "Paid").length;
    const pendingCount = rows.filter(({ commission }) => !String(commission.status || "").trim() || String(commission.status || "").trim() === "Pending").length;
    return {
      total: rows.length,
      paidCount,
      pendingCount,
    };
  }, [rows]);

  const hasActiveFilters = Boolean(roleFilter || statusFilter || commissionFilter);
  const pageSize = 2;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, safePage]);

  const exportPdf = () =>
    exportTabularPdf({
      title: "Detailer Management Report",
      subtitle: "Assigned bookings, workload, payment status, and commission supervision.",
      sections: [
        {
          title: "Assigned Work",
          columns: [
            "Booking ID",
            "Customer",
            "Service",
            "Vehicle / Plate",
            "Detailer",
            "Role",
            "Date",
            "Status",
            "Payment",
            "Commission",
          ],
          rows: rows.map(({ booking, detailer, payment, commission }) => [
            booking.id,
            booking.customer,
            booking.service,
            `${booking.vehicle || "-"} / ${booking.plate || "-"}`,
            booking.assigned || "-",
            getStaffRoleLabel(detailer.role || commission.role || "-"),
            booking.date || "-",
            booking.status || "-",
            payment.finalPaymentStatus || payment.status || "-",
            commission.status || "Pending",
          ]),
          emptyMessage: "No assigned detailer work matched the filters.",
        },
      ],
    });

  const resetActionModal = () => {
    setActionModal(null);
    setActionForm(EMPTY_ACTION_FORM);
    setActionError("");
    setIsSubmittingAction(false);
  };

  const openActionModal = (type, row) => {
    setActionModal({ type, ...row });
    setActionForm({
      ...EMPTY_ACTION_FORM,
      assigned: type === "reassign" ? row.booking.assigned || "" : "",
    });
    setActionError("");
  };

  const submitAction = async () => {
    if (!actionModal || isSubmittingAction) return;

    const specialPin = String(actionForm.specialPin || "").trim();
    if (!specialPin) {
      setActionError(`${credentialLabel} is required.`);
      return;
    }

    try {
      setActionError("");
      setIsSubmittingAction(true);

      if (actionModal.type === "reassign") {
        const assigned = String(actionForm.assigned || "").trim();
        if (!assigned) {
          setActionError("Please choose a new assigned detailer.");
          setIsSubmittingAction(false);
          return;
        }
        await reassignDetailer(actionModal.booking.id, {
          assigned,
          specialPin,
          reason: actionForm.remarks,
        });
      }

      if (actionModal.type === "paid") {
        await updateCommission(actionModal.commission.id, {
          status: "Paid",
          specialPin,
          remarks: actionForm.remarks,
        });
      }

      if (actionModal.type === "void") {
        const reason = String(actionForm.reason || "").trim();
        if (!reason) {
          setActionError("Void reason is required.");
          setIsSubmittingAction(false);
          return;
        }
        await updateCommission(actionModal.commission.id, {
          status: "Voided",
          specialPin,
          reason,
        });
      }

      resetActionModal();
    } catch (error) {
      setActionError(error.message || "Unable to complete this action.");
      setIsSubmittingAction(false);
    }
  };

  const renderActionModal = () => {
    if (!actionModal) return null;

    const { booking, detailer, payment, commission, type } = actionModal;
    const isReassign = type === "reassign";
    const isVoid = type === "void";

    return (
      <Modal transparent animationType="fade" visible onRequestClose={resetActionModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>
                {isReassign
                  ? "Reassign Detailer"
                  : isVoid
                    ? "Void Commission"
                    : "Mark Commission Paid"}
              </Text>
              <Text style={styles.modalSub}>
                {isReassign
                  ? "Override the assigned detailer for this booking."
                  : `Use the ${credentialLabel} to confirm this commission action.`}
              </Text>

              <DetailRow label="Booking ID" value={booking.id} />
              <DetailRow label="Customer" value={booking.customer} />
              <DetailRow label="Service" value={booking.service || commission.service} />
              <DetailRow label="Vehicle / Plate" value={`${booking.vehicle || "-"} / ${booking.plate || "-"}`} />
              <DetailRow label="Current Detailer" value={booking.assigned || commission.worker || "-"} />
              <DetailRow label="Detailer Role" value={getStaffRoleLabel(detailer.role || commission.role || "-")} />
              {!isReassign ? <DetailRow label="Commission Amount" value={formatCurrency(commission.earned)} /> : null}
              {!isReassign ? <DetailRow label="Commission Status" value={commission.status || "Pending"} /> : null}
              {payment?.id ? <DetailRow label="Payment Status" value={payment.finalPaymentStatus || payment.status || "-"} /> : null}

              {isReassign ? (
                <>
                  <Text style={styles.panelSub}>Choose a new assigned detailer.</Text>
                  <View style={styles.chipRow}>
                    {activeDetailerOptions.map((user) => {
                      const value = user.name || user.email || "";
                      const active = actionForm.assigned === value;
                      return (
                        <FilterChip
                          key={user.id || user.email || value}
                          label={`${value} (${getStaffRoleLabel(user.role)})`}
                          active={active}
                          onPress={() => setActionForm((prev) => ({ ...prev, assigned: value }))}
                        />
                      );
                    })}
                  </View>
                </>
              ) : null}

              {isVoid ? (
                <TextInput
                  value={actionForm.reason}
                  onChangeText={(value) => setActionForm((prev) => ({ ...prev, reason: value }))}
                  placeholder="Required reason"
                  placeholderTextColor="#9ca3af"
                  multiline
                  style={styles.input}
                />
              ) : (
                <TextInput
                  value={actionForm.remarks}
                  onChangeText={(value) => setActionForm((prev) => ({ ...prev, remarks: value }))}
                  placeholder="Optional remarks"
                  placeholderTextColor="#9ca3af"
                  multiline
                  style={styles.input}
                />
              )}

              <TextInput
                value={actionForm.specialPin}
                onChangeText={(value) => setActionForm((prev) => ({ ...prev, specialPin: value }))}
                placeholder={credentialLabel}
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
              />

              {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={resetActionModal}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={submitAction}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSubmittingAction ? "Saving..." : "Confirm"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Operations</Text>
          <Text style={styles.heroTitle}>Detailer Management</Text>
              <Text style={styles.heroSub}>
            Supervise assigned Junior and Senior Detailer bookings, workload, and commission status.
          </Text>
          <TouchableOpacity activeOpacity={0.9} onPress={exportPdf} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Assigned Jobs</Text>
            <Text style={styles.statValue}>{summary.total}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Commissions</Text>
            <Text style={styles.statValue}>{summary.pendingCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Paid Commissions</Text>
            <Text style={styles.statValue}>{summary.paidCount}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Assigned Work</Text>
          <Text style={styles.panelSub}>Search assigned work and focus on the detailers or commission state you need.</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Image source={ICON_SEARCH} style={styles.searchIcon} resizeMode="contain" />
              <TextInput
                value={query}
                onChangeText={(value) => {
                  setQuery(value);
                  setPage(1);
                }}
                placeholder="Search booking, customer, plate, service, detailer..."
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
              onPress={() => setFilterModalOpen(true)}
            >
              <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <Text style={styles.resultsText}>
            {rows.length} record{rows.length === 1 ? "" : "s"} shown
          </Text>
          {hasActiveFilters ? (
            <View style={styles.activeFiltersRow}>
              {roleFilter ? <FilterChip label={`Role: ${roleFilter}`} active onPress={() => setRoleFilter("")} /> : null}
              {statusFilter ? <FilterChip label={`Status: ${statusFilter}`} active onPress={() => setStatusFilter("")} /> : null}
              {commissionFilter ? (
                <FilterChip label={`Commission: ${commissionFilter}`} active onPress={() => setCommissionFilter("")} />
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Work List</Text>
          <Text style={styles.panelSub}>Current assigned detailer workload and commission state.</Text>
          {pagedRows.length ? (
            pagedRows.map((row) => {
              const { booking, detailer, payment, commission } = row;
              const commissionLocked = isTerminalCommissionStatus(commission.status);
              return (
                <View key={booking.id} style={styles.recordCard}>
                  <View style={styles.recordTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordTitle}>{booking.customer || "Customer"}</Text>
                      <Text style={styles.recordMeta}>
                        {booking.id || "-"} | {booking.service || "-"}
                      </Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{booking.status || "-"}</Text>
                    </View>
                  </View>

                  <View style={styles.detailGrid}>
                    <DetailRow label="Vehicle / Plate" value={`${booking.vehicle || "-"} / ${booking.plate || "-"}`} />
                    <DetailRow label="Assigned Detailer" value={booking.assigned || "-"} />
                    <DetailRow label="Role" value={getStaffRoleLabel(detailer.role || commission.role || "-")} />
                    <DetailRow label="Payment" value={payment.finalPaymentStatus || payment.status || "-"} />
                    <DetailRow label="Commission" value={commission.status || "Pending"} />
                    <DetailRow label="Commission Amount" value={formatCurrency(commission.earned)} />
                  </View>

                  <View style={styles.actionRow}>
                    {canReassign ? (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => openActionModal("reassign", row)}
                        style={styles.actionButton}
                      >
                        <Text style={styles.actionButtonText}>Reassign</Text>
                      </TouchableOpacity>
                    ) : null}
                    {canManageDetailerCommission && commission.id && !commissionLocked ? (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => openActionModal("paid", row)}
                        style={[styles.actionButton, styles.actionButtonAlt]}
                      >
                        <Text style={styles.actionButtonText}>Mark Paid</Text>
                      </TouchableOpacity>
                    ) : null}
                    {canManageDetailerCommission && commission.id && !commissionLocked ? (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => openActionModal("void", row)}
                        style={[styles.actionButton, styles.actionButtonWarn]}
                      >
                        <Text style={styles.actionButtonText}>Void</Text>
                      </TouchableOpacity>
                    ) : null}
                    {commissionLocked ? (
                      <View style={[styles.actionButton, styles.actionButtonDisabled]}>
                        <Text style={styles.actionButtonText}>Locked</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No assigned detailer work found.</Text>
          )}

          <View style={styles.pager}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={safePage === 1}
              style={[styles.pageBtn, safePage === 1 && styles.pageBtnDisabled]}
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <Text style={styles.pageTxt}>{"<"}</Text>
            </TouchableOpacity>
            <View style={styles.pageNum}>
              <Text style={styles.pageNumTxt}>{safePage}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={safePage === totalPages}
              style={[styles.pageBtn, safePage === totalPages && styles.pageBtnDisabled]}
              onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <Text style={styles.pageTxt}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <MobileFilterModal
        open={filterModalOpen}
        title="Filter Detailer Work"
        fields={filterFields}
        values={{
          role: roleFilter || "All",
          status: statusFilter || "All",
          commission: commissionFilter || "All",
        }}
        onApply={(nextValues) => {
          setRoleFilter(nextValues?.role === "All" ? "" : nextValues?.role || "");
          setStatusFilter(nextValues?.status === "All" ? "" : nextValues?.status || "");
          setCommissionFilter(nextValues?.commission === "All" ? "" : nextValues?.commission || "");
          setPage(1);
          setFilterModalOpen(false);
        }}
        onClose={() => setFilterModalOpen(false)}
      />
      {renderActionModal()}
    </View>
  );
}
