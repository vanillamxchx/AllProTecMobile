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

import styles from "../../styles/css/admin/adminPaymentsStyles.js";
import PaymentModal from "../modals/PaymentModal.jsx";
import InvoiceModal from "../modals/InvoiceModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

export default function AdminPayments() {
  const { payments, getPaymentStageLabel } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceSelected, setInvoiceSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "All", method: "All" });

  const statusOptions = useMemo(
    () => Array.from(new Set(payments.map((payment) => getPaymentStageLabel(payment)).filter(Boolean))),
    [getPaymentStageLabel, payments]
  );
  const methodOptions = useMemo(
    () => Array.from(new Set(payments.flatMap((payment) => [
      String(payment.method || "").trim(),
      String(payment.downPaymentMethod || "").trim(),
      String(payment.finalPaymentMethod || "").trim(),
    ].filter(Boolean)))),
    [payments]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return payments.filter((payment) => {
      const stageLabel = getPaymentStageLabel(payment);
      const matchesQuery =
        !q ||
        `${payment.id} ${payment.bookingId || ""} ${payment.customer} ${payment.status} ${stageLabel} ${payment.service} ${payment.method || ""} ${payment.downPaymentMethod || ""} ${payment.finalPaymentMethod || ""}`
          .toLowerCase()
          .includes(q);
      const matchesStatus = filters.status === "All" || stageLabel === filters.status || String(payment.status || "").trim() === filters.status;
      const matchesMethod =
        filters.method === "All" ||
        String(payment.method || "").trim() === filters.method ||
        String(payment.downPaymentMethod || "").trim() === filters.method ||
        String(payment.finalPaymentMethod || "").trim() === filters.method;
      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [payments, query, filters, getPaymentStageLabel]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage]);

  const statusStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("paid")) return styles.stPaid;
    if (s.includes("verification")) return styles.stReview;
    if (s.includes("reject") || s.includes("cancel")) return styles.stRejected;
    return styles.stPending;
  };

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Payments Report",
      subtitle: "Filtered payment records exported in tabular format.",
      sections: [
        {
          columns: ["Booking ID", "Date", "Customer", "Service", "Amount", "Status", "Method"],
          rows: filtered.map((payment) => [
            payment.bookingId || payment.id || "-",
            payment.date || "-",
            payment.customer || "-",
            payment.service || "-",
            `PHP ${Number(payment.amount || 0).toLocaleString()}`,
            getPaymentStageLabel(payment) || payment.status || "-",
            payment.finalPaymentMethod || payment.downPaymentMethod || payment.method || "-",
          ]),
          emptyMessage: "No payments found for the selected filters.",
        },
      ],
    });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Payments</Text>
              <Text style={styles.h2}>Payments and billing records.</Text>
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
                placeholder="Search Payment..."
                placeholderTextColor="#9AA0A6"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
              <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colId]}>Booking ID</Text>
              <Text style={[styles.th, styles.colCustomer]}>Customer</Text>
              <Text style={[styles.th, styles.colStatus]}>Status</Text>
              <Text style={[styles.th, styles.colAction]}>Action</Text>
            </View>

            {paged.map((payment, idx) => {
              const stageLabel = getPaymentStageLabel(payment);
              return (
              <View key={payment.id} style={[styles.tr, idx === paged.length - 1 && styles.trLast]}>
                <Text style={[styles.td, styles.colId]}>{payment.bookingId || payment.id}</Text>
                <Text style={[styles.td, styles.colCustomer]}>{payment.customer}</Text>

                <View style={[styles.colStatus, styles.statusCell]}>
                  <View style={[styles.statusPill, statusStyle(stageLabel)]}>
                    <Text style={styles.statusTxt}>{stageLabel}</Text>
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
                        date: payment.date,
                        customer: payment.customer,
                        customerEmail: payment.customerEmail,
                        service: payment.service,
                        amount: payment.amount,
                        originalAmount: payment.originalAmount,
                        promoDiscountAmount: payment.promoDiscountAmount,
                        promoTitle: payment.promoTitle,
                        promoDiscountPercent: payment.promoDiscountPercent,
                        status: payment.status,
                        method: payment.method,
                        reference: payment.reference,
                        proofSubmittedAt: payment.proofSubmittedAt,
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
        </ScrollView>

        <PaymentModal
          visible={modalOpen}
          payment={selected}
          onClose={() => setModalOpen(false)}
          onViewInvoice={(payment) => {
            setInvoiceSelected(payment);
            setInvoiceOpen(true);
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
