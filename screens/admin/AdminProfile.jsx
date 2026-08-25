// mobile/screens/admin/othermodules/AdminProfile.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import styles from "../../styles/css/admin/adminProfileStyles.js";
import { useMobileData } from "../../context/MobileDataContext.jsx";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  editable,
  error,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={String(value ?? "")}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA0A6"
        style={[
          styles.input,
          { color: "#111827" }, // ✅ FORCE VISIBLE TEXT
          error && styles.inputError,
        ]}
        autoCapitalize="none"
        keyboardType={keyboardType}
        editable={editable}
        selectTextOnFocus={editable}
      />
      {!!error && <Text style={styles.errorTxt}>{error}</Text>}
    </View>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  show,
  onToggle,
  editable,
  error,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.passRow}>
        <TextInput
          value={String(value ?? "")}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA0A6"
          style={[
            styles.input,
            styles.passInput,
            { color: "#111827" }, // ✅ FORCE VISIBLE TEXT
            error && styles.inputError,
          ]}
          autoCapitalize="none"
          secureTextEntry={!show}
          editable={editable}
          selectTextOnFocus={editable}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onToggle}
          style={styles.showBtn}
          disabled={!editable}
        >
          <Text style={styles.showTxt}>{show ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      {!!error && <Text style={styles.errorTxt}>{error}</Text>}
    </View>
  );
}

export default function AdminProfile({ session }) {
  const { currentUser, updateProfile } = useMobileData();
  const initial = useMemo(() => {
    const first = currentUser?.first || session?.first || session?.firstName || "";
    const last = currentUser?.last || session?.last || session?.lastName || "";
    const email = currentUser?.email || session?.email || "";
    const phone = currentUser?.phone || session?.phone || "";
    return { first, last, email, phone };
  }, [currentUser, session]);

  const [first, setFirst] = useState(initial.first);
  const [last, setLast] = useState(initial.last);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);

  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState(initial);

  // ✅ Sync from session (safe)
  useEffect(() => {
    const firstS = session?.first || session?.firstName || "";
    const lastS = session?.last || session?.lastName || "";
    const emailS = session?.email || "";
    const phoneS = session?.phone || "";

    if (!isEditing) {
      setFirst(firstS);
      setLast(lastS);
      setEmail(emailS);
      setPhone(phoneS);
      setSnapshot({ first: firstS, last: lastS, email: emailS, phone: phoneS });
    }
  }, [session, isEditing]);

  const [touched, setTouched] = useState({
    first: false,
    last: false,
    email: false,
    phone: false,
    pass: false,
    confirmPass: false,
  });

  const initialLetter = useMemo(() => {
    const base = String(first || email || "A").trim();
    return base ? base[0].toUpperCase() : "A";
  }, [first, email]);

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
    if (!c.okLen) missing.push("• At least 8 characters");
    if (!c.okUpper) missing.push("• At least 1 uppercase letter (A-Z)");
    if (!c.okLower) missing.push("• At least 1 lowercase letter (a-z)");
    if (!c.okSpecial) missing.push("• At least 1 special character (!@#...)");

    return `Password must include:\n${missing.join("\n")}`;
  };

  const errors = useMemo(() => {
    if (!isEditing) return {};

    const e = {};
    const f = clean(first);
    const l = clean(last);
    const em = clean(email);
    const ph = clean(phone);
    const pw = String(pass || "");
    const cpw = String(confirmPass || "");

    if (touched.first && f && f.length < 2)
      e.first = "First name must be at least 2 characters.";
    if (touched.last && l && l.length < 2)
      e.last = "Last name must be at least 2 characters.";

    if (touched.email && em && !isValidEmail(em))
      e.email = "Please enter a valid email address.";

    if (touched.phone && ph) {
      if (!/^\d+$/.test(ph)) e.phone = "Phone must contain numbers only.";
      if (ph.length < 10) e.phone = "Please enter a valid phone number.";
    }

    if (touched.pass) {
      const pe = passwordError(pw);
      if (pe) e.pass = pe;
    }

    if (pw) {
      if (touched.confirmPass && !cpw)
        e.confirmPass = "Please confirm your password.";
      if (touched.confirmPass && cpw && cpw !== pw)
        e.confirmPass = "Passwords do not match.";
    }

    return e;
  }, [isEditing, first, last, email, phone, pass, confirmPass, touched]);

  const onCancel = () => {
    setFirst(snapshot.first);
    setLast(snapshot.last);
    setEmail(snapshot.email);
    setPhone(snapshot.phone);

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

    setIsEditing(false);
  };

  const onSave = () => {
    if (!isEditing) {
      setSnapshot({ first, last, email, phone });
      setIsEditing(true);
      return;
    }

    setTouched({
      first: true,
      last: true,
      email: true,
      phone: true,
      pass: true,
      confirmPass: true,
    });

    const payload = {
      first: clean(first),
      last: clean(last),
      email: clean(email),
      phone: clean(phone),
      password: clean(pass),
    };

    if (!payload.first || payload.first.length < 2)
      return Alert.alert("Invalid name", "First name must be at least 2 characters.");
    if (!payload.last || payload.last.length < 2)
      return Alert.alert("Invalid name", "Last name must be at least 2 characters.");
    if (!isValidEmail(payload.email))
      return Alert.alert("Invalid email", "Please enter a valid email address.");
    if (payload.phone && (payload.phone.length < 10 || !/^\d+$/.test(payload.phone)))
      return Alert.alert("Invalid phone", "Please enter a valid phone number.");

    if (payload.password) {
      const pe = passwordError(payload.password);
      if (pe) return Alert.alert("Weak password", pe);

      if (!clean(confirmPass))
        return Alert.alert("Confirm Password", "Please confirm your password.");
      if (payload.password !== clean(confirmPass))
        return Alert.alert("Mismatch", "Passwords do not match.");
    }

    updateProfile(payload)
      .then(() => {
        Alert.alert("Saved", "Account details updated.");
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
      })
      .catch((error) => {
        Alert.alert("Save failed", error.message || "Could not update account details.");
      });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.body, { flexGrow: 1, paddingBottom: 140 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.head}>
        <Text style={styles.h1}>Profile</Text>
        <Text style={styles.h2}>Account details and settings.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initialLetter}</Text>
          </View>
        </View>

        <Field
          label="First Name"
          value={first}
          onChangeText={(v) => {
            setFirst(v);
            if (isEditing) setTouched((t) => ({ ...t, first: true }));
          }}
          placeholder="Enter your first name"
          editable={isEditing}
          error={errors.first}
        />

        <Field
          label="Last Name"
          value={last}
          onChangeText={(v) => {
            setLast(v);
            if (isEditing) setTouched((t) => ({ ...t, last: true }));
          }}
          placeholder="Enter your last name"
          editable={isEditing}
          error={errors.last}
        />

        <Field
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (isEditing) setTouched((t) => ({ ...t, email: true }));
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          editable={isEditing}
          error={errors.email}
        />

        <Field
          label="Phone"
          value={phone}
          onChangeText={(v) => {
            const digits = String(v || "").replace(/[^\d]/g, "").slice(0, 11);
            setPhone(digits);
            if (isEditing) setTouched((t) => ({ ...t, phone: true }));
          }}
          placeholder="09xx xxx xxxx"
          keyboardType="phone-pad"
          editable={isEditing}
          error={errors.phone}
        />

        <PasswordField
          label="Password"
          value={pass}
          onChangeText={(v) => {
            setPass(v);
            if (isEditing) setTouched((t) => ({ ...t, pass: true }));
          }}
          placeholder="Enter your password"
          show={showPass}
          onToggle={() => setShowPass((s) => !s)}
          editable={isEditing}
          error={errors.pass}
        />

        {isEditing && (
          <PasswordField
            label="Confirm Password"
            value={confirmPass}
            onChangeText={(v) => {
              setConfirmPass(v);
              setTouched((t) => ({ ...t, confirmPass: true }));
            }}
            placeholder="Re-enter your password"
            show={showConfirmPass}
            onToggle={() => setShowConfirmPass((s) => !s)}
            editable={isEditing}
            error={errors.confirmPass}
          />
        )}

        <TouchableOpacity activeOpacity={0.9} onPress={onSave} style={styles.primaryBtn}>
          <Text style={styles.primaryTxt}>
            {isEditing ? "Save Changes" : "Edit Account"}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity activeOpacity={0.9} onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
