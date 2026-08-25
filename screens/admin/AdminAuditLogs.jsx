import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, Platform } from "react-native";

import styles from "../../styles/css/admin/adminAuditLogsStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function getAuditLogKey(log) {
  return String(log?.id || log?._id || "").trim();
}

export default function AdminAuditLogs() {
  const { auditLogs, archiveAuditLogs, unarchiveAuditLogs } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ userId: "All", action: "All" });
  const [viewMode, setViewMode] = useState("active");
  const [pendingActions, setPendingActions] = useState({});

  const userOptions = useMemo(
    () => Array.from(new Set(auditLogs.map((log) => String(log.userId || "").trim()).filter(Boolean))),
    [auditLogs]
  );
  const actionOptions = useMemo(
    () => Array.from(new Set(auditLogs.map((log) => String(log.action || "").trim()).filter(Boolean))),
    [auditLogs]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchesArchiveState = viewMode === "archived" ? log.isArchived : !log.isArchived;
      const matchesQuery = !q || `${log.id} ${log.userId} ${log.action} ${log.ts}`.toLowerCase().includes(q);
      const matchesUser = filters.userId === "All" || String(log.userId || "").trim() === filters.userId;
      const matchesAction = filters.action === "All" || String(log.action || "").trim() === filters.action;
      return matchesArchiveState && matchesQuery && matchesUser && matchesAction;
    });
  }, [auditLogs, filters, query, viewMode]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage]);

  const activeMode = viewMode === "active";
  const exportLabel = activeMode ? "Active" : "Archived";

  const changeViewMode = (nextMode) => {
    setViewMode(nextMode);
    setPage(1);
  };

  const setPendingAction = (logKey, pending) => {
    setPendingActions((prev) => {
      const next = { ...prev };
      if (pending) {
        next[logKey] = true;
      } else {
        delete next[logKey];
      }
      return next;
    });
  };

  const showActionError = (title, message) => {
    if (Platform.OS === "web" && typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(message);
      return;
    }
    Alert.alert(title, message);
  };

  const runRowAction = async (log) => {
    const logKey = getAuditLogKey(log);
    if (!logKey) return;
    if (pendingActions[logKey]) return;

    const isArchived = Boolean(log.isArchived);
    setPendingAction(logKey, true);
    try {
      const action = isArchived ? unarchiveAuditLogs : archiveAuditLogs;
      await action([logKey]);
      setPage(1);
    } catch (error) {
      showActionError(
        isArchived ? "Unarchive failed" : "Archive failed",
        error.message || "Could not update the audit logs."
      );
    } finally {
      setPendingAction(logKey, false);
    }
  };

  const getRowActionLabel = (log) => (log?.isArchived ? "Unarchive" : "Archive");

  const getRowActionStyle = (log) =>
    pendingActions[getAuditLogKey(log)]
      ? [styles.rowActionBtn, styles.rowActionBtnDisabled]
      : log?.isArchived
        ? [styles.rowActionBtn, styles.rowActionBtnGhost]
        : [styles.rowActionBtn];

  const getRowActionTextStyle = (log) =>
    pendingActions[getAuditLogKey(log)]
      ? [styles.rowActionTxt, styles.rowActionTxtDisabled]
      : log?.isArchived
        ? [styles.rowActionTxt, styles.rowActionTxtGhost]
        : [styles.rowActionTxt];

  const exportPdf = () =>
    exportTabularPdf({
      title: `Admin Audit Logs Report - ${exportLabel}`,
      subtitle: `Filtered ${exportLabel.toLowerCase()} audit trail exported in tabular format.`,
      sections: [
        {
          columns: ["Audit ID", "User ID", "Action", "Target ID", "Timestamp"],
          rows: filtered.map((log) => [
            log.id || "-",
            log.userId || "-",
            log.action || "-",
            log.targetId || "-",
            log.ts || "-",
          ]),
          emptyMessage: `No ${exportLabel.toLowerCase()} audit logs found for the selected filters.`,
        },
      ],
    });

  const totalLabel = `${filtered.length} ${activeMode ? "active" : "archived"} log${
    filtered.length === 1 ? "" : "s"
  }`;

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
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

      <View style={styles.toolbarRow}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.modeBtn, activeMode && styles.modeBtnActive]}
            onPress={() => changeViewMode("active")}
          >
            <Text style={[styles.modeTxt, activeMode && styles.modeTxtActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.modeBtn, !activeMode && styles.modeBtnActive]}
            onPress={() => changeViewMode("archived")}
          >
            <Text style={[styles.modeTxt, !activeMode && styles.modeTxtActive]}>Archived</Text>
          </TouchableOpacity>
        </View>
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
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={Boolean(pendingActions[getAuditLogKey(log)])}
                  style={getRowActionStyle(log)}
                  onPress={() => {
                    runRowAction(log);
                  }}
                >
                  <Text style={getRowActionTextStyle(log)}>
                    {pendingActions[getAuditLogKey(log)] ? "Working..." : getRowActionLabel(log)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.logMetaGrid}>
                <LogField label="User" value={log.userId} />
                <LogField label="Action" value={log.action} />
                <LogField label="Target" value={log.targetId} />
                <LogField label="Timestamp" value={log.ts} />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyTxt}>
              {activeMode ? "No active audit records yet" : "No archived audit records yet"}
            </Text>
          </View>
        )}
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
