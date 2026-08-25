import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import styles from "../../styles/css/admin/adminBookingStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr || "");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminBookings({ onOpenDetails }) {
  const { bookings } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAssignedTo, setSelectedAssignedTo] = useState("All");

  const serviceOptions = useMemo(() => {
    const values = Array.from(
      new Set(bookings.map((booking) => String(booking.service || "").trim()).filter(Boolean))
    );
    return ["All", ...values];
  }, [bookings]);

  const statusOptions = useMemo(() => {
    const values = Array.from(
      new Set(bookings.map((booking) => String(booking.status || "").trim()).filter(Boolean))
    );
    return ["All", ...values];
  }, [bookings]);

  const assignedOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        bookings
          .map((booking) => String(booking.assigned || "").trim())
          .filter(Boolean)
      )
    );
    return ["All", ...values];
  }, [bookings]);

  const openFilters = () => {
    setFilterModalOpen(true);
  };

  const closeFilters = () => setFilterModalOpen(false);

  const applyFilters = (nextValues) => {
    setSelectedService(nextValues?.service ?? "All");
    setSelectedStatus(nextValues?.status ?? "All");
    setSelectedAssignedTo(nextValues?.assignedTo ?? "All");
    setPage(1);
    closeFilters();
  };

  const filterFields = useMemo(
    () => [
      {
        key: "service",
        label: "SERVICE",
        defaultValue: "All",
        options: serviceOptions,
      },
      {
        key: "status",
        label: "STATUS",
        defaultValue: "All",
        options: statusOptions,
      },
      {
        key: "assignedTo",
        label: "ASSIGNED TO",
        defaultValue: "All",
        options: assignedOptions,
      },
    ],
    [assignedOptions, serviceOptions, statusOptions]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesQuery =
        !q ||
        `${booking.id} ${booking.date} ${booking.customer} ${booking.vehicle} ${booking.plate} ${booking.service} ${booking.assigned} ${booking.status}`
          .toLowerCase()
          .includes(q);
      const matchesService =
        selectedService === "All" || String(booking.service || "").trim() === selectedService;
      const matchesStatus =
        selectedStatus === "All" || String(booking.status || "").trim() === selectedStatus;
      const matchesAssignedTo =
        selectedAssignedTo === "All" ||
        String(booking.assigned || "").trim() === selectedAssignedTo;

      return matchesQuery && matchesService && matchesStatus && matchesAssignedTo;
    });
  }, [bookings, query, selectedAssignedTo, selectedService, selectedStatus]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Bookings Report",
      subtitle: "Filtered booking records exported in tabular format.",
      sections: [
        {
          columns: ["Booking ID", "Booking Date", "Customer", "Vehicle", "Plate Number", "Service", "Assigned To", "Status"],
          rows: filtered.map((booking) => [
            booking.id || "-",
            booking.date || "-",
            booking.customer || "-",
            booking.vehicle || "-",
            booking.plate || "-",
            booking.service || "-",
            booking.assigned || "-",
            booking.status || "-",
          ]),
          emptyMessage: "No bookings found for the selected filters.",
        },
      ],
    });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Bookings</Text>
              <Text style={styles.h2}>View appointments and schedules.</Text>
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
                placeholder="Search Bookings..."
                placeholderTextColor="#9AA0A6"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.filterBtn,
                (selectedService !== "All" ||
                  selectedStatus !== "All" ||
                  selectedAssignedTo !== "All") &&
                  styles.filterBtnActive,
              ]}
              onPress={openFilters}
            >
              <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <Text style={styles.resultsTxt}>
            {filtered.length} booking{filtered.length === 1 ? "" : "s"} found
          </Text>

          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colId]}>Booking ID</Text>
              <Text style={[styles.th, styles.colDate]}>Booking Date</Text>
              <Text style={[styles.th, styles.colCustomer]}>Customer</Text>
              <Text style={[styles.th, styles.colAction]}>Action</Text>
            </View>

            {paged.length ? (
              paged.map((booking, idx) => (
                <View key={booking.id} style={[styles.tr, idx === paged.length - 1 && styles.trLast]}>
                  <Text style={[styles.td, styles.colId]}>{booking.id}</Text>
                  <Text style={[styles.td, styles.colDate]}>{booking.date}</Text>
                  <Text style={[styles.td, styles.colCustomer]}>{booking.customer}</Text>

                  <View style={[styles.colAction, styles.actionCell]}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.viewBtn}
                      onPress={() =>
                        onOpenDetails?.({
                          _id: booking._id,
                          id: booking.id,
                          date: formatDate(booking.date),
                          rawDate: booking.date,
                          customer: booking.customer,
                          customerEmail: booking.customerEmail,
                          vehicleModel: booking.vehicle,
                          carSize: booking.carSize,
                          plate: booking.plate,
                          service: booking.service,
                          promoId: booking.promoId,
                          assignedTo: booking.assigned || "-",
                          time: booking.time || "-",
                          placeSlot: booking.placeSlot,
                          status: booking.status,
                          amount: booking.amount,
                          originalAmount: booking.originalAmount,
                          issueNote: booking.issueNote,
                          issueTypes: booking.issueTypes,
                          issueMarkers: booking.issueMarkers,
                          serviceChecklist: booking.serviceChecklist,
                          warranty: booking.warranty,
                          eSignature: booking.eSignature,
                          termsAccepted: booking.termsAccepted,
                        })
                      }
                    >
                      <Text style={styles.viewTxt}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTxt}>No bookings match your search or filters.</Text>
              </View>
            )}
          </View>

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
        </ScrollView>

        <MobileFilterModal
          open={filterModalOpen}
          title="Filter Bookings"
          fields={filterFields}
          values={{
            service: selectedService,
            status: selectedStatus,
            assignedTo: selectedAssignedTo,
          }}
          onApply={applyFilters}
          onClose={closeFilters}
        />
      </View>
    </SafeAreaView>
  );
}
