import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import styles from "../../styles/css/admin/adminMoreStyles.js";

// ✅ replace these icon filenames with yours (or keep placeholders)
const I_SERVICES = require("../../styles/icons/services.png");
const I_INVENTORY = require("../../styles/icons/inventory.png");
const I_PAYMENTS = require("../../styles/icons/payments.png");
const I_ANALYTICS = require("../../styles/icons/analytics.png");
const I_ENGAGEMENT = require("../../styles/icons/engagement.png");
const I_USERS = require("../../styles/icons/users.png");
const I_AUDIT = require("../../styles/icons/audit.png");
const I_PROFILE = require("../../styles/icons/profile.png");
const I_FINANCIAL = require("../../styles/icons/payments.png");
const I_DETAILERS = require("../../styles/icons/tracking.png");

export default function AdminMore({ onOpenModule }) {
  const tiles = useMemo(
    () => [
      { key: "services", label: "Services", icon: I_SERVICES },
      { key: "inventory", label: "Stock Monitoring", icon: I_INVENTORY },
      { key: "payments", label: "Payments", icon: I_PAYMENTS },
      { key: "analytics", label: "Analytics", icon: I_ANALYTICS },
      { key: "financial", label: "Financial Tracker", icon: I_FINANCIAL },
      { key: "engagement", label: "Engagement", icon: I_ENGAGEMENT },
      { key: "users", label: "Users Overview", icon: I_USERS },
      { key: "detailer-management", label: "Detailer Management", icon: I_DETAILERS },
      { key: "audit", label: "Audit Logs", icon: I_AUDIT },
      { key: "profile", label: "Profile", icon: I_PROFILE },
    ],
    []
  );

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity
            key={t.key}
            activeOpacity={0.9}
            onPress={() => onOpenModule?.(t.key)}
            style={styles.tile}
          >
            <View style={styles.iconWrap}>
              <Image source={t.icon} style={styles.icon} resizeMode="contain" />
            </View>
            <Text style={styles.label}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}
