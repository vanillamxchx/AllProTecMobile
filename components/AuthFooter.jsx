import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/css/authFooterStyles";

export default function AuthFooter() {
  return (
    <View style={styles.footerBar}>
      <Text style={styles.footerText}>
        Copyright 2026 <Text style={styles.footerBrand}>All Pro-Tec</Text>
      </Text>
    </View>
  );
}
