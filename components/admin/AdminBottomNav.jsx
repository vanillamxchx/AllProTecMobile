import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import navStyles from "../../styles/css/admin/adminBottomNavStyles.js";

const DashboardIcon = require("../../styles/icons/dashboard.png");
const BookingsIcon = require("../../styles/icons/bookings.png");
const TrackingIcon = require("../../styles/icons/tracking.png");
const MoreIcon = require("../../styles/icons/menu.png");

export default function AdminBottomNav({ active = "dashboard", onTab }) {
  const Tab = ({ keyName, label, icon }) => {
    const isActive = active === keyName;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onTab?.(keyName)}
        style={[navStyles.btn, isActive && navStyles.btnActive]}
      >
        <Image
          source={icon}
          style={[
            navStyles.iconImg,
            isActive ? navStyles.iconImgActive : navStyles.iconImgInactive,
          ]}
          resizeMode="contain"
        />
        <Text style={[navStyles.label, isActive && navStyles.labelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={navStyles.bar}>
      <Tab keyName="dashboard" label="Dashboard" icon={DashboardIcon} />
      <Tab keyName="bookings" label="Bookings" icon={BookingsIcon} />
      <Tab keyName="tracking" label="Tracking" icon={TrackingIcon} />
      <Tab keyName="more" label="More" icon={MoreIcon} />
    </View>
  );
}
