import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, RefreshControl } from "react-native";

import styles from "../../styles/css/admin/adminAuditLogsStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function getAuditLogKey(log) {
  return String(log?.id || log?._id || log?.auditId || "").trim();
}

function getAuditSortTime(log = {}) {
  const candidates = [
    log.createdAt,
    log.timestamp,
    log.ts,
    log.updatedAt,
    log.date,
  ];
  for (const c of candidates) {
    if (c) {
      const t = new Date(c).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  return 0;
}

export default function AdminAuditLogs({ onBack }) {
  const { auditLogs = [], reload, loading } = useMobileData();
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ userId: "All", action: "All" });
  const [page, setPage] = useState(1);

  const userOptions = useMemo(
    () => Array.from(new Set(auditLogs.map((log) => String(log.userId || log.user || "").trim()).filter(Boolean))),
    [auditLogs]
  );
  const actionOptions = useMemo(
    () => Array.from(new Set(auditLogs.map((log) => String(log.action || log.title || "").trim()).filter(Boolean))),
    [auditLogs]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return auditLogs
      .filter((log) => {
        const idStr = String(log.id || log._id || "").toLowerCase();
        const userStr = String(log.userId || log.user || "").toLowerCase();
        const actionStr = String(log.action || log.title || "").toLowerCase();
        const targetStr = String(log.targetId || log.target || "").toLowerCase();
        const tsStr = String(log.ts || log.timestamp || "").toLowerCase();

        const matchesQuery =
          !q ||
          idStr.includes(q) ||
          userStr.includes(q) ||
          actionStr.includes(q) ||
          targetStr.includes(q) ||
          tsStr.includes(q);

        const currentUserId = String(log.userId || log.user || "").trim();
        const matchesUser = filters.userId === "All" || currentUserId === filters.userId;

        const currentAction = String(log.action || log.title || "").trim();
        const matchesAction = filters.action === "All" || currentAction === filters.action;

        return matchesQuery && matchesUser && matchesAction;
      })
      .sort((a, b) => getAuditSortTime(b) - getAuditSortTime(a));
  }, [auditLogs, filters, query]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage]);

  const exportPdf = () =>
    exportTabularPdf({
      title: "Audit Logs Report",
      subtitle: "Filtered audit trail exported in tabular format.",
      sections: [
        {
          columns: ["Audit ID", "User ID", "Action", "Target ID", "Timestamp"],
          rows: filtered.map((log) => [
            getAuditLogKey(log) || "-",
            log.userId || log.user || "-",
            log.action || log.title || "-",
            log.targetId || log.target || "-",
            log.ts || log.timestamp || "-",
          ]),
          emptyMessage: "No audit logs found for the selected filters.",
        },
      ],
    });

  const totalLabel = `${filtered.length} log${filtered.length === 1 ? "" : "s"}`;

  return (
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
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#374151" }}>←</Text>
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Audit Logs</Text>
          <Text style={styles.h2}>Track actions for accountability.</Text>
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
            placeholder="Search Logs..."
            placeholderTextColor="#9AA0A6"
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <Text style={styles.resultsTxt}>{totalLabel}</Text>

      <View style={styles.listCard}>
        {paged.length ? (
          paged.map((log, idx) => (
            <View key={`${getAuditLogKey(log)}-${idx}`} style={[styles.logCard, idx === paged.length - 1 && styles.logCardLast]}>
              <View style={styles.logTopRow}>
                <View style={styles.logIdBadge}>
                  <Text style={styles.logIdTxt}>{getAuditLogKey(log) || "AUDIT"}</Text>
                </View>
              </View>

              <View style={styles.logMetaGrid}>
                <LogField label="User" value={log.userId || log.user || "-"} />
                <LogField label="Action" value={log.action || log.title || "-"} />
                <LogField label="Target" value={log.targetId || log.target || "-"} />
                <LogField label="Timestamp" value={log.ts || log.timestamp || "-"} />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyTxt}>No audit records found.</Text>
          </View>
        )}
      </View>

      <View style={styles.pager}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.pageBtn}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
        >
          <Text style={styles.pageTxt}>{"<"}</Text>
        </TouchableOpacity>
        <View style={styles.pageNum}>
          <Text style={styles.pageNumTxt}>{safePage}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.pageBtn}
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          <Text style={styles.pageTxt}>{">"}</Text>
        </TouchableOpacity>
      </View>

      <MobileFilterModal
        open={filterOpen}
        title="Filter Audit Logs"
        values={filters}
        fields={[
          { key: "userId", label: "USER", options: userOptions },
          { key: "action", label: "ACTION", options: actionOptions },
        ]}
        onClose={() => setFilterOpen(false)}
        onApply={(nextValues) => {
          setFilters(nextValues);
          setPage(1);
          setFilterOpen(false);
        }}
      />

      <View style={{ height: 22 }} />
    </ScrollView>
  );
}

function LogField({ label, value }) {
  return (
    <View style={styles.logField}>
      <Text style={styles.logFieldLabel}>{label}</Text>
      <Text style={styles.logFieldValue}>{value || "-"}</Text>
    </View>
  );
}
