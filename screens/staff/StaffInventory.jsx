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

import styles from "../../styles/css/staff/staffInventoryStyles";
import InventoryModal from "../modals/InventoryModal";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

export default function StaffInventory() {
  const { inventory } = useMobileData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ category: "All", remarks: "All" });

  const categoryOptions = useMemo(
    () => Array.from(new Set(inventory.map((item) => String(item.category || "").trim()).filter(Boolean))),
    [inventory]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return inventory.filter((item) => {
      const low = item.maxStock && item.currentStock / item.maxStock <= 0.25;
      const remark = low ? "Low Stock" : "Sufficient";
      const matchesQuery = !q || `${item.id} ${item.name} ${item.category}`.toLowerCase().includes(q);
      const matchesCategory = filters.category === "All" || String(item.category || "").trim() === filters.category;
      const matchesRemarks = filters.remarks === "All" || remark === filters.remarks;
      return matchesQuery && matchesCategory && matchesRemarks;
    });
  }, [inventory, query, filters]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paged = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
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

          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colId]}>Item ID</Text>
              <Text style={[styles.th, styles.colName]}>Item Name</Text>
              <Text style={[styles.th, styles.colRemain]}>Remaining Stocks</Text>
              <Text style={[styles.th, styles.colRemarks]}>Remarks</Text>
              <Text style={[styles.th, styles.colAction]}>Action</Text>
            </View>

            {paged.map((item, idx) => {
              const low = item.maxStock && item.currentStock / item.maxStock <= 0.25;
              return (
                <View key={item.id} style={[styles.tr, low && styles.trLow, idx === paged.length - 1 && styles.trLast]}>
                  <Text style={[styles.td, styles.colId]}>{item.id}</Text>
                  <Text style={[styles.td, styles.colName]}>{item.name}</Text>
                  <Text style={[styles.td, styles.colRemain]}>{item.currentStock}</Text>
                  <Text style={[styles.td, styles.colRemarks]}>{low ? "Low Stock" : "Sufficient"}</Text>
                  <View style={[styles.colAction, styles.actionCell]}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.viewBtn}
                      onPress={() => {
                        setSelected({
                          id: item.id,
                          name: item.name,
                          type: item.category || "-",
                          stocks: String(item.maxStock || 0),
                          used: String((item.maxStock || 0) - (item.currentStock || 0)),
                          remaining: String(item.currentStock || 0),
                          remarks: low ? "Low Stock" : "Sufficient",
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

        <InventoryModal visible={modalOpen} item={selected} onClose={() => setModalOpen(false)} />
        <MobileFilterModal
          open={filterOpen}
          title="Filter Stock Monitoring"
          values={filters}
          fields={[
            { key: "category", label: "CATEGORY", options: categoryOptions },
            { key: "remarks", label: "REMARKS", options: ["Low Stock", "Sufficient"] },
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
