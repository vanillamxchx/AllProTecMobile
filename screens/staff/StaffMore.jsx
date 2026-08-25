import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import styles from "../../styles/css/staff/staffMoreStyles";

const ICON_SERVICES = require("../../styles/icons/services.png");
const ICON_INVENTORY = require("../../styles/icons/inventory.png");
const ICON_PAYMENTS = require("../../styles/icons/payments.png");
const ICON_ENGAGE = require("../../styles/icons/engagement.png");
const ICON_PROFILE = require("../../styles/icons/profile.png");

export default function StaffMore({ goTo }) {
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
        <Tile label="Services" icon={ICON_SERVICES} route="services" />
        <Tile label="Stock Monitoring" icon={ICON_INVENTORY} route="inventory" />
        <Tile label="Payments" icon={ICON_PAYMENTS} route="payments" />
        <Tile label="Engagement" icon={ICON_ENGAGE} route="engagement" />
        <Tile label="Profile" icon={ICON_PROFILE} route="profile" />
      </View>
    </ScrollView>
  );
}
