import React from "react";
import { View, Text, Image } from "react-native";
import styles from "../styles/css/authHeaderStyles.js";

const APT_LOGO = require("../styles/images/aptlogo.png");

export default function AuthHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image source={APT_LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.textWrap}>
          <Text style={styles.title}>ALL PRO-TEC</Text>
          <Text style={styles.subtitle}>Car Care Services</Text>
        </View>
        <View style={styles.accent} />
      </View>
    </View>
  );
}
