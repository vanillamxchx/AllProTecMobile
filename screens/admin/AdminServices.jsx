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

import styles from "../../styles/css/admin/adminServicesStyles.js";
import ServiceModal from "../modals/ServiceModal.jsx";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import { exportTabularPdf } from "../../services/exportPdf.js";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

export default function AdminServices() {
  const { services } = useMobileData();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ category: "All", status: "All" });

  const categoryOptions = useMemo(
    () => Array.from(new Set(services.map((service) => String(service.category || "").trim()).filter(Boolean))),
    [services]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return services.filter((service) => {
      const matchesQuery = !q || `${service.name} ${service.desc}`.toLowerCase().includes(q);
      const matchesCategory = filters.category === "All" || String(service.category || "").trim() === filters.category;
      const statusLabel = service.enabled ? "Enabled" : "Disabled";
      const matchesStatus = filters.status === "All" || statusLabel === filters.status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [services, query, filters]);

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Services Report",
      subtitle: "Filtered service records exported in tabular format.",
      sections: [
        {
          columns: ["Service ID", "Name", "Type", "Description", "Category", "Price", "Duration (mins)", "Status"],
          rows: filtered.map((service) => [
            service.id || "-",
            service.name || "-",
            service.serviceType || "Basic Service",
            service.desc || "-",
            service.category || "-",
            `PHP ${Number(service.price || 0).toLocaleString()}`,
            Number(service.mins || 0),
            service.enabled ? "Enabled" : "Disabled",
          ]),
          emptyMessage: "No services found for the selected filters.",
        },
      ],
    });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Services</Text>
              <Text style={styles.h2}>Service catalog and booking.</Text>
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
                onChangeText={setQuery}
                placeholder="Search Services..."
                placeholderTextColor="#9AA0A6"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
              <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {filtered.map((service) => (
              <View key={service.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{service.name}</Text>
                    <Text style={styles.desc}>{service.desc}</Text>
                  </View>

                  <Text style={styles.meta}>
                    Price: PHP {Number(service.price || 0).toLocaleString()} - Est: {Number(service.mins || 0)} mins
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <View style={[styles.statusPill, service.enabled ? styles.enabled : styles.disabled]}>
                    <Text style={styles.statusTxt}>{service.enabled ? "Enabled" : "Disabled"}</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.viewBtn}
                    onPress={() => {
                      setSelected({
                        name: service.name,
                        description: service.desc,
                        price: `PHP ${Number(service.price || 0).toLocaleString()}`,
                        est: `${Number(service.mins || 0)} mins`,
                        status: service.enabled ? "Enabled" : "Disabled",
                      });
                      setModalOpen(true);
                    }}
                  >
                    <Text style={styles.viewTxt}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <ServiceModal visible={modalOpen} service={selected} onClose={() => setModalOpen(false)} />
        <MobileFilterModal
          open={filterOpen}
          title="Filter Services"
          values={filters}
          fields={[
            { key: "category", label: "CATEGORY", options: categoryOptions },
            { key: "status", label: "STATUS", options: ["Enabled", "Disabled"] },
          ]}
          onClose={() => setFilterOpen(false)}
          onApply={(nextValues) => {
            setFilters(nextValues);
            setFilterOpen(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
}
