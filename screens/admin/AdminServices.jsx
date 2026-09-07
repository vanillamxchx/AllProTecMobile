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
import { formatTimeLabel, normalizeAllowedArrivalTimes } from "../../services/bookingWorkflow.js";
import { formatPriceRangeLabel } from "../../services/servicePricing.js";
import { formatConsumableSizeLabel, normalizeConsumablesBySize } from "../../services/serviceConsumables.js";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

function getServiceType(service) {
  const explicitType = String(service?.serviceType || "").trim().toLowerCase();
  if (explicitType === "package") return "Package";
  if (explicitType === "basic" || explicitType === "basic service") return "Basic Service";
  const content = `${service?.name || ""} ${service?.desc || ""}`.toLowerCase();
  return content.includes("+") || content.includes(" package") || content.includes("bundle") || content.includes("combo")
    ? "Package"
    : "Basic Service";
}

function getCategorySearchTerms(service) {
  const serviceType = getServiceType(service);
  const typeTerms = serviceType === "Package" ? "Package Packages" : "Basic Service Basic Services Basic";
  const rawCategory = String(service?.category || "").trim();
  return `${typeTerms} ${rawCategory}`.trim();
}

function getArrivalTimesLabel(service) {
  return normalizeAllowedArrivalTimes(service?.allowedArrivalTimes, service?.mins)
    .map((time) => formatTimeLabel(time))
    .join(", ");
}

function getConsumablesLabel(service) {
  return Object.entries(normalizeConsumablesBySize(service?.consumablesBySize, service?.consumables))
    .map(([name, quantities]) => formatConsumableSizeLabel(name, quantities))
    .join(", ");
}

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
      const categoryTerms = getCategorySearchTerms(service);
      const matchesQuery = !q || `${service.name} ${service.desc} ${categoryTerms}`.toLowerCase().includes(q);
      const matchesCategory = filters.category === "All" || String(service.category || "").trim() === filters.category;
      const statusLabel = service.enabled ? "Enabled" : "Disabled";
      const matchesStatus = filters.status === "All" || statusLabel === filters.status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [services, query, filters]);
  const basicServices = useMemo(() => filtered.filter((service) => getServiceType(service) === "Basic Service"), [filtered]);
  const packages = useMemo(() => filtered.filter((service) => getServiceType(service) === "Package"), [filtered]);

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Services Report",
      subtitle: "Filtered service records exported in tabular format.",
      sections: [
        {
          columns: ["Service ID", "Name", "Type", "Description", "Category", "Price Range", "Duration (mins)", "Arrival Times", "Consumables", "Status"],
          rows: filtered.map((service) => [
            service.id || "-",
            service.name || "-",
            getServiceType(service),
            service.desc || "-",
            service.category || "-",
            formatPriceRangeLabel(service),
            Number(service.mins || 0),
            getArrivalTimesLabel(service) || "-",
            getConsumablesLabel(service) || "-",
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

          {Boolean(query.trim()) && filtered.length === 0 && (
            <View style={{ marginTop: -4, marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>
                No services match "{query.trim()}". Try searching by name, description, or category (Basic Services or Packages).
              </Text>
            </View>
          )}

          <ServiceSection
            title="Basic Services"
            services={basicServices}
            styles={styles}
            onSelect={setSelected}
            onOpen={() => setModalOpen(true)}
            emptyLabel={query.trim() ? "No basic services match your search." : "No basic services found for the selected filters."}
          />
          <ServiceSection
            title="Packages"
            services={packages}
            styles={styles}
            onSelect={setSelected}
            onOpen={() => setModalOpen(true)}
            emptyLabel={query.trim() ? "No packages match your search." : "No packages found for the selected filters."}
          />
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

function ServiceSection({ title, services, styles, onSelect, onOpen, emptyLabel = "No services found for the selected filters." }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {services.length ? (
          services.map((service) => (
            <View key={service.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{service.name}</Text>
                  <Text style={styles.desc}>{service.desc}</Text>
                </View>

                <Text style={styles.meta}>
                  Price: {formatPriceRangeLabel(service)} - Est: {Number(service.mins || 0)} mins
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
                    onSelect(service);
                    onOpen();
                  }}
                >
                  <Text style={styles.viewTxt}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTxt}>{emptyLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
