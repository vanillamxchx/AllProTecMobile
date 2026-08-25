import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";

import styles from "../../styles/css/staff/staffBookingsStyles";
import BookingModal from "../modals/BookingModal";
import { useMobileData } from "../../context/MobileDataContext.jsx";
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

export default function StaffBookings() {
  const { scopedBookings } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ service: "All", status: "All" });

  const serviceOptions = useMemo(
    () => Array.from(new Set(scopedBookings.map((booking) => String(booking.service || "").trim()).filter(Boolean))),
    [scopedBookings]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(scopedBookings.map((booking) => String(booking.status || "").trim()).filter(Boolean))),
    [scopedBookings]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return scopedBookings.filter((booking) => {
      const matchesQuery = !q || `${booking.id} ${booking.customer} ${booking.date}`.toLowerCase().includes(q);
      const matchesService = filters.service === "All" || String(booking.service || "").trim() === filters.service;
      const matchesStatus = filters.status === "All" || String(booking.status || "").trim() === filters.status;
      return matchesQuery && matchesService && matchesStatus;
    });
  }, [scopedBookings, query, filters]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.headBlock}>
            <Text style={styles.h1}>Bookings</Text>
            <Text style={styles.h2}>View appointments and schedules.</Text>
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
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
              <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tHead}>
              <Text style={[styles.th, styles.thId]}>Booking ID</Text>
              <Text style={[styles.th, styles.thDate]}>Booking Date</Text>
              <Text style={[styles.th, styles.thCust]}>Customer</Text>
              <Text style={[styles.th, styles.thAct]}>Action</Text>
            </View>

            {pageRows.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyTxt}>No bookings found.</Text>
              </View>
            ) : (
              pageRows.map((booking) => (
                <View key={booking.id} style={styles.tRow}>
                  <Text style={[styles.td, styles.tdId]}>{booking.id}</Text>
                  <Text style={[styles.td, styles.tdDate]}>{formatDate(booking.date)}</Text>
                  <Text style={[styles.td, styles.tdCust]} numberOfLines={1}>{booking.customer}</Text>
                  <View style={styles.tdAct}>
                    <TouchableOpacity activeOpacity={0.9} style={styles.viewBtn} onPress={() => {
                      setSelected({
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
                        assignedTo: booking.assigned || "-",
                        time: booking.time || "-",
                        placeSlot: booking.placeSlot,
                        promoId: booking.promoId,
                        amount: booking.amount,
                        originalAmount: booking.originalAmount,
                        status: booking.status,
                        issueNote: booking.issueNote,
                        issueTypes: booking.issueTypes,
                        issueMarkers: booking.issueMarkers,
                        serviceChecklist: booking.serviceChecklist,
                        warranty: booking.warranty,
                        eSignature: booking.eSignature,
                        termsAccepted: booking.termsAccepted,
                      });
                      setModalOpen(true);
                    }}>
                      <Text style={styles.viewBtnTxt}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.pagerRow}>
            <TouchableOpacity activeOpacity={0.85} style={styles.pagerBtn} onPress={() => setPage((p) => Math.max(1, p - 1))}>
              <Text style={styles.pagerTxt}>{"<"}</Text>
            </TouchableOpacity>
            <View style={styles.pagePill}>
              <Text style={styles.pageTxt}>{safePage}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.pagerBtn} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <Text style={styles.pagerTxt}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <BookingModal visible={modalOpen} booking={selected} onClose={() => setModalOpen(false)} />
        <MobileFilterModal
          open={filterOpen}
          title="Filter Bookings"
          values={filters}
          fields={[
            { key: "service", label: "SERVICE", options: serviceOptions },
            { key: "status", label: "STATUS", options: statusOptions },
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
