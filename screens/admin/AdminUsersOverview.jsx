import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";

import styles from "../../styles/css/admin/adminUsersOverviewStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function toDisplayUserType(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  if (normalizedValue === "customer") return "Client";
  if (!normalizedValue) return "Client";
  return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
}

function isAdminOrStaffUser(user) {
  const userType = String(user?.userType || "").trim().toLowerCase();
  return userType === "admin" || userType === "staff";
}

export default function AdminUsersOverview() {
  const { users } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ role: "All", status: "All" });

  const adminAndStaffUsers = useMemo(() => users.filter(isAdminOrStaffUser), [users]);

  const roleOptions = useMemo(
    () => Array.from(new Set(adminAndStaffUsers.map((user) => String(user.role || "").trim()).filter(Boolean))),
    [adminAndStaffUsers]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(adminAndStaffUsers.map((user) => String(user.status || "").trim()).filter(Boolean))),
    [adminAndStaffUsers]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return adminAndStaffUsers.filter((user) => {
      const matchesQuery =
        !q || `${user.name} ${user.userType} ${toDisplayUserType(user.userType)} ${user.role} ${user.email} ${user.status}`.toLowerCase().includes(q);
      const matchesRole = filters.role === "All" || String(user.role || "").trim() === filters.role;
      const matchesStatus = filters.status === "All" || String(user.status || "").trim() === filters.status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [adminAndStaffUsers, query, filters]);

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
          columns: ["Name", "User Type", "Role", "Email", "Status"],
          rows: filtered.map((user) => [
            user.name || "-",
            toDisplayUserType(user.userType),
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
          <Text style={styles.h2}>View admin and staff accounts.</Text>
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

      {Boolean(query.trim()) && filtered.length === 0 && (
        <View style={{ marginTop: -4, marginBottom: 8, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>
            No users match "{query.trim()}". Please check your spelling or try another keyword.
          </Text>
        </View>
      )}

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContent}>
          <View style={styles.tableInner}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colName]}>Name</Text>
              <Text style={[styles.th, styles.colUserType]}>User Type</Text>
              <Text style={[styles.th, styles.colRole]}>Role</Text>
              <Text style={[styles.th, styles.colEmail]}>Email</Text>
              <Text style={[styles.th, styles.colStatus]}>Status</Text>
            </View>

            {paged.length === 0 ? (
              <View style={{ paddingVertical: 24, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "700", textAlign: "center" }}>
                  {query.trim()
                    ? `No users match "${query.trim()}". Try searching by name, role, email, or user type.`
                    : "No user accounts found for the selected filters."}
                </Text>
              </View>
            ) : (
              paged.map((user, idx) => (
                <View key={`${user.id}-${idx}`} style={[styles.tr, idx === paged.length - 1 && styles.trLast]}>
                  <Text style={[styles.td, styles.colName]}>{user.name}</Text>
                  <Text style={[styles.td, styles.colUserType]}>{toDisplayUserType(user.userType)}</Text>

                  <View style={[styles.colRole, styles.roleCell]}>
                    <View style={styles.rolePill}>
                      <Text style={styles.roleTxt}>{user.role}</Text>
                    </View>
                  </View>

                  <Text style={[styles.td, styles.colEmail]}>{user.email}</Text>
                  <Text style={[styles.td, styles.colStatus, statusStyle(user.status)]}>{user.status}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {filtered.length > pageSize && (
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
      )}

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
