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
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

export default function AdminPayments() {
  const { payments } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "All", method: "All" });

  const statusOptions = useMemo(
    () => Array.from(new Set(payments.map((payment) => String(payment.status || "").trim()).filter(Boolean))),
    [payments]
  );
  const methodOptions = useMemo(
    () => Array.from(new Set(payments.map((payment) => String(payment.method || "").trim()).filter(Boolean))),
    [payments]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesQuery =
        !q ||
        `${payment.id} ${payment.customer} ${payment.status} ${payment.service} ${payment.method}`
          .toLowerCase()
          .includes(q);
      const matchesStatus = filters.status === "All" || String(payment.status || "").trim() === filters.status;
      const matchesMethod = filters.method === "All" || String(payment.method || "").trim() === filters.method;
      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [payments, query, filters]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage]);

  const statusStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("paid")) return styles.stPaid;
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
            payment.status || "-",
            payment.method || "-",
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

            {paged.map((payment, idx) => (
              <View key={payment.id} style={[styles.tr, idx === paged.length - 1 && styles.trLast]}>
                <Text style={[styles.td, styles.colId]}>{payment.bookingId || payment.id}</Text>
                <Text style={[styles.td, styles.colCustomer]}>{payment.customer}</Text>

                <View style={[styles.colStatus, styles.statusCell]}>
                  <View style={[styles.statusPill, statusStyle(payment.status)]}>
                    <Text style={styles.statusTxt}>{payment.status}</Text>
                  </View>
                </View>

                <View style={[styles.colAction, styles.actionCell]}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.viewBtn}
                    onPress={() => {
                      setSelected({
                        id: payment.bookingId || payment.id,
                        date: payment.date,
                        customer: payment.customer,
                        service: payment.service,
                        amount: payment.amount,
                        status: payment.status,
                        method: payment.method,
                      });
                      setModalOpen(true);
                    }}
                  >
                    <Text style={styles.viewTxt}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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

        <PaymentModal visible={modalOpen} payment={selected} onClose={() => setModalOpen(false)} />
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
