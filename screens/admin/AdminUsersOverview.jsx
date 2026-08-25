import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";

import styles from "../../styles/css/admin/adminUsersOverviewStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

export default function AdminUsersOverview() {
  const { users } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ role: "All", status: "All" });

  const roleOptions = useMemo(
    () => Array.from(new Set(users.map((user) => String(user.role || "").trim()).filter(Boolean))),
    [users]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(users.map((user) => String(user.status || "").trim()).filter(Boolean))),
    [users]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !q || `${user.name} ${user.role} ${user.email} ${user.status}`.toLowerCase().includes(q);
      const matchesRole = filters.role === "All" || String(user.role || "").trim() === filters.role;
      const matchesStatus = filters.status === "All" || String(user.status || "").trim() === filters.status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, filters]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage]);

  const statusStyle = (status) =>
    String(status || "").toLowerCase() === "active" ? styles.statusActive : styles.statusInactive;

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Users Report",
      subtitle: "User accounts exported in tabular format.",
      sections: [
        {
          columns: ["Name", "Role", "Email", "Status"],
          rows: filtered.map((user) => [
            user.name || "-",
            user.role || "-",
            user.email || "-",
            user.status || "-",
          ]),
          emptyMessage: "No user accounts found for the selected filters.",
        },
      ],
    });

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Users Overview</Text>
          <Text style={styles.h2}>View admin/staff/client accounts.</Text>
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
            placeholder="Search Users..."
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
          <Text style={[styles.th, styles.colName]}>Name</Text>
          <Text style={[styles.th, styles.colRole]}>Role</Text>
          <Text style={[styles.th, styles.colEmail]}>Email</Text>
          <Text style={[styles.th, styles.colStatus]}>Status</Text>
        </View>

        {paged.map((user, idx) => (
          <View key={`${user.id}-${idx}`} style={[styles.tr, idx === paged.length - 1 && styles.trLast]}>
            <Text style={[styles.td, styles.colName]}>{user.name}</Text>

            <View style={[styles.colRole, styles.roleCell]}>
              <View style={styles.rolePill}>
                <Text style={styles.roleTxt}>{user.role}</Text>
              </View>
            </View>

            <Text style={[styles.td, styles.colEmail]}>{user.email}</Text>
            <Text style={[styles.td, styles.colStatus, statusStyle(user.status)]}>{user.status}</Text>
          </View>
        ))}
      </View>

      <MobileFilterModal
        open={filterOpen}
        title="Filter Users"
        values={filters}
        fields={[
          { key: "role", label: "ROLE", options: roleOptions },
          { key: "status", label: "STATUS", options: statusOptions },
        ]}
        onClose={() => setFilterOpen(false)}
        onApply={(nextValues) => {
          setFilters(nextValues);
          setPage(1);
          setFilterOpen(false);
        }}
      />
    </ScrollView>
  );
}
