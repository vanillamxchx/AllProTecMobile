import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  RefreshControl,
} from "react-native";

import styles from "../../styles/css/staff/staffPaymentsStyles";
import PaymentModal from "../modals/PaymentModal";
import InvoiceModal from "../modals/InvoiceModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function getPaymentSortTime(payment = {}) {
  const candidates = [
    payment.updatedAt,
    payment.createdAt,
    payment.date,
    payment.paymentDate,
    payment.paidAt,
    payment.proofSubmittedAt,
    payment.downPaymentPaidAt,
  ];

  for (const value of candidates) {
    const time = new Date(value).getTime();
    if (!Number.isNaN(time)) return time;
  }

  return 0;
}

export default function StaffPayments({ onBack }) {
  const {
    payments,
    scopedPayments,
    getPaymentStageLabel,
    statusMeta,
    reload,
    loading,
  } = useMobileData();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "All", method: "All" });

  const paymentList = useMemo(() => {
    return payments?.length ? payments : (scopedPayments || []);
  }, [payments, scopedPayments]);

  const statusOptions = useMemo(() => {
    const statuses = new Set();
    paymentList.forEach((p) => {
      const stage = typeof getPaymentStageLabel === "function" ? getPaymentStageLabel(p) : "";
      if (stage) statuses.add(stage);
      if (p.status) statuses.add(String(p.status).trim());
    });
    return Array.from(statuses).filter(Boolean);
  }, [paymentList, getPaymentStageLabel]);

  const methodOptions = useMemo(() => {
    const methods = new Set();
    paymentList.forEach((p) => {
      if (p.method) methods.add(String(p.method).trim());
      if (p.downPaymentMethod) methods.add(String(p.downPaymentMethod).trim());
      if (p.finalPaymentMethod) methods.add(String(p.finalPaymentMethod).trim());
    });
    return Array.from(methods).filter(Boolean);
  }, [paymentList]);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return paymentList
      .filter((payment) => {
        const stage = typeof getPaymentStageLabel === "function" ? getPaymentStageLabel(payment) : "";
        const rawStatus = String(payment.status || "").trim();
        const methods = [
          payment.method,
          payment.downPaymentMethod,
          payment.finalPaymentMethod,
        ]
          .filter(Boolean)
          .map((m) => String(m).trim().toLowerCase());

        const vehicleStr = `${payment.vehicle || ""} ${payment.vehicleType || ""} ${payment.vehicleModel || ""} ${payment.car || ""} ${payment.plateNumber || ""} ${payment.plate || ""}`.trim();
        const matchesQuery =
          !q ||
          `${payment.bookingId || ""} ${payment.id || ""} ${payment.customer || ""} ${stage} ${rawStatus} ${payment.service || ""} ${vehicleStr} ${methods.join(" ")}`
            .toLowerCase()
            .includes(q);

        const matchesStatus =
          filters.status === "All" ||
          stage.toLowerCase() === filters.status.toLowerCase() ||
          rawStatus.toLowerCase() === filters.status.toLowerCase();

        const matchesMethod =
          filters.method === "All" ||
          methods.includes(filters.method.toLowerCase());

        return matchesQuery && matchesStatus && matchesMethod;
      })
      .sort((left, right) => getPaymentSortTime(right) - getPaymentSortTime(left));
  }, [paymentList, query, filters, getPaymentStageLabel]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const getStatusPillStyle = (metaCls) => {
    if (metaCls === "paid") return styles.stPaid;
    if (metaCls === "review") return styles.stReview;
    if (metaCls === "rejected") return styles.stRejected;
    return styles.stPending;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={Boolean(loading)}
              onRefresh={() => reload?.({ silent: false })}
              tintColor="#111827"
              colors={["#111827"]}
            />
          }
        >
          <View style={styles.topRow}>
            {onBack ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onBack}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: "#FFF",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 6,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827" }}>{"<"}</Text>
              </TouchableOpacity>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Payments</Text>
              <Text style={styles.h2}>Payments and billing records.</Text>
            </View>
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
                No payments match "{query.trim()}". Please try a different keyword or check payment details.
              </Text>
            </View>
          )}

          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {query.trim() ? "No matching payments found" : "No payments found"}
              </Text>
              <Text style={styles.emptySub}>
                {query.trim()
                  ? `No payments match "${query.trim()}". Try searching by customer, booking ID, or payment method.`
                  : filters.status !== "All" || filters.method !== "All"
                  ? "Try adjusting your search or filters."
                  : "Payment records will appear here."}
              </Text>
            </View>
          ) : (
            <View style={styles.tableCard}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colId]}>Booking ID</Text>
                <Text style={[styles.th, styles.colCustomer]}>Customer</Text>
                <Text style={[styles.th, styles.colStatus]}>Status</Text>
                <Text style={[styles.th, styles.colAction]}>Action</Text>
              </View>

              {paged.map((payment, idx) => {
                const stage =
                  typeof getPaymentStageLabel === "function"
                    ? getPaymentStageLabel(payment)
                    : payment.status || "Pending";
                const meta =
                  typeof statusMeta === "function"
                    ? statusMeta(stage)
                    : { cls: "pending", label: stage };

                return (
                  <View key={payment.id || payment._id || idx} style={[styles.tr, idx === paged.length - 1 && styles.trLast]}>
                    <Text style={[styles.td, styles.colId]}>{payment.bookingId || payment.id}</Text>
                    <Text style={[styles.td, styles.colCustomer]}>{payment.customer || "Customer"}</Text>

                    <View style={[styles.colStatus, styles.statusCell]}>
                      <View style={[styles.statusPill, getStatusPillStyle(meta.cls)]}>
                        <Text style={styles.statusTxt}>{meta.label || stage}</Text>
                      </View>
                    </View>

                    <View style={[styles.colAction, styles.actionCell]}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.viewBtn}
                        onPress={() => {
                          setSelected({
                            ...payment,
                            id: payment.bookingId || payment.id,
                          });
                          setModalOpen(true);
                        }}
                      >
                        <Text style={styles.viewTxt}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {filtered.length > pageSize ? (
            <View style={styles.pager}>
              <TouchableOpacity activeOpacity={0.85} style={styles.pageBtn} onPress={() => setPage((p) => Math.max(1, p - 1))}>
                <Text style={styles.pageTxt}>{"<"}</Text>
              </TouchableOpacity>
              <View style={styles.pageNum}>
                <Text style={styles.pageNumTxt}>{safePage}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85} style={styles.pageBtn} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <Text style={styles.pageTxt}>{">"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>

        <PaymentModal
          visible={modalOpen}
          payment={selected}
          onClose={() => setModalOpen(false)}
          onViewInvoice={(payment) => {
            setSelectedInvoice(payment);
            setInvoiceOpen(true);
          }}
        />
        <InvoiceModal visible={invoiceOpen} payment={selectedInvoice} onClose={() => setInvoiceOpen(false)} />
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
