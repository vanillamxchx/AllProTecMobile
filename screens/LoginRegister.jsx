// screens/LogInRegister.js (or LoginRegister.jsx) — UPDATED
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Alert,
  ImageBackground,
} from "react-native";

import AuthHeader from "../components/AuthHeader.jsx";
import AuthFooter from "../components/AuthFooter.jsx";
import styles from "../styles/css/loginRegisterStyles.js";
import {
  checkEmailRegistered,
  loginWithApi,
  requestPasswordOtp,
  resetPasswordWithOtp,
  requestSignupOtp,
  verifyPasswordOtp,
  verifySignupOtp,
} from "../context/MobileDataContext.jsx";
import {
  apiRequest,
  getApiBaseUrl,
  getDefaultApiPort,
  getSuggestedApiBaseUrl,
  isApiReachabilityError,
  isReleaseBuildTarget,
  setApiBaseUrl,
  subscribeToApiBaseUrl,
} from "../services/api.js";

const AUTH_BG = require("../styles/images/bg.png");
/* =======================
   Small UI Helpers
======================= */
function TabBtn({ active, label, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, error }) {
  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA0A6"
        style={[styles.input, error && styles.inputError]}
        autoCapitalize="none"
        keyboardType={keyboardType}
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
  error,
  below,
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
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onToggle}
          style={styles.showBtn}
        >
          <Text style={styles.showTxt}>{show ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      {!!error && <Text style={styles.errorTxt}>{error}</Text>}
      {!!below && below}
    </View>
  );
}

/* =======================
   Validators + Helpers
======================= */
const clean = (v) => String(v ?? "").trim();

const emailOk = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

const phoneOk = (v) => {
  const p = String(v || "").trim();
  return p.length === 11 && p.startsWith("09") && /^\d{11}$/.test(p);
};

const validateName = (label, value) => {
  const v = clean(value);
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} must be at least 2 characters.`;
  if (v.length > 55) return `${label} must be at most 55 characters.`;
  return "";
};

const passRules = (v) => {
  const s = String(v || "");
  return {
    min8: s.length >= 8,
    upper: /[A-Z]/.test(s),
    lower: /[a-z]/.test(s),
    special: /[^A-Za-z0-9]/.test(s),
  };
};

const passStrong = (v) => {
  const r = passRules(v);
  return r.min8 && r.upper && r.lower && r.special;
};

function PasswordRulesBox({ rules }) {
  if (!rules) return null;
  return (
    <View style={styles.rulesBox}>
      <Text style={styles.rulesTitle}>Password must include:</Text>

      <View style={styles.ruleRow}>
        <Text style={[styles.ruleDot, rules.min8 ? styles.ruleOk : styles.ruleBad]}>•</Text>
        <Text style={[styles.ruleText, rules.min8 ? styles.ruleOkTxt : styles.ruleBadTxt]}>
          At least 8 characters
        </Text>
      </View>

      <View style={styles.ruleRow}>
        <Text style={[styles.ruleDot, rules.upper ? styles.ruleOk : styles.ruleBad]}>•</Text>
        <Text style={[styles.ruleText, rules.upper ? styles.ruleOkTxt : styles.ruleBadTxt]}>
          At least 1 uppercase letter (A–Z)
        </Text>
      </View>

      <View style={styles.ruleRow}>
        <Text style={[styles.ruleDot, rules.lower ? styles.ruleOk : styles.ruleBad]}>•</Text>
        <Text style={[styles.ruleText, rules.lower ? styles.ruleOkTxt : styles.ruleBadTxt]}>
          At least 1 lowercase letter (a–z)
        </Text>
      </View>

      <View style={styles.ruleRow}>
        <Text style={[styles.ruleDot, rules.special ? styles.ruleOk : styles.ruleBad]}>•</Text>
        <Text style={[styles.ruleText, rules.special ? styles.ruleOkTxt : styles.ruleBadTxt]}>
          At least 1 special character (!@#…)
        </Text>
      </View>
    </View>
  );
}

const ALL_STAFF_ROLE_STRINGS = new Set([
  "staff",
  "mechanic",
  "inspector",
  "coordinator",
  "detailer",
  "technician",
  "employee",
  "manager",
  "senior staff",
  "junior staff",
  "general manager",
  "sales manager",
  "sales associate",
  "inventory clerk",
  "junior detailer",
  "senior detailer",
  "marketing",
]);

const normalizePermission = (userType, role) => {
  const normalizedUserType = String(userType || "").trim().toLowerCase();
  if (["admin", "staff", "client", "customer"].includes(normalizedUserType)) {
    return normalizedUserType === "customer" ? "client" : normalizedUserType;
  }

  const normalizedRole = String(role || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (["admin", "owner", "co-owner"].includes(normalizedRole)) return "admin";
  if (ALL_STAFF_ROLE_STRINGS.has(normalizedRole)) return "staff";
  return "client";
};

const MAX_FP_ATTEMPTS = 3;
const FP_LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
let moduleFpLockUntil = 0;
let moduleFpAttempts = 0;

/* =======================
   Screen
======================= */
export default function LoginRegister({ onLoginSuccess }) {
  const releaseBuild = isReleaseBuildTarget();
  const [mode, setMode] = useState("login");

  // shared
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // ✅ NEW: show password rules only after typing in register
  const [passTouched, setPassTouched] = useState(false);

  // register
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // errors
  const [errors, setErrors] = useState({});

  // SIGN UP OTP flow: "" | "email" | "code"
  const [otpStep, setOtpStep] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpVerificationId, setOtpVerificationId] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);


  // ✅ FORGOT PASSWORD flow: "" | "email" | "code"
  const [fpStep, setFpStep] = useState("");
  const [fpEmail, setFpEmail] = useState("");
  const [fpInput, setFpInput] = useState("");
  const [fpVerificationId, setFpVerificationId] = useState("");
  const [fpDestination, setFpDestination] = useState("");
  const [fpPassword, setFpPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpBusy, setFpBusy] = useState(false);
  const [fpShowPassword, setFpShowPassword] = useState(false);
  const [fpShowConfirmPassword, setFpShowConfirmPassword] = useState(false);
  const [fpPassTouched, setFpPassTouched] = useState(false);
  const [fpAttempts, setFpAttempts] = useState(moduleFpAttempts);
  const [fpLockUntil, setFpLockUntil] = useState(moduleFpLockUntil);
  const [fpCooldownSeconds, setFpCooldownSeconds] = useState(() =>
    Math.max(0, Math.ceil((moduleFpLockUntil - Date.now()) / 1000))
  );

  const formatFpTimer = (totalSeconds) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isFpLocked = fpCooldownSeconds > 0;
  const fpCooldownText = isFpLocked
    ? `Maximum attempts reached. Please wait ${formatFpTimer(fpCooldownSeconds)} before a new one can be requested.`
    : "";

  const triggerFpLock = (durationMs = FP_LOCK_DURATION_MS) => {
    const until = Date.now() + durationMs;
    moduleFpLockUntil = until;
    setFpLockUntil(until);
    const secs = Math.ceil(durationMs / 1000);
    setFpCooldownSeconds(secs);
  };

  React.useEffect(() => {
    if (!fpLockUntil) return;

    const tick = () => {
      const remainingMs = fpLockUntil - Date.now();
      const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));
      setFpCooldownSeconds(remainingSecs);

      if (remainingSecs <= 0) {
        moduleFpLockUntil = 0;
        moduleFpAttempts = 0;
        setFpLockUntil(0);
        setFpAttempts(0);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [fpLockUntil]);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(getApiBaseUrl());
  const [apiTestBusy, setApiTestBusy] = useState(false);
  const [apiStatus, setApiStatus] = useState("");
  const [apiStatusTone, setApiStatusTone] = useState("neutral");

  const { width } = useWindowDimensions();
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const stageW = useMemo(() => clamp(width, 320, 420), [width]);
  const compact = width <= 430;

  const resetErrors = () => setErrors({});

  React.useEffect(() => {
    setApiUrlInput(getApiBaseUrl());
    const unsubscribe = subscribeToApiBaseUrl((nextUrl) => {
      setApiUrlInput(nextUrl);
    });
    return unsubscribe;
  }, []);

  const setErrKey = (key, msg) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!msg) delete next[key];
      else next[key] = msg;
      return next;
    });
  };

  /* =======================
     LIVE handlers
  ======================= */
  const onEmailChange = (v) => {
    setEmail(v);
    const t = clean(v);
    if (!t) return setErrKey("email", "Email is required.");
    if (!emailOk(t)) return setErrKey("email", "Enter a valid email address.");
    setErrKey("email", "");
  };

  const onPhoneChange = (v) => {
    const digits = String(v || "").replace(/[^\d]/g, "").slice(0, 11);
    setPhone(digits);

    if (!digits) return setErrKey("phone", "Phone is required.");
    if (!digits.startsWith("09")) return setErrKey("phone", "Phone must start with 09.");
    if (digits.length < 11) return setErrKey("phone", "Phone must be 11 digits.");
    if (!phoneOk(digits)) return setErrKey("phone", "Phone must start with 09 and be 11 digits.");
    setErrKey("phone", "");
  };

  const onPassChange = (v) => {
    setPass(v);

    // ✅ only show rules after user starts typing (register only)
    if (mode === "register" && !passTouched && String(v || "").length > 0) {
      setPassTouched(true);
    }

    const t = clean(v);

    // ✅ do not show "not strong enough" until user typed at least once
    if (!t) setErrKey("pass", "Password is required.");
    else if (mode === "register" && passTouched && !passStrong(v))
      setErrKey("pass", "Password is not strong enough.");
    else setErrKey("pass", "");

    // live confirm match
    if (mode === "register" && clean(confirm)) {
      if (clean(confirm) !== t) setErrKey("confirm", "Passwords do not match.");
      else setErrKey("confirm", "");
    }
  };

  const onConfirmChange = (v) => {
    setConfirm(v);
    const t = clean(v);

    if (!t) return setErrKey("confirm", "Confirm password is required.");
    if (clean(pass) !== t) return setErrKey("confirm", "Passwords do not match.");
    setErrKey("confirm", "");
  };

  /* =======================
     Submit validation
  ======================= */
  const validateLogin = () => {
    const e = {};
    if (!clean(email)) e.email = "Email is required.";
    if (!clean(pass)) e.pass = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e = {};

    const firstErr = validateName("First name", first);
    if (firstErr) e.first = firstErr;

    const lastErr = validateName("Last name", last);
    if (lastErr) e.last = lastErr;

    if (!clean(email)) e.email = "Email is required.";
    else if (!emailOk(email)) e.email = "Enter a valid email address.";

    if (!clean(phone)) e.phone = "Phone is required.";
    else if (!phoneOk(phone)) e.phone = "Phone must start with 09 and be 11 digits.";

    if (!clean(pass)) e.pass = "Password is required.";
    else if (!passStrong(pass)) e.pass = "Password is not strong enough.";

    if (!clean(confirm)) e.confirm = "Confirm password is required.";
    else if (clean(pass) !== clean(confirm)) e.confirm = "Passwords do not match.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onLogin = () => {
    resetErrors();
    if (!validateLogin()) return;

    loginWithApi(clean(email), String(pass || ""))
      .then((payload) => {
        const user = payload.user || {};
        const permission = normalizePermission(user.userType, user.role);
        onLoginSuccess?.({
          ...user,
          token: String(payload.token || ""),
          userType: permission,
          role: permission,
          subRole: String(user.role || "").trim().toLowerCase(),
        });
      })
      .catch((error) => {
        const message = String(error?.message || "");
        if (message.toLowerCase().includes("not allowed by cors")) {
          setErrors({
            email: "",
            pass: "Railway blocked this Expo web origin. Add http://localhost:8081 to CORS_ORIGIN in Railway, or use the deployed web domain.",
          });
          return;
        }

        if (isApiReachabilityError(error)) {
          setErrors({
            email: "",
            pass: "Could not reach the Railway backend. Check that the API URL is https://autoflow-production-0606.up.railway.app.",
          });
          return;
        }

        const friendlyMessage = message || "Invalid email or password.";
        setErrors({ email: "", pass: friendlyMessage });
      });
  };

  // Create Account -> validate email in database, then start SIGN UP otp flow
  const onCreateAccount = async () => {
    if (createBusy || otpBusy) return;
    resetErrors();
    if (!validateRegister()) return;

    const targetEmail = clean(email).toLowerCase();
    setCreateBusy(true);

    try {
      // 1. Validate if the email is already registered using dedicated check endpoints
      const checkResult = await checkEmailRegistered(targetEmail);
      if (checkResult.checked && checkResult.isRegistered) {
        setErrKey("email", checkResult.message || "This email is already registered. Please sign in instead.");
        setCreateBusy(false);
        return;
      }

      // 2. Request signup OTP which validates uniqueness in MongoDB on backend
      const payload = await requestSignupOtp({
        firstName: clean(first),
        lastName: clean(last),
        email: targetEmail,
        phone: clean(phone),
        password: String(pass || ""),
        confirmPassword: String(confirm || ""),
        channel: "email",
      });

      setOtpEmail(targetEmail);
      setOtpVerificationId(payload?.verificationId || "");
      setOtpDestination(payload?.destination || targetEmail);
      setOtpInput("");
      setOtpStep("code");
      setErrKey("otp", "");
    } catch (error) {
      const message = String(error?.message || "");
      const lower = message.toLowerCase();

      if (
        lower.includes("already registered") ||
        lower.includes("already exist") ||
        lower.includes("already in use") ||
        lower.includes("already taken") ||
        lower.includes("duplicate") ||
        lower.includes("user exists") ||
        lower.includes("account exists") ||
        lower.includes("an account with this email") ||
        lower.includes("email is registered") ||
        lower.includes("email exists")
      ) {
        setErrKey("email", "This email is already registered. Please sign in instead.");
      } else if (isApiReachabilityError(error)) {
        setErrKey("email", "Could not reach the server. Please check your connection.");
      } else if (lower.includes("phone")) {
        setErrKey("phone", message);
      } else if (lower.includes("password")) {
        setErrKey("pass", message);
      } else {
        setErrKey("email", message || "Failed to validate account details.");
      }
    } finally {
      setCreateBusy(false);
    }
  };

  const onSendOtp = () => {
    if (otpBusy) return;
    setOtpBusy(true);

    requestSignupOtp({
      firstName: clean(first),
      lastName: clean(last),
      email: clean(email),
      phone: clean(phone),
      password: String(pass || ""),
      confirmPassword: String(confirm || ""),
      channel: "email",
    })
      .then((payload) => {
        setOtpVerificationId(payload.verificationId || "");
        setOtpDestination(payload.destination || clean(email));
        setOtpInput("");
        setOtpStep("code");
        setErrKey("otp", "");
      })
      .catch((error) => {
        const message = String(error?.message || "");
        const lower = message.toLowerCase();
        if (
          lower.includes("already registered") ||
          lower.includes("already exist") ||
          lower.includes("already in use") ||
          lower.includes("already taken") ||
          lower.includes("duplicate") ||
          lower.includes("user exists") ||
          lower.includes("account exists")
        ) {
          closeOtp();
          setErrKey("email", "This email is already registered. Please sign in instead.");
        } else {
          setErrKey("otp", message || "Failed to send OTP.");
        }
      })
      .finally(() => {
        setOtpBusy(false);
      });
  };

  const onVerifyOtp = () => {
    if (otpBusy) return;
    const entered = clean(otpInput);

    if (!entered) return setErrKey("otp", "OTP code is required.");

    setOtpBusy(true);
    verifySignupOtp({
      verificationId: otpVerificationId,
      otp: entered,
    })
      .then((payload) => {
        const user = payload.user || {};
        const permission = normalizePermission(user.userType, user.role);
        setErrKey("otp", "");
        setOtpStep("");
        onLoginSuccess?.({
          ...user,
          userType: permission,
          role: permission,
          subRole: String(user.role || "").trim().toLowerCase(),
        });
      })
      .catch((error) => {
        setErrKey("otp", error.message || "Invalid code. Try again.");
      })
      .finally(() => {
        setOtpBusy(false);
      });
  };

  const closeOtp = () => {
    setOtpStep("");
    setOtpInput("");
    setOtpVerificationId("");
    setOtpDestination("");
    setErrKey("otp", "");
  };

  // ✅ FORGOT PASSWORD
  const openForgot = () => {
    resetErrors();
    setFpEmail(clean(email));
    setFpInput("");
    setFpVerificationId("");
    setFpDestination("");
    setFpPassword("");
    setFpConfirmPassword("");
    setFpShowPassword(false);
    setFpShowConfirmPassword(false);
    setFpPassTouched(false);
    setFpBusy(false);
    setFpStep("email");
  };

  const closeForgot = () => {
    setFpStep("");
    setFpInput("");
    setFpVerificationId("");
    setFpDestination("");
    setFpPassword("");
    setFpConfirmPassword("");
    setFpShowPassword(false);
    setFpShowConfirmPassword(false);
    setFpPassTouched(false);
    setFpBusy(false);
    setErrKey("fpEmail", "");
    setErrKey("fpCode", "");
    setErrKey("fpPass", "");
    setErrKey("fpConfirm", "");
  };

  const onFpPassChange = (v) => {
    setFpPassword(v);

    if (!fpPassTouched && String(v || "").length > 0) {
      setFpPassTouched(true);
    }

    const t = clean(v);
    if (!t) setErrKey("fpPass", "Password is required.");
    else if (fpPassTouched && !passStrong(v)) setErrKey("fpPass", "Password is not strong enough.");
    else setErrKey("fpPass", "");

    if (clean(fpConfirmPassword)) {
      if (clean(fpConfirmPassword) !== t) setErrKey("fpConfirm", "Passwords do not match.");
      else setErrKey("fpConfirm", "");
    }
  };

  const onFpConfirmPassChange = (v) => {
    setFpConfirmPassword(v);
    const t = clean(v);

    if (!t) return setErrKey("fpConfirm", "Confirm password is required.");
    if (clean(fpPassword) !== t) return setErrKey("fpConfirm", "Passwords do not match.");
    setErrKey("fpConfirm", "");
  };

  const onFpEmailChange = (v) => {
    setFpEmail(v);
    const t = clean(v);
    if (!t) return setErrKey("fpEmail", "Email is required.");
    if (!emailOk(t)) return setErrKey("fpEmail", "Enter a valid email address.");
    setErrKey("fpEmail", "");
  };

  const onFpCodeChange = (v) => {
    const digits = String(v || "").replace(/[^\d]/g, "").slice(0, 6);
    setFpInput(digits);

    if (!digits) {
      return setErrKey("fpCode", "OTP code is required.");
    }
    if (digits.length < 6) {
      return setErrKey("fpCode", "OTP code must be 6 digits in length.");
    }
    setErrKey("fpCode", "");
  };

  const onFpSendOtp = () => {
    if (fpBusy) return;

    if (isFpLocked) {
      setErrKey(fpStep === "code" ? "fpCode" : "fpEmail", fpCooldownText);
      return;
    }

    const t = clean(fpEmail);
    if (!t) return setErrKey("fpEmail", "Email is required.");
    if (!emailOk(t)) return setErrKey("fpEmail", "Enter a valid email address.");

    const nextAttempts = fpAttempts + 1;
    moduleFpAttempts = nextAttempts;
    setFpAttempts(nextAttempts);

    if (nextAttempts >= MAX_FP_ATTEMPTS) {
      triggerFpLock();
    }

    setFpBusy(true);
    requestPasswordOtp({
      email: t,
      purpose: "forgot-password",
      channel: "email",
    })
      .then((payload) => {
        setFpVerificationId(payload.verificationId || "");
        setFpDestination(payload.destination || t);
        setFpInput("");
        setErrKey("fpEmail", "");
        setErrKey("fpCode", "");
        setFpStep("code");
      })
      .catch((error) => {
        const message = String(error?.message || "");
        const lower = message.toLowerCase();
        if (
          lower.includes("too many") ||
          lower.includes("attempt") ||
          lower.includes("limit") ||
          lower.includes("wait") ||
          error?.statusCode === 429
        ) {
          triggerFpLock();
        } else {
          setErrKey(fpStep === "code" ? "fpCode" : "fpEmail", message || "Failed to send OTP.");
        }
      })
      .finally(() => {
        setFpBusy(false);
      });
  };

  const onFpVerifyOtp = () => {
    if (fpBusy) return;

    if (isFpLocked) {
      setErrKey("fpCode", fpCooldownText);
      return;
    }

    const entered = clean(fpInput).replace(/[^\d]/g, "");
    if (!entered) return setErrKey("fpCode", "OTP code is required.");
    if (entered.length < 6) return setErrKey("fpCode", "OTP code must be 6 digits in length.");

    setFpBusy(true);
    verifyPasswordOtp({
      email: clean(fpEmail),
      verificationId: fpVerificationId,
      otp: entered,
      purpose: "forgot-password",
    })
      .then(() => {
        setErrKey("fpCode", "");
        setFpPassword("");
        setFpConfirmPassword("");
        setFpPassTouched(false);
        setFpStep("reset");
        moduleFpAttempts = 0;
        setFpAttempts(0);
      })
      .catch((error) => {
        const message = String(error?.message || "");
        const lower = message.toLowerCase();

        if (
          lower.includes("too many") ||
          lower.includes("limit") ||
          error?.statusCode === 429
        ) {
          triggerFpLock();
          return;
        }

        const nextAttempts = fpAttempts + 1;
        moduleFpAttempts = nextAttempts;
        setFpAttempts(nextAttempts);

        if (nextAttempts >= MAX_FP_ATTEMPTS) {
          triggerFpLock();
        } else {
          const remaining = MAX_FP_ATTEMPTS - nextAttempts;
          setErrKey(
            "fpCode",
            `${message || "Invalid code."} (${remaining} attempt${remaining > 1 ? "s" : ""} remaining)`
          );
        }
      })
      .finally(() => {
        setFpBusy(false);
      });
  };

  const onFpResetPassword = () => {
    if (fpBusy) return;
    const nextPassword = String(fpPassword || "");
    const nextConfirmPassword = String(fpConfirmPassword || "");

    if (!clean(nextPassword)) return setErrKey("fpPass", "Password is required.");
    setFpPassTouched(true);
    if (!passStrong(nextPassword)) return setErrKey("fpPass", "Password is not strong enough.");
    if (!clean(nextConfirmPassword)) return setErrKey("fpConfirm", "Confirm password is required.");
    if (nextPassword !== nextConfirmPassword) return setErrKey("fpConfirm", "Passwords do not match.");

    setFpBusy(true);
    resetPasswordWithOtp({
      email: clean(fpEmail),
      verificationId: fpVerificationId,
      otp: clean(fpInput),
      password: nextPassword,
    })
      .then(() => {
        closeForgot();
        Alert.alert("Password updated", "Your password has been changed successfully.");
      })
      .catch((error) => {
        setErrKey("fpPass", error.message || "Failed to reset password.");
      })
      .finally(() => {
        setFpBusy(false);
      });
  };

  const switchMode = (m) => {
    setMode(m);
    resetErrors();

    // ✅ reset password rule visibility when switching tabs
    setPassTouched(false);
  };

  // ✅ rules UI (shown only after typing in register)
  const rules = passRules(pass);

  const openApiSettings = () => {
    setApiUrlInput(getApiBaseUrl());
    setApiStatus("");
    setApiStatusTone("neutral");
    setApiSettingsOpen(true);
  };

  const useDetectedLanApi = () => {
    setApiUrlInput(getSuggestedApiBaseUrl());
    setApiStatus("");
    setApiStatusTone("neutral");
  };

  const useTunnelTemplate = () => {
    setApiUrlInput("https://your-backend-tunnel-url");
    setApiStatus("Paste your ngrok or Cloudflare Tunnel URL, then test it.");
    setApiStatusTone("neutral");
  };

  const applyApiUrl = () => {
    const nextUrl = setApiBaseUrl(apiUrlInput);
    setApiUrlInput(nextUrl);
    if (!nextUrl) {
      setApiStatus("No API URL is configured yet. Use your Railway backend URL.");
      setApiStatusTone("error");
      return;
    }
    setApiStatus(`Using API: ${nextUrl}`);
    setApiStatusTone("success");
  };

  const testApiConnection = async () => {
    const nextUrl = setApiBaseUrl(apiUrlInput);
    setApiUrlInput(nextUrl);
    setApiTestBusy(true);
    setApiStatus("");
    setApiStatusTone("neutral");

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "__ping__", password: "__ping__" }),
      });
      setApiStatus(`Connected to ${nextUrl}`);
      setApiStatusTone("success");
    } catch (error) {
      const message = String(error?.message || "");
      if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("incorrect")) {
        setApiStatus(`Connected to ${nextUrl}`);
        setApiStatusTone("success");
      } else {
        setApiStatus(message || `Could not reach ${nextUrl}`);
        setApiStatusTone("error");
      }
    } finally {
      setApiTestBusy(false);
    }
  };

  const PasswordRulesUI =
    mode !== "register" || !passTouched ? null : (
      <PasswordRulesBox rules={rules} />
    );

  const FpPasswordRulesUI =
    !fpPassTouched ? null : (
      <PasswordRulesBox rules={passRules(fpPassword)} />
    );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ImageBackground source={AUTH_BG} style={styles.page} imageStyle={styles.pageBgImage}>
          <View style={styles.pageOverlay}>
          <AuthHeader />

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={[styles.stage, { width: stageW }]}>
              <View style={[styles.hero, compact && styles.heroCompact]}>
                <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>All Pro-Tec Car Care</Text>
                <Text style={[styles.heroSub, compact && styles.heroSubCompact]}>
                  Quality is our top priority, and customer{"\n"}satisfaction is our ultimate goal.
                </Text>
              </View>

              <View style={[styles.cardWrap, compact && styles.cardWrapCompact]}>
                <View style={[styles.tabs, compact && styles.tabsCompact]}>
                  <TabBtn active={mode === "login"} label="Sign In" onPress={() => switchMode("login")} />
                  <TabBtn active={mode === "register"} label="Sign Up" onPress={() => switchMode("register")} />
                </View>

                <View style={[styles.cardBody, compact && styles.cardBodyCompact]}>
                  {mode === "login" ? (
                    <>
                      <Text style={styles.formTitle}>Welcome back</Text>
                      <Text style={styles.formSub}>
                        Sign in to your account to manage your car service appointments
                      </Text>

                      <Text style={styles.sectionLabel}>Account Details</Text>

                      <Field
                        label="Email"
                        value={email}
                        onChangeText={onEmailChange}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        error={errors.email}
                      />

                      <PasswordField
                        label="Password"
                        value={pass}
                        onChangeText={onPassChange}
                        placeholder="Enter your password"
                        show={showPass}
                        onToggle={() => setShowPass((s) => !s)}
                        error={errors.pass}
                      />

                      <View style={[styles.inlineActionRow, compact && styles.inlineActionRowCompact]}>
                        <Text style={[styles.helperText, compact && styles.helperTextCompact]}>Use your registered email and password to continue.</Text>
                        <View style={styles.inlineLinks}>
                          <TouchableOpacity activeOpacity={0.85} onPress={openForgot} style={styles.linkBtnInline}>
                            <Text style={styles.linkTxt}>Forgot Password?</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <TouchableOpacity activeOpacity={0.85} onPress={onLogin} style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>Sign In</Text>
                      </TouchableOpacity>

                      <View style={styles.switchRow}>
                        <Text style={styles.switchText}>Need an account?</Text>
                        <TouchableOpacity activeOpacity={0.85} onPress={() => switchMode("register")}>
                          <Text style={styles.switchLink}>Create one here</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.formTitle}>Create Account</Text>
                      <Text style={styles.formSub}>
                        Sign up to start booking your car service appointment
                      </Text>

                      <Text style={styles.sectionLabel}>Personal Information</Text>

                      <View style={[styles.row2, compact && styles.row2Compact]}>
                        <View style={styles.col}>
                          <Field
                            label="First Name"
                            value={first}
                            onChangeText={(v) => {
                              const value = v.replace(/[^a-zA-Z\s]/g, "").slice(0, 55);
                              setFirst(value);
                              setErrKey("first", validateName("First name", value));
                            }}
                            placeholder="Enter your first name"
                            error={errors.first}
                          />
                        </View>

                        <View style={styles.col}>
                          <Field
                            label="Last Name"
                            value={last}
                            onChangeText={(v) => {
                              const value = v.replace(/[^a-zA-Z\s]/g, "").slice(0, 55);
                              setLast(value);
                              setErrKey("last", validateName("Last name", value));
                            }}
                            placeholder="Enter your last name"
                            error={errors.last}
                          />
                        </View>
                      </View>

                      <View style={styles.sectionDivider} />

                      <Text style={styles.sectionLabel}>Contact and Security</Text>

                      <Field
                        label="Email"
                        value={email}
                        onChangeText={onEmailChange}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        error={errors.email}
                      />

                      <Field
                        label="Phone"
                        value={phone}
                        onChangeText={onPhoneChange}
                        placeholder="09xx xxx xxxx"
                        keyboardType="phone-pad"
                        error={errors.phone}
                      />

                      <PasswordField
                        label="Password"
                        value={pass}
                        onChangeText={onPassChange}
                        placeholder="Enter your password"
                        show={showPass}
                        onToggle={() => setShowPass((s) => !s)}
                        error={errors.pass}
                        below={PasswordRulesUI}
                      />

                      <PasswordField
                        label="Confirm Password"
                        value={confirm}
                        onChangeText={onConfirmChange}
                        placeholder="Confirm your password"
                        show={showConfirm}
                        onToggle={() => setShowConfirm((s) => !s)}
                        error={errors.confirm}
                      />

                      <Text style={styles.helperText}>
                        Your password should be memorable for you and hard to guess for anyone else.
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={createBusy}
                        onPress={onCreateAccount}
                        style={[styles.primaryBtn, createBusy && { opacity: 0.7 }]}
                      >
                        <Text style={styles.primaryBtnText}>
                          {createBusy ? "Checking..." : "Create Account"}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.switchRow}>
                        <Text style={styles.switchText}>Already registered?</Text>
                        <TouchableOpacity activeOpacity={0.85} onPress={() => switchMode("login")}>
                          <Text style={styles.switchLink}>Sign in instead</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>

            </View>
          </ScrollView>

          <AuthFooter />

          {/* =======================
              SIGN UP OTP MODALS
          ======================= */}
          <Modal visible={otpStep === "email"} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={closeOtp} />
            <View style={styles.modalCenter}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Verify Email</Text>
                <Text style={styles.modalSub}>We will send a security code to verify your email.</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput value={otpEmail} editable={false} style={[styles.input, styles.inputDisabled]} />
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity activeOpacity={0.85} onPress={closeOtp} style={[styles.modalBtn, styles.modalBtnGhost]}>
                    <Text style={styles.modalBtnGhostTxt}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.85} disabled={otpBusy} onPress={onSendOtp} style={[styles.modalBtn, otpBusy && { opacity: 0.65 }]}>
                    <Text style={styles.modalBtnTxt}>{otpBusy ? "Sending..." : "Send OTP"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={otpStep === "code"} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={closeOtp} />
            <View style={styles.modalCenter}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Enter Security Code</Text>
                <Text style={styles.modalSub}>
                  Please check {otpDestination || otpEmail || "your email"} for a message with your code.
                </Text>

                <Field
                  label="Code"
                  value={otpInput}
                  onChangeText={(v) => setOtpInput(v.replace(/[^\d]/g, "").slice(0, 6))}
                  placeholder="Enter code"
                  keyboardType="number-pad"
                  error={errors.otp}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity activeOpacity={0.85} onPress={closeOtp} style={[styles.modalBtn, styles.modalBtnGhost]}>
                    <Text style={styles.modalBtnGhostTxt}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.85} disabled={otpBusy} onPress={onVerifyOtp} style={[styles.modalBtn, otpBusy && { opacity: 0.65 }]}>
                    <Text style={styles.modalBtnTxt}>{otpBusy ? "Verifying..." : "Continue"}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity activeOpacity={0.85} disabled={otpBusy} onPress={onSendOtp} style={[styles.resendBtn, otpBusy && { opacity: 0.6 }]}>
                  <Text style={styles.resendTxt}>{otpBusy ? "Sending..." : "Resend code"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* =======================
              FORGOT PASSWORD MODALS
          ======================= */}
          <Modal visible={fpStep === "email"} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={closeForgot} />
            <View style={styles.modalCenter}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Verify Email</Text>
                <Text style={styles.modalSub}>
                  We will send a security code to verify{"\n"}your email.
                </Text>

                <Field
                  label=""
                  value={fpEmail}
                  onChangeText={onFpEmailChange}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  error={isFpLocked ? fpCooldownText : errors.fpEmail}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={closeForgot}
                    style={[styles.modalBtn, styles.modalBtnGhost]}
                  >
                    <Text style={styles.modalBtnGhostTxt}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={fpBusy || isFpLocked}
                    onPress={onFpSendOtp}
                    style={[styles.modalBtn, (fpBusy || isFpLocked) && { opacity: 0.65 }]}
                  >
                    <Text style={styles.modalBtnTxt}>
                      {fpBusy ? "Sending..." : isFpLocked ? `Wait (${formatFpTimer(fpCooldownSeconds)})` : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={fpStep === "code"} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={closeForgot} />
            <View style={styles.modalCenter}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Enter Security Code</Text>
                <Text style={styles.modalSub}>
                  Please check {fpDestination || fpEmail || "your email"} for a message with{"\n"}your code.
                </Text>

                <Field
                  label=""
                  value={fpInput}
                  onChangeText={onFpCodeChange}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  error={isFpLocked ? fpCooldownText : errors.fpCode}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={closeForgot}
                    style={[styles.modalBtn, styles.modalBtnGhost]}
                  >
                    <Text style={styles.modalBtnGhostTxt}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={fpBusy || isFpLocked}
                    onPress={onFpVerifyOtp}
                    style={[styles.modalBtn, (fpBusy || isFpLocked) && { opacity: 0.65 }]}
                  >
                    <Text style={styles.modalBtnTxt}>{fpBusy ? "Verifying..." : "Continue"}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={fpBusy || isFpLocked}
                  onPress={onFpSendOtp}
                  style={[styles.resendBtn, (fpBusy || isFpLocked) && { opacity: 0.6 }]}
                >
                  <Text style={styles.resendTxt}>
                    {fpBusy
                      ? "Sending..."
                      : isFpLocked
                      ? `Resend code in ${formatFpTimer(fpCooldownSeconds)}`
                      : "Resend code"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal visible={fpStep === "reset"} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={closeForgot} />
            <View style={styles.modalCenter}>
              <View style={[styles.modalCard, { maxHeight: "90%" }]}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <Text style={styles.modalTitle}>Create New Password</Text>
                  <Text style={styles.modalSub}>
                    Your code has been verified. Enter a new password for {fpEmail || "your account"}.
                  </Text>

                  <PasswordField
                    label="New Password"
                    value={fpPassword}
                    onChangeText={onFpPassChange}
                    placeholder="Enter your new password"
                    show={fpShowPassword}
                    onToggle={() => setFpShowPassword((s) => !s)}
                    error={errors.fpPass}
                    below={FpPasswordRulesUI}
                  />

                  <PasswordField
                    label="Confirm Password"
                    value={fpConfirmPassword}
                    onChangeText={onFpConfirmPassChange}
                    placeholder="Confirm your new password"
                    show={fpShowConfirmPassword}
                    onToggle={() => setFpShowConfirmPassword((s) => !s)}
                    error={errors.fpConfirm}
                  />

                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={closeForgot}
                      style={[styles.modalBtn, styles.modalBtnGhost]}
                    >
                      <Text style={styles.modalBtnGhostTxt}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={fpBusy}
                      onPress={onFpResetPassword}
                      style={[styles.modalBtn, fpBusy && { opacity: 0.65 }]}
                    >
                      <Text style={styles.modalBtnTxt}>{fpBusy ? "Updating..." : "Update Password"}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          <Modal visible={apiSettingsOpen} transparent animationType="fade" onRequestClose={() => setApiSettingsOpen(false)}>
            <Pressable style={styles.modalOverlay} onPress={() => setApiSettingsOpen(false)} />
            <View style={styles.modalCenter}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{releaseBuild ? "Server Settings" : "Connection Settings"}</Text>
                <Text style={styles.modalSub}>
                  {releaseBuild
                    ? "Enter the public HTTPS backend address for this app build."
                    : "Enter the backend API address your device can actually reach."}
                </Text>

                <Field
                  label="API Base URL"
                  value={apiUrlInput}
                  onChangeText={(value) => {
                    setApiUrlInput(value);
                    setApiStatus("");
                    setApiStatusTone("neutral");
                  }}
                  placeholder="https://autoflow-production-0606.up.railway.app"
                  keyboardType="url"
                />

                <>
                  <Text style={styles.apiHint}>
                    This app now uses the deployed Railway backend.
                  </Text>
                  <Text style={styles.apiHint}>
                    Default API: `https://autoflow-production-0606.up.railway.app`
                  </Text>
                  <Text style={styles.apiHint}>
                    Resend OTP stays on the backend, so no email API keys are stored in the app.
                  </Text>

                  <TouchableOpacity activeOpacity={0.85} onPress={useTunnelTemplate} style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnTxt}>Use Railway Default</Text>
                  </TouchableOpacity>
                </>

                {!!apiStatus && (
                  <Text
                    style={[
                      styles.apiStatus,
                      apiStatusTone === "success" ? styles.apiStatusSuccess : styles.apiStatusError,
                    ]}
                  >
                    {apiStatus}
                  </Text>
                )}

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setApiSettingsOpen(false)}
                    style={[styles.modalBtn, styles.modalBtnGhost]}
                  >
                    <Text style={styles.modalBtnGhostTxt}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.85} onPress={applyApiUrl} style={styles.modalBtn}>
                    <Text style={styles.modalBtnTxt}>Use This URL</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => void testApiConnection()}
                  style={styles.secondaryBtn}
                  disabled={apiTestBusy}
                >
                  <Text style={styles.secondaryBtnTxt}>{apiTestBusy ? "Testing..." : "Test Connection"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
