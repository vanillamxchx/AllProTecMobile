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

import styles from "../../styles/css/staff/staffInventoryStyles";
import InventoryModal from "../modals/InventoryModal";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function getInventorySortTime(item = {}) {
  const candidates = [
    item.updatedAt,
    item.lastRestockedAt,
    item.restockedAt,
    item.createdAt,
    item.date,
  ];

  for (const value of candidates) {
    const time = new Date(value).getTime();
    if (!Number.isNaN(time)) return time;
  }

  return 0;
}

function isItemLowStock(item = {}) {
  const current = Number(item.currentStock ?? item.stock ?? item.quantity ?? 0);
  const max = Number(item.maxStock ?? 0);
  const min = Number(item.minStock ?? 0);
  const remark = String(item.remarks || item.remark || item.status || "").toLowerCase();

  if (remark.includes("low") || remark.includes("out") || remark.includes("crit")) return true;
  if (current <= 0) return true;
  if (min > 0 && current <= min) return true;
  if (max > 0 && current / max <= 0.25) return true;
  return false;
}

function getItemRemark(item = {}) {
  const current = Number(item.currentStock ?? item.stock ?? item.quantity ?? 0);
  if (item.remarks && typeof item.remarks === "string" && item.remarks.trim()) {
    return item.remarks.trim();
  }
  if (item.remark && typeof item.remark === "string" && item.remark.trim()) {
    return item.remark.trim();
  }
  if (current <= 0) return "Out of Stock";
  if (isItemLowStock(item)) return "Low Stock";
  return "Sufficient";
}

export default function StaffInventory({ onBack }) {
  const { inventory, stockMonitoring, reload, loading } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ category: "All", remarks: "All" });

  const itemsList = useMemo(() => {
    return inventory?.length ? inventory : (stockMonitoring || []);
  }, [inventory, stockMonitoring]);

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          itemsList
            .map((item) => String(item.category || item.type || "").trim())
            .filter(Boolean)
        )
      ),
    [itemsList]
  );

  const remarksOptions = useMemo(() => {
    const set = new Set(["Low Stock", "Sufficient"]);
    itemsList.forEach((item) => {
      const remark = getItemRemark(item);
      if (remark) set.add(remark);
    });
    return Array.from(set).filter(Boolean);
  }, [itemsList]);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return itemsList
      .filter((item) => {
        const remark = getItemRemark(item);
        const isLow = isItemLowStock(item);
        const id = String(item.id || item._id || item.itemId || "");
        const name = String(item.name || item.itemName || "");
        const category = String(item.category || item.type || "");

        const matchesQuery =
          !q || `${id} ${name} ${category} ${remark}`.toLowerCase().includes(q);
        const matchesCategory =
          filters.category === "All" ||
          category.toLowerCase() === filters.category.toLowerCase();
        const matchesRemarks =
          filters.remarks === "All" ||
          remark.toLowerCase() === filters.remarks.toLowerCase() ||
          (filters.remarks.toLowerCase() === "low stock" && isLow);

        return matchesQuery && matchesCategory && matchesRemarks;
      })
      .sort((left, right) => getInventorySortTime(right) - getInventorySortTime(left));
  }, [itemsList, query, filters]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage]
  );

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
              <Text style={styles.h1}>Stock Monitoring</Text>
              <Text style={styles.h2}>Track supplies and low-stock alerts.</Text>
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
                placeholder="Search Items..."
                placeholderTextColor="#9AA0A6"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
              <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySub}>
                {query || filters.category !== "All" || filters.remarks !== "All"
                  ? "Try adjusting your search or filters."
                  : "Stock monitoring records will appear here."}
              </Text>
            </View>
          ) : (
            <View style={styles.tableCard}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colId]}>Item ID</Text>
                <Text style={[styles.th, styles.colName]}>Item Name</Text>
                <Text style={[styles.th, styles.colRemain]}>Remaining Stocks</Text>
                <Text style={[styles.th, styles.colRemarks]}>Remarks</Text>
                <Text style={[styles.th, styles.colAction]}>Action</Text>
              </View>

              {paged.map((item, idx) => {
                const low = isItemLowStock(item);
                const remark = getItemRemark(item);
                const current = Number(item.currentStock ?? item.stock ?? item.quantity ?? 0);
                const max = Number(item.maxStock ?? item.totalStock ?? item.stocks ?? current);
                const used = Math.max(0, max - current);

                return (
                  <View
                    key={item.id || item._id || idx}
                    style={[styles.tr, low && styles.trLow, idx === paged.length - 1 && styles.trLast]}
                  >
                    <Text style={[styles.td, styles.colId]}>{item.id || item._id || "-"}</Text>
                    <Text style={[styles.td, styles.colName]}>{item.name || item.itemName || "-"}</Text>
                    <Text style={[styles.td, styles.colRemain]}>{current}</Text>
                    <Text style={[styles.td, styles.colRemarks]}>{remark}</Text>
                    <View style={[styles.colAction, styles.actionCell]}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.viewBtn}
                        onPress={() => {
                          setSelected({
                            id: item.id || item._id || item.itemId || "-",
                            name: item.name || item.itemName || "-",
                            type: item.category || item.type || "-",
                            stocks: String(max),
                            used: String(used),
                            remaining: String(current),
                            remarks: remark,
                          });
                          setModalOpen(true);
                        }}
                      >
                        <Text style={styles.viewTxt}>View</Text>
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

        <InventoryModal visible={modalOpen} item={selected} onClose={() => setModalOpen(false)} />
        <MobileFilterModal
          open={filterOpen}
          title="Filter Stock Monitoring"
          values={filters}
          fields={[
            { key: "category", label: "CATEGORY", options: categoryOptions },
            { key: "remarks", label: "REMARKS", options: remarksOptions },
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
