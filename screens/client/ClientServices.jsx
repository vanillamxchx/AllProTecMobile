import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as MobileDataModule from "../../context/MobileDataContext";
import { formatTimeLabel, normalizeAllowedArrivalTimes } from "../../services/bookingWorkflow";
import { formatPriceRangeLabel } from "../../services/servicePricing";

const useMobileDataHook =
  MobileDataModule.useMobileData ||
  MobileDataModule.useMobileDataContext ||
  (() => ({}));

const styles = {
  screen: {
    flex: 1,
    backgroundColor: "#f4f3ef",
  },
  content: {
    padding: 18,
    gap: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1f2533",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6d7688",
  },
  controlsWrap: {
    gap: 12,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e6e3da",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchIcon: {
    fontSize: 20,
    color: "#a0a7b4",
    fontWeight: "700",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2533",
    padding: 0,
  },
  filterButton: {
    width: 58,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6e3da",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    borderColor: "#d2aa27",
    backgroundColor: "#fff5d4",
  },
  filterButtonText: {
    fontSize: 18,
    color: "#8f98a8",
    fontWeight: "900",
  },
  filterPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e6e3da",
    gap: 14,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1f2533",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#d7d9e0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: "#d2aa27",
    backgroundColor: "#fff5d4",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f2533",
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1f2533",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6d7688",
    marginTop: -4,
  },
  serviceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e6e3da",
  },
  serviceTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#1f2533",
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: "#6d7688",
    marginBottom: 10,
  },
  serviceMeta: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6d7688",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e6e3da",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: "#6d7688",
  },
};

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isVisibleService(service) {
  if (!service || typeof service !== "object") return false;
  if (service.isArchived || service.archived) return false;
  const status = normalizeStatus(service.status || service.state || service.availability);
  if (service.isActive === true || service.active === true) return true;
  if (!status) return true;
  return status === "active" || status === "available" || status === "enabled";
}

function parsePriceValue(value) {
  if (typeof value === "number") return value;
  const raw = String(value || "").replace(/,/g, "");
  const match = raw.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

function normalizeServices(rawServices) {
  return asArray(rawServices)
    .filter(isVisibleService)
    .map((service, index) => ({
      id: service.id || service._id || service.serviceId || `service-${index}`,
      name: service.name || service.title || service.serviceName || "Service",
      description:
        service.description ||
        service.summary ||
        service.details ||
        service.longDescription ||
        "Professional vehicle care service.",
      price:
        service.price ||
        service.basePrice ||
        service.amount ||
        service.rate ||
        "",
      priceValue: parsePriceValue(
        service.price || service.basePrice || service.amount || service.rate
      ),
      duration: service.duration || service.estimatedDuration || "",
      mins: Number(service.mins || service.durationMinutes || 0) || 0,
      priceBySize: service.priceBySize || {},
      allowedArrivalTimes: Array.isArray(service.allowedArrivalTimes) ? service.allowedArrivalTimes : [],
      consumablesBySize: service.consumablesBySize || {},
      consumables: Array.isArray(service.consumables) ? service.consumables : [],
      category: String(
        service.category ||
          service.type ||
          service.group ||
          service.serviceCategory ||
          service.kind ||
          ""
      ).trim(),
      rawType: String(
        service.type || service.kind || service.serviceType || service.group || ""
      ).trim(),
      isPackageFlag:
        service.isPackage === true ||
        service.package === true ||
        service.is_bundle === true ||
        service.isBundle === true ||
        service.bundle === true,
      packageItemsCount:
        asArray(service.packageItems).length ||
        asArray(service.includedServices).length ||
        asArray(service.servicesIncluded).length ||
        asArray(service.items).length ||
        0,
    }));
}

function resolveServices(data, props) {
  return (
    props?.services ||
    props?.route?.params?.services ||
    data?.services ||
    data?.serviceCatalog ||
    data?.availableServices ||
    data?.allServices ||
    data?.bootstrap?.services ||
    []
  );
}

function formatMeta(service) {
  const parts = [];
  parts.push(`Price: ${formatPriceRangeLabel(service)}`);
  if (service.duration) parts.push(`Duration: ${service.duration}`);
  const arrivalTimes = normalizeAllowedArrivalTimes(service?.allowedArrivalTimes, service?.mins)
    .map((time) => formatTimeLabel(time))
    .join(", ");
  if (arrivalTimes) parts.push(`Arrival: ${arrivalTimes}`);
  return parts.join("  •  ");
}

function isPackageService(service) {
  if (!service) return false;
  if (service.isPackageFlag) return true;
  if (service.packageItemsCount > 0) return true;

  const category = normalizeText(service.category);
  const rawType = normalizeText(service.rawType);
  const explicitPackageValues = [
    "package",
    "packages",
    "bundle",
    "bundles",
    "combo",
    "combos",
    "set",
    "sets",
  ];

  return explicitPackageValues.includes(category) || explicitPackageValues.includes(rawType);
}

function getClientCategorySearchTerms(service) {
  const isPackage = isPackageService(service);
  const typeTerms = isPackage ? "Package Packages" : "Basic Service Basic Services Basic";
  const rawCategory = String(service?.category || "").trim();
  return `${typeTerms} ${rawCategory}`.trim();
}

function matchesPriceFilter(service, activePriceFilter) {
  if (activePriceFilter === "all") return true;
  if (!Number.isFinite(service.priceValue)) return false;
  if (activePriceFilter === "low") return service.priceValue < 2000;
  if (activePriceFilter === "mid") {
    return service.priceValue >= 2000 && service.priceValue <= 5000;
  }
  if (activePriceFilter === "high") return service.priceValue > 5000;
  return true;
}

export default function ClientServices(props) {
  const mobileData = useMobileDataHook() || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [activePriceFilter, setActivePriceFilter] = useState("all");

  const services = useMemo(
    () => normalizeServices(resolveServices(mobileData, props)),
    [mobileData, props]
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
      const categoryTerms = getClientCategorySearchTerms(service);
      const matchesQuery =
        !normalizedQuery ||
        service.name.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery) ||
        categoryTerms.toLowerCase().includes(normalizedQuery);

      const isPackage = isPackageService(service);
      const matchesType =
        activeTypeFilter === "all" ||
        (activeTypeFilter === "basic" && !isPackage) ||
        (activeTypeFilter === "packages" && isPackage);

      return matchesQuery && matchesType && matchesPriceFilter(service, activePriceFilter);
    });
  }, [services, searchQuery, activeTypeFilter, activePriceFilter]);

  const basicServices = useMemo(
    () => filteredServices.filter((service) => !isPackageService(service)),
    [filteredServices]
  );
  const packageServices = useMemo(
    () => filteredServices.filter((service) => isPackageService(service)),
    [filteredServices]
  );

  const renderServiceCard = (service) => (
    <View key={service.id} style={styles.serviceCard}>
      <Text style={styles.serviceTitle}>{service.name}</Text>
      <Text style={styles.serviceDescription}>{service.description}</Text>
      {formatMeta(service) ? (
        <Text style={styles.serviceMeta}>{formatMeta(service)}</Text>
      ) : null}
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.headerTitle}>Services</Text>
        <Text style={styles.headerSubtitle}>
          Choose a service and start a new booking right away.
        </Text>
      </View>

      <View style={styles.controlsWrap}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>Q</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Services..."
              placeholderTextColor="#98a0ae"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showFilters ? styles.filterButtonActive : null,
            ]}
            activeOpacity={0.85}
            onPress={() => setShowFilters((value) => !value)}
          >
            <Text style={styles.filterButtonText}>=</Text>
          </TouchableOpacity>
        </View>

        {Boolean(searchQuery.trim()) && filteredServices.length === 0 && (
          <View style={{ marginTop: -4, marginBottom: 4, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#DC2626" }}>
              No services match "{searchQuery.trim()}". Try searching by name, description, or category (Basic Services or Packages).
            </Text>
          </View>
        )}

        {showFilters ? (
          <View style={styles.filterPanel}>
            <View>
              <Text style={styles.filterSectionTitle}>Type</Text>
              <View style={styles.chipRow}>
                {[
                  { key: "all", label: "All" },
                  { key: "basic", label: "Basic" },
                  { key: "packages", label: "Packages" },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.chip,
                      activeTypeFilter === filter.key ? styles.chipActive : null,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setActiveTypeFilter(filter.key)}
                  >
                    <Text style={styles.chipText}>{filter.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.filterSectionTitle}>Price</Text>
              <View style={styles.chipRow}>
                {[
                  { key: "all", label: "All Prices" },
                  { key: "low", label: "Below 2000" },
                  { key: "mid", label: "2000 - 5000" },
                  { key: "high", label: "Above 5000" },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.chip,
                      activePriceFilter === filter.key ? styles.chipActive : null,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setActivePriceFilter(filter.key)}
                  >
                    <Text style={styles.chipText}>{filter.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {filteredServices.length ? (
        <>
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Basic Services</Text>
            <Text style={styles.sectionSubtitle}>
              Individual services for specific vehicle care needs.
            </Text>
            {basicServices.length ? (
              basicServices.map(renderServiceCard)
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? "No basic services match your search."
                    : "No basic services matched your search or filters."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Packages</Text>
            <Text style={styles.sectionSubtitle}>
              Bundled service options for more complete care.
            </Text>
            {packageServices.length ? (
              packageServices.map(renderServiceCard)
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? "No packages match your search."
                    : "No packages matched your search or filters."}
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {searchQuery.trim()
              ? `No services match "${searchQuery.trim()}". Try searching by name, description, or category (Basic Services or Packages).`
              : "No services matched your search or filters."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
