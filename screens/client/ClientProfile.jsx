import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import styles from "../../styles/css/client/clientProfileStyles";
import OtpEmailConfirmModal from "../../components/common/OtpEmailConfirmModal.jsx";
import OtpCodeModal from "../../components/common/OtpCodeModal.jsx";
import {
  requestPasswordOtp,
  useMobileData,
  verifyPasswordOtp,
} from "../../context/MobileDataContext.jsx";

const CAR_SIZE_OPTIONS = [
  "Sedan / Small Car",
  "Midsize / Pickup / MPV",
  "SUV",
  "XL / Van / Semi Truck",
];

function normalizeCar(car = {}) {
  return {
    vehicle: String(car.vehicle || "").trim(),
    plate: String(car.plate || "").trim().toUpperCase(),
    size: String(car.size || "").trim(),
  };
}

function createEmptyCar() {
  return { vehicle: "", plate: "", size: "" };
}

export default function ClientProfile({ session }) {
  const { currentUser, updateProfile, updateOwnPassword } = useMobileData();
  const accountEmail = String(currentUser?.email || session?.email || "").trim().toLowerCase();
  const initial = useMemo(() => {
    const email = String(currentUser?.email || session?.email || "C");
    return email.slice(0, 1).toUpperCase();
  }, [currentUser?.email, session?.email]);

  const initialProfile = useMemo(() => {
    const first = currentUser?.first || session?.first || session?.firstName || "";
    const last = currentUser?.last || session?.last || session?.lastName || "";
    const email = currentUser?.email || session?.email || "";
    const phone = currentUser?.phone || session?.phone || "";
    const cars = Array.isArray(currentUser?.cars) ? currentUser.cars.map(normalizeCar) : [];
    return { first, last, email, phone, cars };
  }, [currentUser, session]);

  const [first, setFirst] = useState(initialProfile.first);
  const [last, setLast] = useState(initialProfile.last);
  const [email, setEmail] = useState(initialProfile.email);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [cars, setCars] = useState(initialProfile.cars);
  const [carDraft, setCarDraft] = useState(createEmptyCar());

  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [otpRequestVisible, setOtpRequestVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpRequestError, setOtpRequestError] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpVerificationId, setOtpVerificationId] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [pendingPayload, setPendingPayload] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState(initialProfile);

  const [touched, setTouched] = useState({
    first: false,
    last: false,
    email: false,
    phone: false,
    pass: false,
    confirmPass: false,
  });
  const [carTouched, setCarTouched] = useState({
    vehicle: false,
    plate: false,
    size: false,
  });

  useEffect(() => {
    if (!isEditing) {
      setFirst(initialProfile.first);
      setLast(initialProfile.last);
      setEmail(initialProfile.email);
      setPhone(initialProfile.phone);
      setCars(initialProfile.cars);
      setCarDraft(createEmptyCar());
      setSnapshot(initialProfile);
    }
  }, [initialProfile, isEditing]);

  const clean = (v) => String(v ?? "").trim();
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const passwordChecks = (v) => {
    const s = String(v || "");
    const okLen = s.length >= 8;
    const okUpper = /[A-Z]/.test(s);
    const okLower = /[a-z]/.test(s);
    const okSpecial = /[^A-Za-z0-9]/.test(s);
    return { okLen, okUpper, okLower, okSpecial };
  };

  const passwordError = (v) => {
    const s = String(v || "");
    if (!s) return "";
    const c = passwordChecks(s);
    if (c.okLen && c.okUpper && c.okLower && c.okSpecial) return "";

    const missing = [];
    if (!c.okLen) missing.push("- At least 8 characters");
    if (!c.okUpper) missing.push("- At least 1 uppercase letter (A-Z)");
    if (!c.okLower) missing.push("- At least 1 lowercase letter (a-z)");
    if (!c.okSpecial) missing.push("- At least 1 special character (!@#...)");
    return `Password must include:\n${missing.join("\n")}`;
  };

  const onPhone = (v) => {
    const digits = String(v || "").replace(/\D/g, "").slice(0, 11);
    setPhone(digits);
    if (isEditing) setTouched((t) => ({ ...t, phone: true }));
  };

  const carDraftErrors = useMemo(() => {
    if (!isEditing) return {};

    const next = {};
    if (carTouched.vehicle && !clean(carDraft.vehicle)) next.vehicle = "Vehicle model is required.";
    if (carTouched.plate && !clean(carDraft.plate)) next.plate = "Plate number is required.";
    if (carTouched.size && !clean(carDraft.size)) next.size = "Please select a car size.";
    return next;
  }, [carDraft, carTouched, isEditing]);

  const errors = useMemo(() => {
    if (!isEditing) return {};

    const e = {};
    const f = clean(first);
    const l = clean(last);
    const em = clean(email);
    const ph = clean(phone);
    const pw = String(pass || "");
    const cpw = String(confirmPass || "");

    if (touched.first && f && f.length < 2) e.first = "First name must be at least 2 characters.";
    if (touched.last && l && l.length < 2) e.last = "Last name must be at least 2 characters.";
    if (touched.email && em && !isValidEmail(em)) e.email = "Please enter a valid email address.";

    if (touched.phone && ph) {
      if (!/^\d+$/.test(ph)) e.phone = "Phone must contain numbers only.";
      if (ph.length < 10) e.phone = "Please enter a valid phone number.";
    }

    if (touched.pass) {
      const pe = passwordError(pw);
      if (pe) e.pass = pe;
    }

    if (pw) {
      if (touched.confirmPass && !cpw) e.confirmPass = "Please confirm your password.";
      if (touched.confirmPass && cpw && cpw !== pw) e.confirmPass = "Passwords do not match.";
    }

    return e;
  }, [isEditing, first, last, email, phone, pass, confirmPass, touched]);

  const addCar = () => {
    setCarTouched({ vehicle: true, plate: true, size: true });

    const nextCar = normalizeCar(carDraft);
    if (!nextCar.vehicle || !nextCar.plate || !nextCar.size) {
      Alert.alert("Incomplete car details", "Please complete the vehicle model, plate number, and car size.");
      return;
    }

    const exists = cars.some(
      (car) => String(car.plate || "").trim().toUpperCase() === nextCar.plate
    );
    if (exists) {
      Alert.alert("Duplicate car", "A saved car with that plate number already exists.");
      return;
    }

    setCars((prev) => [...prev, nextCar]);
    setCarDraft(createEmptyCar());
    setCarTouched({ vehicle: false, plate: false, size: false });
  };

  const removeCar = (plate) => {
    setCars((prev) => prev.filter((car) => car.plate !== plate));
  };

  const onCancel = () => {
    setFirst(snapshot.first);
    setLast(snapshot.last);
    setEmail(snapshot.email);
    setPhone(snapshot.phone);
    setCars(snapshot.cars || []);
    setCarDraft(createEmptyCar());

    setPass("");
    setConfirmPass("");
    setShowPass(false);
    setShowConfirmPass(false);

    setTouched({
      first: false,
      last: false,
      email: false,
      phone: false,
      pass: false,
      confirmPass: false,
    });
    setCarTouched({
      vehicle: false,
      plate: false,
      size: false,
    });

    setIsEditing(false);
  };

  const closeOtpModal = () => {
    if (otpBusy) return;
    setOtpModalVisible(false);
    setOtpCode("");
    setOtpError("");
    setOtpVerificationId("");
    setOtpDestination("");
    setPendingPayload(null);
  };

  const closeOtpRequestModal = () => {
    if (otpBusy) return;
    setOtpRequestVisible(false);
    setOtpRequestError("");
    setOtpVerificationId("");
    setOtpDestination("");
    setPendingPayload(null);
  };

  const finishSave = (payload) => {
    updateProfile(payload)
      .then(() => {
        Alert.alert("Saved", "Profile and saved car details updated.");
        setIsEditing(false);
        setPass("");
        setConfirmPass("");
        setShowPass(false);
        setShowConfirmPass(false);
        setCarDraft(createEmptyCar());
        setTouched({
          first: false,
          last: false,
          email: false,
          phone: false,
          pass: false,
          confirmPass: false,
        });
        setCarTouched({
          vehicle: false,
          plate: false,
          size: false,
        });
        closeOtpModal();
      })
      .catch((error) => {
        Alert.alert("Save failed", error.message || "Could not update your account.");
      });
  };

  const sendPasswordOtp = (payload, { resend = false } = {}) => {
    setPendingPayload(payload);
    setOtpVerificationId("");
    setOtpDestination(accountEmail);
    if (resend) {
      setOtpError("");
    } else {
      setOtpCode("");
      setOtpError("");
      setOtpRequestError("");
    }
    setOtpBusy(true);
    requestPasswordOtp({
      email: accountEmail,
      purpose: "change-password",
      channel: "email",
    })
      .then((result) => {
        setOtpVerificationId(result.verificationId || "");
        setOtpDestination(result.destination || accountEmail);
        setOtpError("");
        if (!resend) {
          setOtpRequestVisible(false);
        }
        setOtpModalVisible(true);
      })
      .catch((error) => {
        setOtpVerificationId("");
        if (resend) {
          setOtpError(error.message || "Could not send the security code.");
        } else {
          setOtpRequestError(error.message || "Could not send the security code.");
        }
      })
      .finally(() => {
        setOtpBusy(false);
      });
  };

  const confirmPasswordOtp = () => {
    const code = clean(otpCode);
    if (!code) {
      setOtpError("OTP code is required.");
      return;
    }

    setOtpBusy(true);
    verifyPasswordOtp({
      email: accountEmail,
      verificationId: otpVerificationId,
      otp: code,
      purpose: "change-password",
    })
      .then(() =>
        updateOwnPassword?.({
          password: pendingPayload?.password,
          verificationId: otpVerificationId,
          otp: code,
        })
      )
      .then(() => {
        Alert.alert("Password updated", "Password updated successfully.");
        setIsEditing(false);
        setPass("");
        setConfirmPass("");
        setShowPass(false);
        setShowConfirmPass(false);
        setTouched({
          first: false,
          last: false,
          email: false,
          phone: false,
          pass: false,
          confirmPass: false,
        });
        setCarDraft(createEmptyCar());
        setCarTouched({ vehicle: false, plate: false, size: false });
        closeOtpModal();
      })
      .catch((error) => {
        setOtpError(error.message || "Invalid code. Try again.");
      })
      .finally(() => {
        setOtpBusy(false);
      });
  };

  const buildProfilePayload = ({ includePassword = false } = {}) => ({
      first: clean(first),
      last: clean(last),
      email: clean(email),
      phone: clean(phone),
      cars: cars.map(normalizeCar),
      ...(includePassword ? { password: clean(pass) } : {}),
    });

  const validateProfileDetails = () => {
    const payload = buildProfilePayload();

    if (!payload.first || payload.first.length < 2) {
      Alert.alert("Invalid name", "First name must be at least 2 characters.");
      return null;
    }
    if (!payload.last || payload.last.length < 2) {
      Alert.alert("Invalid name", "Last name must be at least 2 characters.");
      return null;
    }
    if (!isValidEmail(payload.email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return null;
    }
    if (payload.phone && (payload.phone.length < 10 || !/^\d+$/.test(payload.phone))) {
      Alert.alert("Invalid phone", "Please enter a valid phone number.");
      return null;
    }

    if (clean(carDraft.vehicle) || clean(carDraft.plate) || clean(carDraft.size)) {
      setCarTouched({ vehicle: true, plate: true, size: true });
      Alert.alert("Unsaved car details", "Add the car to your saved list first, or clear the car detail fields.");
      return null;
    }

    return payload;
  };

  const onChangePassword = () => {
    if (!isEditing) return;

    setTouched((prev) => ({
      ...prev,
      pass: true,
      confirmPass: true,
    }));

    const profilePayload = validateProfileDetails();
    if (!profilePayload) return;

    const nextPassword = clean(pass);
    if (!nextPassword) {
      Alert.alert("Password", "Please enter your new password.");
      return;
    }

    const pe = passwordError(nextPassword);
    if (pe) {
      Alert.alert("Weak password", pe);
      return;
    }

    if (!clean(confirmPass)) {
      Alert.alert("Confirm Password", "Please confirm your password.");
      return;
    }

    if (nextPassword !== clean(confirmPass)) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setPendingPayload({
      ...profilePayload,
      password: nextPassword,
    });
    setOtpRequestError("");
    setOtpRequestVisible(true);
  };

  const onSave = () => {
    if (!isEditing) {
      setSnapshot({ first, last, email, phone, cars });
      setIsEditing(true);
      return;
    }

    setTouched({
      first: true,
      last: true,
      email: true,
      phone: true,
      pass: false,
      confirmPass: false,
    });

    const payload = validateProfileDetails();
    if (!payload) return;

    finishSave(payload);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.body, { flexGrow: 1, paddingBottom: 170 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headBlock}>
        <Text style={styles.h1}>Profile</Text>
        <Text style={styles.h2}>Account details, saved cars, and booking setup.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          value={first}
          onChangeText={(v) => {
            setFirst(v);
            if (isEditing) setTouched((t) => ({ ...t, first: true }));
          }}
          placeholder="Enter your first name"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, errors.first && styles.inputError]}
          editable={isEditing}
          selectTextOnFocus={isEditing}
        />
        {!!errors.first && <Text style={styles.errorTxt}>{errors.first}</Text>}

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          value={last}
          onChangeText={(v) => {
            setLast(v);
            if (isEditing) setTouched((t) => ({ ...t, last: true }));
          }}
          placeholder="Enter your last name"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, errors.last && styles.inputError]}
          editable={isEditing}
          selectTextOnFocus={isEditing}
        />
        {!!errors.last && <Text style={styles.errorTxt}>{errors.last}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (isEditing) setTouched((t) => ({ ...t, email: true }));
          }}
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, errors.email && styles.inputError]}
          editable={isEditing}
          selectTextOnFocus={isEditing}
        />
        {!!errors.email && <Text style={styles.errorTxt}>{errors.email}</Text>}

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={onPhone}
          placeholder="09xx xxx xxxx"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          style={[styles.input, errors.phone && styles.inputError]}
          editable={isEditing}
          selectTextOnFocus={isEditing}
        />
        {!!errors.phone && <Text style={styles.errorTxt}>{errors.phone}</Text>}

        <Text style={styles.label}>Password</Text>
        {isEditing ? (
          <View style={styles.passRow}>
            <TextInput
              value={pass}
              onChangeText={(v) => {
                setPass(v);
                if (isEditing) setTouched((t) => ({ ...t, pass: true }));
              }}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPass}
              style={[styles.passInput, errors.pass && styles.inputError]}
              editable
              selectTextOnFocus
            />

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.showBtn}
              onPress={() => setShowPass((s) => !s)}
            >
              <Text style={styles.showTxt}>{showPass ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput value="••••••••" secureTextEntry style={styles.input} editable={false} />
        )}
        {!!errors.pass && <Text style={styles.errorTxt}>{errors.pass}</Text>}

        {isEditing && (
          <>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passRow}>
              <TextInput
                value={confirmPass}
                onChangeText={(v) => {
                  setConfirmPass(v);
                  setTouched((t) => ({ ...t, confirmPass: true }));
                }}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPass}
                style={[styles.passInput, errors.confirmPass && styles.inputError]}
                editable={isEditing}
                selectTextOnFocus={isEditing}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.showBtn}
                onPress={() => setShowConfirmPass((s) => !s)}
              >
                <Text style={styles.showTxt}>{showConfirmPass ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
            {!!errors.confirmPass && <Text style={styles.errorTxt}>{errors.confirmPass}</Text>}

            <TouchableOpacity activeOpacity={0.92} style={styles.changePasswordBtn} onPress={onChangePassword}>
              <Text style={styles.changePasswordTxt}>Change Password</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionTitle}>Saved Car Details</Text>
        <Text style={styles.sectionSub}>
          Save your vehicle details here so mobile booking can autofill them later.
        </Text>

        {cars.length ? (
          <View style={styles.carList}>
            {cars.map((car) => (
              <View key={car.plate} style={styles.carCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.carTitle}>{car.vehicle}</Text>
                  <Text style={styles.carMeta}>{car.plate}</Text>
                  <Text style={styles.carMeta}>{car.size}</Text>
                </View>

                {isEditing ? (
                  <TouchableOpacity
                    activeOpacity={0.92}
                    style={styles.removeCarBtn}
                    onPress={() => removeCar(car.plate)}
                  >
                    <Text style={styles.removeCarTxt}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCarCard}>
            <Text style={styles.emptyCarTxt}>No saved cars yet. Add one to speed up booking and service tracking.</Text>
          </View>
        )}

        {isEditing ? (
          <>
            <Text style={styles.label}>Vehicle Model</Text>
            <TextInput
              value={carDraft.vehicle}
              onChangeText={(value) => {
                setCarDraft((prev) => ({ ...prev, vehicle: value }));
                setCarTouched((prev) => ({ ...prev, vehicle: true }));
              }}
              placeholder="e.g., Toyota Vios / Honda Civic"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, carDraftErrors.vehicle && styles.inputError]}
            />
            {!!carDraftErrors.vehicle && <Text style={styles.errorTxt}>{carDraftErrors.vehicle}</Text>}

            <Text style={styles.label}>Plate Number</Text>
            <TextInput
              value={carDraft.plate}
              onChangeText={(value) => {
                setCarDraft((prev) => ({ ...prev, plate: String(value || "").toUpperCase() }));
                setCarTouched((prev) => ({ ...prev, plate: true }));
              }}
              placeholder="e.g., XYZ 1234"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              style={[styles.input, carDraftErrors.plate && styles.inputError]}
            />
            {!!carDraftErrors.plate && <Text style={styles.errorTxt}>{carDraftErrors.plate}</Text>}

            <Text style={styles.label}>Car Size</Text>
            <View style={styles.sizeRow}>
              {CAR_SIZE_OPTIONS.map((size) => {
                const active = carDraft.size === size;
                return (
                  <TouchableOpacity
                    key={size}
                    activeOpacity={0.92}
                    style={[styles.sizeChip, active && styles.sizeChipActive]}
                    onPress={() => {
                      setCarDraft((prev) => ({ ...prev, size }));
                      setCarTouched((prev) => ({ ...prev, size: true }));
                    }}
                  >
                    <Text style={[styles.sizeChipTxt, active && styles.sizeChipTxtActive]}>{size}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!carDraftErrors.size && <Text style={styles.errorTxt}>{carDraftErrors.size}</Text>}

            <TouchableOpacity activeOpacity={0.92} style={styles.addCarBtn} onPress={addCar}>
              <Text style={styles.addCarTxt}>Add Saved Car</Text>
            </TouchableOpacity>
          </>
        ) : null}

        <TouchableOpacity activeOpacity={0.92} style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveTxt}>{isEditing ? "Save Changes" : "Edit Account"}</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity activeOpacity={0.92} style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 12 }} />
      <OtpEmailConfirmModal
        visible={otpRequestVisible}
        title="Verify Email"
        subtitle="We will send a security code to verify your email."
        email={accountEmail}
        error={otpRequestError}
        busy={otpBusy}
        onClose={closeOtpRequestModal}
        onConfirm={() => pendingPayload && sendPasswordOtp(pendingPayload)}
      />
      <OtpCodeModal
        visible={otpModalVisible}
        title="Enter Security Code"
        subtitle={`Please check ${otpDestination || accountEmail || "your email"} for a message with your code.`}
        value={otpCode}
        error={otpError}
        busy={otpBusy}
        confirmEnabled={Boolean(otpVerificationId)}
        onChangeText={(value) => {
          setOtpCode(value.replace(/[^\d]/g, "").slice(0, 6));
          if (otpError) setOtpError("");
        }}
        onClose={closeOtpModal}
        onConfirm={confirmPasswordOtp}
        onResend={() => pendingPayload && sendPasswordOtp(pendingPayload, { resend: true })}
      />
    </ScrollView>
  );
}
