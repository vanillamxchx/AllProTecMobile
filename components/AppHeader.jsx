import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import styles from "../styles/css/appHeaderStyles.js";

const Logo = require("../styles/images/aptlogo.png");
const BellIcon = require("../styles/icons/bell.png");

export default function AppHeader({
  role = "admin",
  name = "A",
  onBell,
  unreadCount = 0,
  onProfile,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const roleLabel =
    role === "admin"
      ? "ADMIN Portal"
      : role === "staff"
      ? "STAFF Portal"
      : "CLIENT Portal";

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* HEADER */}
      <View style={styles.header}>
        {/* LEFT */}
        <View style={styles.left}>
          <View style={styles.logoBox}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
          </View>

          <View>
            <Text style={styles.brand}>ALL PRO-TEC</Text>
            <Text style={styles.portal}>{roleLabel}</Text>
          </View>
        </View>

        {/* RIGHT */}
        <View style={styles.right}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBell}
            style={styles.iconBtn}
          >
            <Image
              source={BellIcon}
              style={styles.bellIcon}
              resizeMode="contain"
            />
            {unreadCount > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openMenu}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {name?.slice(0, 1).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DROPDOWN MENU */}
      {menuOpen && (
        <View style={styles.menuRoot}>
          {/* Tap outside */}
          <Pressable style={styles.menuBackdrop} onPress={closeMenu} />

          <View style={styles.menuCard}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                onProfile?.();
              }}
            >
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                onLogout?.();
              }}
            >
              <Text style={[styles.menuText, styles.menuTextDanger]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}
