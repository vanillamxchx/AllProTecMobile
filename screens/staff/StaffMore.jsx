import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import styles from "../../styles/css/staff/staffMoreStyles";
import { MODULE_KEYS, canAccessModule } from "../../services/rbac";

const ICON_SERVICES = require("../../styles/icons/services.png");
const ICON_INVENTORY = require("../../styles/icons/inventory.png");
const ICON_PAYMENTS = require("../../styles/icons/payments.png");
const ICON_ANALYTICS = require("../../styles/icons/analytics.png");
const ICON_FINANCIAL = require("../../styles/icons/payments.png");
const ICON_ENGAGE = require("../../styles/icons/engagement.png");
const ICON_PROFILE = require("../../styles/icons/profile.png");
const ICON_MY_WORK = require("../../styles/icons/bookings.png");
const ICON_DETAILER = require("../../styles/icons/tracking.png");
const ICON_AUDIT = require("../../styles/icons/audit.png");

export default function StaffMore({ goTo, currentUser }) {
  const Tile = ({ label, icon, route }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.tile}
      onPress={() => goTo?.(route)}
    >
      <View style={styles.iconWrap}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {canAccessModule(currentUser, MODULE_KEYS.myWork) ? (
          <Tile label="My Work" icon={ICON_MY_WORK} route="my-work" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.services) ? (
          <Tile label="Services" icon={ICON_SERVICES} route="services" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.stockMonitoring) ? (
          <Tile label="Stock Monitoring" icon={ICON_INVENTORY} route="inventory" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.paymentTracking) ? (
          <Tile label="Payments" icon={ICON_PAYMENTS} route="payments" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.analytics) ? (
          <Tile label="Analytics" icon={ICON_ANALYTICS} route="analytics" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.financialTracker) ? (
          <Tile label="Financial Tracker" icon={ICON_FINANCIAL} route="financial" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.engagement) ? (
          <Tile label="Engagement" icon={ICON_ENGAGE} route="engagement" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.detailerManagement) ? (
          <Tile label="Detailer Management" icon={ICON_DETAILER} route="detailer-management" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.auditLogs) ? (
          <Tile label="Audit Logs" icon={ICON_AUDIT} route="audit" />
        ) : null}
        {canAccessModule(currentUser, MODULE_KEYS.profile) ? (
          <Tile label="Profile" icon={ICON_PROFILE} route="profile" />
        ) : null}
      </View>
    </ScrollView>
  );
}
