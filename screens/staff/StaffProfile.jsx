// mobile/screens/staff/othermodules/StaffProfile.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import styles from "../../styles/css/staff/staffProfileStyles";
import OtpEmailConfirmModal from "../../components/common/OtpEmailConfirmModal.jsx";
import OtpCodeModal from "../../components/common/OtpCodeModal.jsx";
import {
  requestPasswordOtp,
  useMobileData,
  verifyPasswordOtp,
} from "../../context/MobileDataContext.jsx";

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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA0A6"
        style={[styles.input, error && styles.inputError]}
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
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA0A6"
          style={[styles.input, styles.passInput, error && styles.inputError]}
          autoCapitalize="none"
          secureTextEntry={!show}
          editable={editable}
          selectTextOnFocus={editable}
        />

        {editable ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onToggle}
            style={styles.showBtn}
          >
            <Text style={styles.showTxt}>{show ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!!error && <Text style={styles.errorTxt}>{error}</Text>}
    </View>
  );
}

export default function StaffProfile({ session }) {
  const { currentUser, updateProfile, updateOwnPassword } = useMobileData();
  const accountEmail = String(currentUser?.email || session?.email || "").trim().toLowerCase();
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
  const [snapshot, setSnapshot] = useState(initial);

  // ✅ sync profile fields when session arrives/changes
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
    const base = String(first || email || "S").trim();
    return base ? base[0].toUpperCase() : "S";
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
        closeOtpModal();
      })
      .catch((error) => {
        Alert.alert("Save failed", error.message || "Could not update account details.");
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
        const { password: _password, confirmPassword: _confirmPassword, ...profilePayload } = pendingPayload || {};
        return updateProfile(profilePayload);
      })
      .then(() => {
        Alert.alert("Saved", "Profile and password updated successfully.");
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
        closeOtpModal();
      })
      .catch((error) => {
        setOtpError(error.message || "Invalid code. Try again.");
      })
      .finally(() => {
        setOtpBusy(false);
      });
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

    if (payload.password) {
      setPendingPayload(payload);
      setOtpRequestError("");
      setOtpRequestVisible(true);
      return;
    }

    finishSave(payload);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.body, { flexGrow: 1, paddingBottom: 170 }]}
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
          value={isEditing ? pass : "••••••••"}
          onChangeText={(v) => {
            setPass(v);
            if (isEditing) setTouched((t) => ({ ...t, pass: true }));
          }}
          placeholder={isEditing ? "Enter your password" : ""}
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

      <View style={{ height: 26 }} />
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
