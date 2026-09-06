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

import styles from "../../styles/css/client/clientTrackingStyles";
import TrackingModal from "../modals/TrackingModal";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";
import { getTrackingStatusMeta } from "../../services/trackingStatus";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

const statusMeta = (status) => {
  const meta = getTrackingStatusMeta(status);

  if (meta.key === "inProgress") {
    return { pill: styles.pillBlue, text: styles.pillBlueText, label: meta.label };
  }

  if (meta.key === "completed") {
    return { pill: styles.pillGreen, text: styles.pillGreenText, label: meta.label };
  }

  if (meta.key === "arrived") {
    return { pill: styles.pillYellow, text: styles.pillYellowText, label: meta.label };
  }

  if (meta.key === "scheduled" || meta.key === "confirmed") {
    return { pill: styles.pillOrange, text: styles.pillOrangeText, label: meta.label };
  }

  return { pill: styles.pillGray, text: styles.pillGrayText, label: meta.label };
};

export default function ClientTracking() {
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
      const vehicleStr = `${booking.vehicle || ""} ${booking.vehicleType || ""} ${booking.vehicleModel || ""} ${booking.car || ""} ${booking.plateNumber || ""} ${booking.plate || ""}`.trim();
      const matchesQuery =
        !q || `${booking.id} ${booking.customer} ${booking.service} ${booking.status} ${vehicleStr}`.toLowerCase().includes(q);
      const matchesService = filters.service === "All" || String(booking.service || "").trim() === filters.service;
      const matchesStatus = filters.status === "All" || String(booking.status || "").trim() === filters.status;
      return matchesQuery && matchesService && matchesStatus;
    });
  }, [scopedBookings, query, filters]);

  const pageSize = 5;
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
            <Text style={styles.h1}>Service Tracking</Text>
            <Text style={styles.h2}>Monitor job progress per vehicle.</Text>
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

          {Boolean(query.trim()) && filtered.length === 0 && (
            <View style={{ marginTop: -4, marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>
                No records match "{query.trim()}". Please check your vehicle or booking details.
              </Text>
            </View>
          )}

          <View style={styles.tableCard}>
            <View style={styles.tHead}>
              <Text style={[styles.th, styles.thId]}>Booking ID</Text>
              <Text style={[styles.th, styles.thSvc]}>Service</Text>
              <Text style={[styles.th, styles.thStatus]}>Status</Text>
              <Text style={[styles.th, styles.thAct]}>Action</Text>
            </View>

            {pageRows.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyTxt}>
                  {query.trim()
                    ? `No records match "${query.trim()}". Check spelling or search by vehicle, booking ID, or service.`
                    : "No records found."}
                </Text>
              </View>
            ) : (
              pageRows.map((booking) => {
                const meta = statusMeta(booking.status);
                return (
                  <View key={booking.id} style={styles.tRow}>
                    <Text style={[styles.td, styles.tdId]}>{booking.id}</Text>
                    <Text style={[styles.td, styles.tdSvc]}>{booking.service}</Text>
                    <View style={[styles.pill, meta.pill]}>
                      <Text style={[styles.pillText, meta.text]}>{meta.label}</Text>
                    </View>
                    <View style={styles.tdAct}>
                      <TouchableOpacity activeOpacity={0.9} style={styles.viewBtn} onPress={() => {
                        setSelected({
                          ...booking,
                          vehicleModel: booking.vehicle,
                          assignedTo: booking.assigned || "-",
                        });
                        setModalOpen(true);
                      }}>
                        <Text style={styles.viewBtnTxt}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {filtered.length > pageSize && (
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
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        <TrackingModal visible={modalOpen} booking={selected} onClose={() => setModalOpen(false)} />
        <MobileFilterModal
          open={filterOpen}
          title="Filter Tracking"
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
