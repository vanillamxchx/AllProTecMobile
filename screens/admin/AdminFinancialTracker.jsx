import React, { useMemo, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import styles from "../../styles/css/admin/adminFinancialTrackerStyles.js";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function peso(value) {
  return `PHP ${Number(value || 0).toLocaleString()}`;
}

export default function AdminFinancialTracker() {
  const { payments, expenses, commissions } = useMobileData();
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("All");

  const paidRevenue = useMemo(
    () => payments.filter((item) => item.status === "Paid").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );
  const totalCommissions = useMemo(
    () => commissions.reduce((sum, item) => sum + Number(item.earned || 0), 0),
    [commissions]
  );
  const netProfit = paidRevenue - totalExpenses - totalCommissions;

  const applySearch = () => {
    setQuery(String(searchText || "").trim().toLowerCase());
  };

  const filteredExpenses = useMemo(() => {
    if (selectedType === "Commissions") return [];

    return expenses.filter((item) => {
      if (!query) return true;
      return `${item.date} ${item.description} ${item.category} ${item.amount}`
        .toLowerCase()
        .includes(query);
    });
  }, [expenses, query, selectedType]);

  const filteredCommissions = useMemo(() => {
    if (selectedType === "Expenses") return [];

    return commissions.filter((item) => {
      if (!query) return true;
      return `${item.date} ${item.worker} ${item.service} ${item.earned}`
        .toLowerCase()
        .includes(query);
    });
  }, [commissions, query, selectedType]);

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Financial Tracker Report",
      subtitle: "Revenue, expenses, and worker commissions exported in tabular format.",
      sections: [
        {
          title: "Overview",
          columns: ["Metric", "Value"],
          rows: [
            ["Paid Revenue", peso(paidRevenue)],
            ["Expenses", peso(totalExpenses)],
            ["Commissions", peso(totalCommissions)],
            ["Net Profit", peso(netProfit)],
          ],
        },
        {
          title: "Expenses",
          columns: ["Date", "Description", "Category", "Amount"],
          rows: filteredExpenses.map((item) => [
            item.date || "-",
            item.description || "-",
            item.category || "-",
            peso(item.amount),
          ]),
          emptyMessage: "No expenses match the selected filters.",
        },
        {
          title: "Commissions",
          columns: ["Date", "Worker", "Service", "Earned"],
          rows: filteredCommissions.map((item) => [
            item.date || "-",
            item.worker || "-",
            item.service || "-",
            peso(item.earned),
          ]),
          emptyMessage: "No commissions match the selected filters.",
        },
      ],
    });

  const totalResults = filteredExpenses.length + filteredCommissions.length;
  const filterFields = useMemo(
    () => [
      {
        key: "recordType",
        label: "RECORD TYPE",
        defaultValue: "All",
        options: ["All", "Expenses", "Commissions"],
      },
    ],
    []
  );

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Financial Tracker</Text>
          <Text style={styles.h2}>Revenue, expenses, and worker commissions.</Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} style={styles.exportBtn} onPress={exportPdf}>
          <Text style={styles.exportTxt}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Paid Revenue" value={peso(paidRevenue)} />
        <StatCard label="Expenses" value={peso(totalExpenses)} />
        <StatCard label="Commissions" value={peso(totalCommissions)} />
        <StatCard label="Net Profit" value={peso(netProfit)} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Image source={ICON_SEARCH} style={styles.searchIcon} resizeMode="contain" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={applySearch}
            placeholder="Search finance records..."
            placeholderTextColor="#9AA0A6"
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.searchBtn} onPress={applySearch}>
          <Text style={styles.searchBtnTxt}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.filterBtn,
            (filterModalOpen || selectedType !== "All") && styles.filterBtnActive,
          ]}
          onPress={() => setFilterModalOpen(true)}
        >
          <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <Text style={styles.resultsTxt}>
        {totalResults} record{totalResults === 1 ? "" : "s"} found
      </Text>

      <Section title="Recent Expenses">
        {filteredExpenses.length ? (
          filteredExpenses.slice(0, 6).map((item) => (
            <RowCard
              key={item.id}
              title={item.description || "Expense"}
              sub={`${item.date || "-"} | ${item.category || "Uncategorized"}`}
              value={peso(item.amount)}
            />
          ))
        ) : (
          <Empty text="No expenses match your search or filters." />
        )}
      </Section>

      <Section title="Recent Commissions">
        {filteredCommissions.length ? (
          filteredCommissions.slice(0, 6).map((item) => (
            <RowCard
              key={item.id}
              title={item.worker || "Worker"}
              sub={`${item.date || "-"} | ${item.service || "Service"}`}
              value={peso(item.earned)}
            />
          ))
        ) : (
          <Empty text="No commissions match your search or filters." />
        )}
      </Section>

      <MobileFilterModal
        open={filterModalOpen}
        title="Filter Records"
        fields={filterFields}
        values={{ recordType: selectedType }}
        onApply={(nextValues) => {
          setSelectedType(nextValues?.recordType ?? "All");
          setFilterModalOpen(false);
        }}
        onClose={() => setFilterModalOpen(false)}
      />
    </ScrollView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

function RowCard({ title, sub, value }) {
  return (
    <View style={styles.rowCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Empty({ text }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTxt}>{text}</Text>
    </View>
  );
}
