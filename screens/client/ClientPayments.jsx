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
import InvoiceModal from "../modals/InvoiceModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function getStageMeta(label) {
  const value = String(label || "").toLowerCase();
  if (value.includes("paid")) {
    return { pill: styles.pillGreen, text: styles.pillGreenText, label };
  }
  if (value.includes("verification")) {
    return { pill: styles.pillBlue, text: styles.pillBlueText, label };
  }
  if (value.includes("reject") || value.includes("cancel")) {
    return { pill: styles.pillRed, text: styles.pillRedText, label };
  }
  return { pill: styles.pillYellow, text: styles.pillYellowText, label };
}

function getCustomerProofAction(payment = {}, getPaymentStageLabel, normalizeStageStatus) {
  if (payment.autoCancelledForNoDownPaymentProof) {
    return { label: "Cancelled", disabled: true, mode: "" };
  }

  const legacyStatus = normalizeStageStatus(payment.status, "Pending");
  const downPaymentStatus = normalizeStageStatus(
    payment.downPaymentStatus,
    payment.downPaymentRequired === false ? "Not Required" : "Pending"
  );
  const finalPaymentStatus = normalizeStageStatus(payment.finalPaymentStatus, legacyStatus);

  if (finalPaymentStatus === "Paid" || legacyStatus === "Paid") {
    return { label: "Verified", disabled: true, mode: "", stage: getPaymentStageLabel(payment) };
  }
  if (finalPaymentStatus === "For Verification") {
    return { label: "Pending Review", disabled: true, mode: "", stage: getPaymentStageLabel(payment) };
  }
  if (payment.downPaymentRequired === true && ["Pending", "Rejected"].includes(downPaymentStatus)) {
    return { label: "Upload DP", disabled: false, mode: "downPayment", stage: getPaymentStageLabel(payment) };
  }
  if (payment.downPaymentRequired === true && downPaymentStatus === "For Verification") {
    return { label: "DP Review", disabled: true, mode: "", stage: getPaymentStageLabel(payment) };
  }
  if (
    payment.downPaymentRequired === false ||
    downPaymentStatus === "Not Required" ||
    downPaymentStatus === "Paid"
  ) {
    return { label: "Pay Balance", disabled: false, mode: "finalPayment", stage: getPaymentStageLabel(payment) };
  }

  return { label: "Upload DP", disabled: false, mode: "downPayment", stage: getPaymentStageLabel(payment) };
}

export default function ClientPayments() {
  const {
    scopedPayments,
    scopedRewards,
    submitPaymentProof,
    getPaymentStageLabel,
    normalizeStageStatus,
    getPaymentTotal,
    getAmountPaid,
    getRemainingBalance,
  } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceSelected, setInvoiceSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "All", method: "All" });

  const statusOptions = useMemo(
    () => Array.from(new Set(scopedPayments.map((payment) => getPaymentStageLabel(payment)).filter(Boolean))),
    [getPaymentStageLabel, scopedPayments]
  );
  const methodOptions = useMemo(
    () => Array.from(new Set(scopedPayments.flatMap((payment) => [
      String(payment.method || "").trim(),
      String(payment.downPaymentMethod || "").trim(),
      String(payment.finalPaymentMethod || "").trim(),
    ].filter(Boolean)))),
    [scopedPayments]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return scopedPayments.filter((payment) => {
      const stageLabel = getPaymentStageLabel(payment);
      const vehicleStr = `${payment.vehicle || ""} ${payment.vehicleType || ""} ${payment.vehicleModel || ""} ${payment.car || ""} ${payment.plateNumber || ""} ${payment.plate || ""}`.trim();
      const matchesQuery =
        !q || `${payment.id} ${payment.bookingId} ${payment.service} ${vehicleStr} ${payment.status} ${stageLabel} ${payment.method || ""} ${payment.downPaymentMethod || ""} ${payment.finalPaymentMethod || ""}`.toLowerCase().includes(q);
      const matchesStatus = filters.status === "All" || stageLabel === filters.status || String(payment.status || "").trim() === filters.status;
      const matchesMethod =
        filters.method === "All" ||
        String(payment.method || "").trim() === filters.method ||
        String(payment.downPaymentMethod || "").trim() === filters.method ||
        String(payment.finalPaymentMethod || "").trim() === filters.method;
      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [scopedPayments, query, filters, getPaymentStageLabel]);

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
      displayBookingId: payment.bookingId || payment.id,
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

          {Boolean(query.trim()) && filtered.length === 0 && (
            <View style={{ marginTop: -4, marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>
                No payments match "{query.trim()}". Please try a different keyword or check payment details.
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
                    ? `No payments match "${query.trim()}". Try searching by booking ID, service, or status.`
                    : "No records found."}
                </Text>
              </View>
            ) : (
              pageRows.map((payment) => {
                const proofAction = getCustomerProofAction(payment, getPaymentStageLabel, normalizeStageStatus);
                const meta = getStageMeta(proofAction.stage);
                return (
                  <View key={payment.id} style={styles.tRow}>
                    <Text style={[styles.td, styles.tdId]}>{payment.bookingId || payment.id}</Text>
                    <Text style={[styles.td, styles.tdSvc]}>{payment.service}</Text>
                    <View style={[styles.pill, meta.pill]}>
                      <Text style={[styles.pillText, meta.text]}>{meta.label}</Text>
                    </View>
                    <View style={styles.tdAct}>
                      <TouchableOpacity activeOpacity={0.9} style={styles.viewBtn} onPress={() => openDetails(payment)}>
                        <Text style={styles.viewBtnTxt}>{proofAction.label}</Text>
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

        <ClientPaymentModal
          visible={modalOpen}
          payment={selected}
          usableRewards={scopedRewards}
          getPaymentStageLabel={getPaymentStageLabel}
          getAmountPaid={getAmountPaid}
          getPaymentTotal={getPaymentTotal}
          getRemainingBalance={getRemainingBalance}
          normalizeStageStatus={normalizeStageStatus}
          onClose={() => setModalOpen(false)}
          onViewInvoice={(payment) => {
            setInvoiceSelected(payment);
            setInvoiceOpen(true);
          }}
          onSubmitProof={async (payment, payload) => {
            await submitPaymentProof(payment, payload);
            Alert.alert("Submitted", "Payment proof sent for verification.");
            setModalOpen(false);
          }}
        />
        <InvoiceModal
          visible={invoiceOpen}
          payment={invoiceSelected}
          onClose={() => setInvoiceOpen(false)}
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
