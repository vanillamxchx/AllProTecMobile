import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert } from "react-native";

import styles from "../../styles/css/client/clientServicesStyles";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import MobileFilterModal from "../../components/common/MobileFilterModal.jsx";

const ICON_SEARCH = require("../../styles/icons/search.png");
const ICON_FILTER = require("../../styles/icons/filter.png");

export default function ClientServices({ goTo }) {
  const { services, createBooking, currentUser } = useMobileData();
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ category: "All" });

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          services
            .filter((service) => service.enabled !== false)
            .map((service) => String(service.category || "").trim())
            .filter(Boolean)
        )
      ),
    [services]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return services.filter(
      (service) =>
        service.enabled !== false &&
        (filters.category === "All" || String(service.category || "").trim() === filters.category) &&
        `${service.name} ${service.desc}`.toLowerCase().includes(q)
    );
  }, [services, query, filters]);

  const onBook = async (service) => {
    try {
      await createBooking({
        customer: currentUser?.name || "Customer",
        customerEmail: currentUser?.email || "",
        vehicle: "Vehicle to be confirmed",
        plate: "",
        service: service.name,
        assigned: "",
        date: new Date().toISOString().slice(0, 10),
        time: "08:00",
        amount: Number(service.price || 0),
        status: "Scheduled",
      });
      Alert.alert("Booked", `${service.name} has been added to your bookings.`);
      goTo?.("bookings");
    } catch (error) {
      Alert.alert("Booking failed", error.message || "Could not create booking.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.headBlock}>
        <Text style={styles.h1}>Services</Text>
        <Text style={styles.h2}>Service catalog and booking.</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Image source={ICON_SEARCH} style={styles.searchIcon} resizeMode="contain" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Services..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Image source={ICON_FILTER} style={styles.filterIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {filtered.map((service) => (
        <View key={service.id} style={styles.card}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDesc}>{service.desc}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.metaText}>
              Price: PHP {Number(service.price || 0).toLocaleString()} - Est: {Number(service.mins || 0)} mins
            </Text>

            <TouchableOpacity activeOpacity={0.9} style={styles.bookBtn} onPress={() => onBook(service)}>
              <Text style={styles.bookTxt}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <MobileFilterModal
        open={filterOpen}
        title="Filter Services"
        values={filters}
        fields={[
          { key: "category", label: "CATEGORY", options: categoryOptions },
        ]}
        onClose={() => setFilterOpen(false)}
        onApply={(nextValues) => {
          setFilters(nextValues);
          setFilterOpen(false);
        }}
      />

      <View style={{ height: 12 }} />
    </ScrollView>
  );
}
