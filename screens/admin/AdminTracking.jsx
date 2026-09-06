import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";

import styles from "../../styles/css/admin/adminTrackingStyles.js";
import TrackingModal from "../modals/TrackingModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";
import { getTrackingStatusMeta } from "../../services/trackingStatus";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

export default function AdminTracking() {
  const { bookings } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "All", service: "All", assigned: "All" });

  const statusOptions = useMemo(
    () => Array.from(new Set(bookings.map((booking) => String(booking.status || "").trim()).filter(Boolean))),
    [bookings]
  );
  const serviceOptions = useMemo(
    () => Array.from(new Set(bookings.map((booking) => String(booking.service || "").trim()).filter(Boolean))),
    [bookings]
  );
  const assignedOptions = useMemo(
    () => Array.from(new Set(bookings.map((booking) => String(booking.assigned || "").trim()).filter(Boolean))),
    [bookings]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return bookings.filter((booking) => {
      const vehicleStr = `${booking.vehicle || ""} ${booking.vehicleType || ""} ${booking.vehicleModel || ""} ${booking.car || ""} ${booking.plateNumber || ""} ${booking.plate || ""}`.trim();
      const matchesQuery =
        !q ||
        `${booking.id || ""} ${booking.customer || ""} ${booking.status || ""} ${booking.service || ""} ${vehicleStr} ${booking.assigned || ""}`
          .toLowerCase()
          .includes(q);
      const matchesStatus = filters.status === "All" || String(booking.status || "").trim() === filters.status;
      const matchesService = filters.service === "All" || String(booking.service || "").trim() === filters.service;
      const matchesAssigned = filters.assigned === "All" || String(booking.assigned || "").trim() === filters.assigned;
      return matchesQuery && matchesStatus && matchesService && matchesAssigned;
    });
  }, [bookings, query, filters]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage]);

  const statusStyle = (status) => {
    const meta = getTrackingStatusMeta(status);
    if (meta.key === "inProgress") return styles.stInProgress;
    if (meta.key === "completed") return styles.stCompleted;
    if (meta.key === "arrived") return styles.stArrived;
    if (meta.key === "scheduled" || meta.key === "confirmed") return styles.stBooked;
    return styles.stDefault;
  };

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Service Tracking Report",
      subtitle: "Filtered booking tracking records exported in tabular format.",
      sections: [
        {
          columns: ["Booking ID", "Booking Date", "Customer", "Vehicle", "Service", "Status", "Assigned To"],
          rows: filtered.map((booking) => [
            booking.id || "-",
            booking.date || "-",
            booking.customer || "-",
            booking.vehicle || "-",
            booking.service || "-",
            booking.status || "-",
            booking.assigned || "-",
          ]),
          emptyMessage: "No tracking records found for the selected filters.",
        },
      ],
    });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Service Tracking</Text>
              <Text style={styles.h2}>Monitor job progress per vehicle.</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.exportBtn} onPress={exportPdf}>
              <Text style={styles.exportTxt}>Export PDF</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Image source={ICON_SEARCH} style={styles.searchIcon} resizeMode="contain" />
              <TextInput
                value={query}
                onChangeText={(value) => {
                  setQuery(value);
                  setPage(1);
                }}
                placeholder="Search Bookings or Vehicles..."
                placeholderTextColor="#9AA0A6"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
              <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {Boolean(query.trim()) && filtered.length === 0 && (
            <View style={{ marginTop: -4, marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>
                No records match "{query.trim()}". Please check your vehicle or booking details.
              </Text>
            </View>
          )}

          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colId]}>Booking ID</Text>
              <Text style={[styles.th, styles.colCustomer]}>Customer</Text>
              <Text style={[styles.th, styles.colStatus]}>Status</Text>
              <Text style={[styles.th, styles.colAction]}>Action</Text>
            </View>

            {paged.length === 0 ? (
              <View style={{ paddingVertical: 28, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827", textAlign: "center" }}>
                  {query.trim() ? "No matching tracking records" : "No records found"}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#6B7280", marginTop: 4, textAlign: "center" }}>
                  {query.trim()
                    ? `No records found matching vehicle or details for "${query.trim()}".`
                    : "No tracking records are available for the selected filters."}
                </Text>
              </View>
            ) : (
              paged.map((booking, idx) => (
                <View key={booking.id} style={[styles.tr, idx === paged.length - 1 && styles.trLast]}>
                  <Text style={[styles.td, styles.colId]}>{booking.id}</Text>
                  <Text style={[styles.td, styles.colCustomer]}>{booking.customer}</Text>

                  <View style={[styles.colStatus, styles.statusCell]}>
                    <View style={[styles.statusPill, statusStyle(booking.status)]}>
                      <Text style={styles.statusTxt}>{getTrackingStatusMeta(booking.status).label}</Text>
                    </View>
                  </View>

                  <View style={[styles.colAction, styles.actionCell]}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.viewBtn}
                      onPress={() => {
                        setSelected({
                          ...booking,
                          vehicleModel: booking.vehicle,
                          assignedTo: booking.assigned || "-",
                        });
                        setModalOpen(true);
                      }}
                    >
                      <Text style={styles.viewTxt}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {filtered.length > pageSize && (
            <View style={styles.pager}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.pageBtn}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.pageTxt}>{"<"}</Text>
              </TouchableOpacity>
              <View style={styles.pageNum}>
                <Text style={styles.pageNumTxt}>{safePage}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.pageBtn}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <Text style={styles.pageTxt}>{">"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <TrackingModal visible={modalOpen} booking={selected} onClose={() => setModalOpen(false)} />
        <MobileFilterModal
          open={filterOpen}
          title="Filter Tracking"
          values={filters}
          fields={[
            { key: "status", label: "STATUS", options: statusOptions },
            { key: "service", label: "SERVICE", options: serviceOptions },
            { key: "assigned", label: "ASSIGNED TO", options: assignedOptions },
          ]}
          onClose={() => setFilterOpen(false)}
          onApply={(nextValues) => {
            setFilters(nextValues);
            setPage(1);
            setFilterOpen(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
}
