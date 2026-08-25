import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import styles from "../../styles/css/staff/staffMoreStyles";
import { MODULE_KEYS, canAccessModule } from "../../services/rbac";

const ICON_SERVICES = require("../../styles/icons/services.png");
const ICON_INVENTORY = require("../../styles/icons/inventory.png");
const ICON_PAYMENTS = require("../../styles/icons/payments.png");
const ICON_ENGAGE = require("../../styles/icons/engagement.png");
const ICON_PROFILE = require("../../styles/icons/profile.png");
const ICON_MY_WORK = require("../../styles/icons/bookings.png");
const ICON_DETAILER = require("../../styles/icons/tracking.png");

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
        <Tile label="Services" icon={ICON_SERVICES} route="services" />
        <Tile label="Stock Monitoring" icon={ICON_INVENTORY} route="inventory" />
        <Tile label="Payments" icon={ICON_PAYMENTS} route="payments" />
        <Tile label="Engagement" icon={ICON_ENGAGE} route="engagement" />
        {canAccessModule(currentUser, MODULE_KEYS.detailerManagement) ? (
          <Tile label="Detailer Management" icon={ICON_DETAILER} route="detailer-management" />
        ) : null}
        <Tile label="Profile" icon={ICON_PROFILE} route="profile" />
      </View>
    </ScrollView>
  );
}
