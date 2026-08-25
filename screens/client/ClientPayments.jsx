import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";

import styles from "../../styles/css/client/clientPaymentsStyles";
import ClientPaymentModal from "../modals/ClientPaymentModal";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

const statusMeta = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("paid")) {
    return { pill: styles.pillGreen, text: styles.pillGreenText, label: "Paid" };
  }
  if (s.includes("verification")) {
    return { pill: styles.pillYellow, text: styles.pillYellowText, label: "For Verification" };
  }
  return { pill: styles.pillYellow, text: styles.pillYellowText, label: "Pending" };
};

export default function ClientPayments() {
  const { scopedPayments, submitPaymentProof } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "All", method: "All" });

  const statusOptions = useMemo(
    () => Array.from(new Set(scopedPayments.map((payment) => String(payment.status || "").trim()).filter(Boolean))),
    [scopedPayments]
  );
  const methodOptions = useMemo(
    () => Array.from(new Set(scopedPayments.map((payment) => String(payment.method || "").trim()).filter(Boolean))),
    [scopedPayments]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return scopedPayments.filter((payment) => {
      const matchesQuery =
        !q || `${payment.id} ${payment.bookingId} ${payment.service} ${payment.status}`.toLowerCase().includes(q);
      const matchesStatus = filters.status === "All" || String(payment.status || "").trim() === filters.status;
      const matchesMethod = filters.method === "All" || String(payment.method || "").trim() === filters.method;
      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [scopedPayments, query, filters]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const openDetails = (payment) => {
    setSelected({
      ...payment,
      id: payment.bookingId || payment.id,
    });
    setModalOpen(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.headBlock}>
            <Text style={styles.h1}>Payments</Text>
            <Text style={styles.h2}>Payments and billing records.</Text>
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
                placeholder="Search Payment..."
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
              <Text style={[styles.th, styles.thSvc]}>Service</Text>
              <Text style={[styles.th, styles.thStatus]}>Status</Text>
              <Text style={[styles.th, styles.thAct]}>Action</Text>
            </View>

            {pageRows.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyTxt}>No records found.</Text>
              </View>
            ) : (
              pageRows.map((payment) => {
                const meta = statusMeta(payment.status);
                return (
                  <View key={payment.id} style={styles.tRow}>
                    <Text style={[styles.td, styles.tdId]}>{payment.bookingId || payment.id}</Text>
                    <Text style={[styles.td, styles.tdSvc]}>{payment.service}</Text>
                    <View style={[styles.pill, meta.pill]}>
                      <Text style={[styles.pillText, meta.text]}>{meta.label}</Text>
                    </View>
                    <View style={styles.tdAct}>
                      <TouchableOpacity activeOpacity={0.9} style={styles.viewBtn} onPress={() => openDetails(payment)}>
                        <Text style={styles.viewBtnTxt}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
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

          <View style={{ height: 12 }} />
        </ScrollView>

        <ClientPaymentModal
          visible={modalOpen}
          payment={selected}
          onClose={() => setModalOpen(false)}
          onViewInvoice={(payment) => Alert.alert("Invoice", `Invoice preview for ${payment?.bookingId || payment?.id}`)}
          onUploadProof={async (payment) => {
            try {
              await submitPaymentProof(payment, {
                method: payment?.method || "GCash",
                reference: `MOBILE-${Date.now()}`,
                notes: "Uploaded from mobile app",
              });
              Alert.alert("Submitted", "Payment proof sent for verification.");
              setModalOpen(false);
            } catch (error) {
              Alert.alert("Upload failed", error.message || "Could not submit proof.");
            }
          }}
        />
        <MobileFilterModal
          open={filterOpen}
          title="Filter Payments"
          values={filters}
          fields={[
            { key: "status", label: "STATUS", options: statusOptions },
            { key: "method", label: "METHOD", options: methodOptions },
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
