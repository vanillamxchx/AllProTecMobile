import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from "react-native";

import styles from "../../styles/css/client/clientAddBookingStyles";
import { useMobileData } from "../../context/MobileDataContext.jsx";

const CAR_SIZE_OPTIONS = [
  "Sedan / Small Car",
  "Midsize / Pickup / MPV",
  "SUV",
  "XL / Van / Semi Truck",
];

const pad2 = (n) => String(n).padStart(2, "0");
const toKey = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function addMonths(date, delta) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  return d;
}

function monthLabel(d) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return toKey(a) === toKey(b);
}

function createEmptyForm(defaultService = "") {
  return {
    selectedCar: "",
    vehicle: "",
    plate: "",
    carSize: "",
    service: defaultService,
    notes: "",
  };
}

function SelectModal({ visible, title, options, value, onPick, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const active = String(opt) === String(value);
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.9}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    onPick?.(opt);
                    onClose?.();
                  }}
                >
                  <Text style={[styles.modalItemTxt, active && styles.modalItemTxtActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity activeOpacity={0.9} style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function ClientAddBooking({ onBack, onConfirm }) {
  const { services, currentUser, createBooking } = useMobileData();
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toKey(today), [today]);

  const bookableServices = useMemo(
    () => services.filter((item) => item?.name && item.enabled !== false),
    [services]
  );
  const serviceOptions = useMemo(
    () => bookableServices.map((item) => item.name),
    [bookableServices]
  );
  const savedCars = useMemo(
    () =>
      (Array.isArray(currentUser?.cars) ? currentUser.cars : []).filter(
        (car) => car?.vehicle && car?.plate
      ),
    [currentUser]
  );
  const carOptions = useMemo(
    () => savedCars.map((car) => `${car.vehicle} | ${String(car.plate).toUpperCase()}`),
    [savedCars]
  );

  const [form, setForm] = useState(() => createEmptyForm(serviceOptions[0] || ""));
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);

  const [touched, setTouched] = useState({
    date: false,
    vehicle: false,
    plate: false,
    carSize: false,
    service: false,
  });

  const [savedCarOpen, setSavedCarOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [carSizeOpen, setCarSizeOpen] = useState(false);

  const grid = useMemo(() => {
    const start = startOfMonth(month);
    const startDow = start.getDay();
    const dim = daysInMonth(month);

    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const dayNum = i - startDow + 1;
      if (dayNum < 1 || dayNum > dim) cells.push(null);
      else cells.push(new Date(month.getFullYear(), month.getMonth(), dayNum));
    }
    return cells;
  }, [month]);

  const selectedService = useMemo(
    () => bookableServices.find((item) => item.name === form.service),
    [bookableServices, form.service]
  );

  const total = Number(selectedService?.price || 0);

  const errors = useMemo(() => {
    const next = {};
    if (!selectedDate) next.date = "Please select a booking date.";
    else if (toKey(selectedDate) < todayKey) next.date = "Please choose today or a future date.";
    if (!String(form.vehicle || "").trim()) next.vehicle = "Vehicle model is required.";
    if (!String(form.plate || "").trim()) next.plate = "Plate number is required.";
    if (!String(form.carSize || "").trim()) next.carSize = "Please select a car size.";
    if (!String(form.service || "").trim()) next.service = "Please select a service.";
    return next;
  }, [form, selectedDate, todayKey]);

  const canConfirm = Object.keys(errors).length === 0;
  const showErr = (key) => Boolean(touched[key] && errors[key]);

  const handleSavedCarPick = (option) => {
    const selectedCar = savedCars.find(
      (car) => `${car.vehicle} | ${String(car.plate).toUpperCase()}` === option
    );
    setForm((prev) => ({
      ...prev,
      selectedCar: option,
      vehicle: selectedCar?.vehicle || prev.vehicle,
      plate: String(selectedCar?.plate || prev.plate).toUpperCase(),
      carSize: String(selectedCar?.size || prev.carSize || ""),
    }));
  };

  const confirm = async () => {
    setTouched({
      date: true,
      vehicle: true,
      plate: true,
      carSize: true,
      service: true,
    });

    if (!canConfirm) {
      Alert.alert("Incomplete booking", "Please complete the required booking details.");
      return;
    }

    try {
      await createBooking({
        customer: currentUser?.name || "Customer",
        customerEmail: currentUser?.email || "",
        date: toKey(selectedDate),
        vehicle: String(form.vehicle || "").trim(),
        carSize: String(form.carSize || "").trim(),
        plate: String(form.plate || "").trim().toUpperCase(),
        service: form.service,
        assigned: "",
        time: "",
        amount: total,
        status: "Pending",
        issueNote: String(form.notes || "").trim(),
        issueTypes: [],
        issueMarkers: [{ id: 1, x: 50, y: 50, issueType: "" }],
      });

      onConfirm?.({
        date: toKey(selectedDate),
        vehicle: String(form.vehicle || "").trim(),
        plate: String(form.plate || "").trim().toUpperCase(),
        carSize: String(form.carSize || "").trim(),
        service: form.service,
        amount: total,
      });
    } catch (error) {
      Alert.alert("Booking failed", error.message || "Failed to create booking.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.headRow}>
          <View style={styles.headLeft}>
            <Text style={styles.h1}>Book a Car Service</Text>
            <Text style={styles.h2}>Choose a saved car or enter a vehicle manually.</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Client</Text>
          <View style={styles.readOnlyWrap}>
            <Text style={styles.readOnlyTxt}>{currentUser?.name || "Customer"}</Text>
            <Text style={styles.readOnlySubTxt}>{currentUser?.email || "No email available"}</Text>
          </View>

          {carOptions.length > 0 && (
            <>
              <Text style={styles.label}>Saved Car</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.selectWrap}
                onPress={() => setSavedCarOpen(true)}
              >
                <Text style={[styles.selectTxt, !form.selectedCar && styles.selectTxtPlaceholder]}>
                  {form.selectedCar || "Select saved car"}
                </Text>
                <Text style={styles.chev}>v</Text>
              </TouchableOpacity>
              <Text style={styles.helperTxt}>
                Selecting a saved car will autofill the vehicle, plate number, and car size.
              </Text>
            </>
          )}

          <Text style={styles.label}>Vehicle Model*</Text>
          <View style={[styles.inputWrap, showErr("vehicle") && styles.inputError]}>
            <TextInput
              value={form.vehicle}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, selectedCar: "", vehicle: value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, vehicle: true }))}
              placeholder="e.g., Toyota Vios / Honda Civic"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>
          {showErr("vehicle") && <Text style={styles.errTxt}>{errors.vehicle}</Text>}

          <Text style={styles.label}>Plate Number*</Text>
          <View style={[styles.inputWrap, showErr("plate") && styles.inputError]}>
            <TextInput
              value={form.plate}
              onChangeText={(value) =>
                setForm((prev) => ({
                  ...prev,
                  selectedCar: "",
                  plate: String(value || "").toUpperCase(),
                }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, plate: true }))}
              placeholder="e.g., XYZ 1234"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              style={styles.input}
            />
          </View>
          {showErr("plate") && <Text style={styles.errTxt}>{errors.plate}</Text>}

          <Text style={styles.label}>Car Size*</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.selectWrap, showErr("carSize") && styles.inputError]}
            onPress={() => {
              setTouched((prev) => ({ ...prev, carSize: true }));
              setCarSizeOpen(true);
            }}
          >
            <Text style={[styles.selectTxt, !form.carSize && styles.selectTxtPlaceholder]}>
              {form.carSize || "Select car size"}
            </Text>
            <Text style={styles.chev}>v</Text>
          </TouchableOpacity>
          {showErr("carSize") && <Text style={styles.errTxt}>{errors.carSize}</Text>}

          <Text style={styles.label}>Service*</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.selectWrap, showErr("service") && styles.inputError]}
            onPress={() => {
              setTouched((prev) => ({ ...prev, service: true }));
              setServiceOpen(true);
            }}
          >
            <Text style={[styles.selectTxt, !form.service && styles.selectTxtPlaceholder]}>
              {form.service || "Select a service"}
            </Text>
            <Text style={styles.chev}>v</Text>
          </TouchableOpacity>
          {showErr("service") && <Text style={styles.errTxt}>{errors.service}</Text>}

          <Text style={styles.label}>Additional Notes</Text>
          <View style={styles.textAreaWrap}>
            <TextInput
              value={form.notes}
              onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))}
              placeholder="Optional issue note or request"
              placeholderTextColor="#9CA3AF"
              style={styles.textArea}
              multiline
            />
          </View>
        </View>

        <Text style={styles.sectionHelp}>Choose your preferred booking date*</Text>

        <View style={[styles.calendarCard, showErr("date") && styles.cardWarn]}>
          <View style={styles.calTopRow}>
            <Text style={styles.calTitle}>{monthLabel(month)}</Text>

            <View style={styles.calNav}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.navBtn}
                onPress={() => setMonth((m) => addMonths(m, -1))}
              >
                <Text style={styles.navTxt}>{"<"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.navBtn}
                onPress={() => setMonth((m) => addMonths(m, 1))}
              >
                <Text style={styles.navTxt}>{">"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dowRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.dowTxt}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {grid.map((cell, idx) => {
              if (!cell) return <View key={String(idx)} style={styles.dayCell} />;

              const cellKey = toKey(cell);
              const isPast = cellKey < todayKey;
              const active = isSameDay(cell, selectedDate);

              return (
                <TouchableOpacity
                  key={String(idx)}
                  activeOpacity={0.9}
                  disabled={isPast}
                  style={[
                    styles.dayCell,
                    styles.dayBtn,
                    active && styles.dayBtnActive,
                    isPast && styles.dayBtnDisabled,
                  ]}
                  onPress={() => {
                    setTouched((prev) => ({ ...prev, date: true }));
                    setSelectedDate(cell);
                  }}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      active && styles.dayNumActive,
                      isPast && styles.dayNumDisabled,
                    ]}
                  >
                    {cell.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {showErr("date") && <Text style={styles.errTxt}>{errors.date}</Text>}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>{total ? `PHP ${total.toLocaleString()}` : "PHP -"}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={confirm}
        >
          <Text style={styles.confirmTxt}>Confirm Booking</Text>
        </TouchableOpacity>

        <SelectModal
          visible={savedCarOpen}
          title="Select Saved Car"
          options={carOptions}
          value={form.selectedCar}
          onPick={handleSavedCarPick}
          onClose={() => setSavedCarOpen(false)}
        />

        <SelectModal
          visible={carSizeOpen}
          title="Select Car Size"
          options={CAR_SIZE_OPTIONS}
          value={form.carSize}
          onPick={(option) => setForm((prev) => ({ ...prev, carSize: option }))}
          onClose={() => setCarSizeOpen(false)}
        />

        <SelectModal
          visible={serviceOpen}
          title="Select a Service"
          options={serviceOptions}
          value={form.service}
          onPick={(option) => setForm((prev) => ({ ...prev, service: option }))}
          onClose={() => setServiceOpen(false)}
        />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}
