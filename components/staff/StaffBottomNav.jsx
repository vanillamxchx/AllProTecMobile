import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "../../styles/css/staff/staffBottomNavStyles";

const ICON_DASH = require("../../styles/icons/dashboard.png");
const ICON_BOOK = require("../../styles/icons/bookings.png");
const ICON_TRACK = require("../../styles/icons/tracking.png");
const ICON_MORE = require("../../styles/icons/menu.png");

export default function StaffBottomNav({ active = "dashboard", onTab }) {
  const Tab = ({ keyName, label, icon }) => {
    const isActive = active === keyName;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onTab?.(keyName)}
        style={[styles.btn, isActive && styles.btnActive]}
      >
        <Image
          source={icon}
          style={[
            styles.iconImg,
            !isActive && styles.iconImgInactive,
            isActive && styles.iconImgActive,
          ]}
          resizeMode="contain"
        />
        <Text style={[styles.label, isActive && styles.labelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bar}>
      <Tab keyName="dashboard" label="Dashboard" icon={ICON_DASH} />
      <Tab keyName="bookings" label="Bookings" icon={ICON_BOOK} />
      <Tab keyName="tracking" label="Tracking" icon={ICON_TRACK} />
      <Tab keyName="more" label="More" icon={ICON_MORE} />
    </View>
  );
}
