import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMobileData } from "../../context/MobileDataContext.jsx";

function formatTimestamp(value) {
  if (!value) return "Not synced yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DataConnectionBanner() {
  const { connected, loading, error, reload, apiBaseUrl, lastSyncedAt, autoSyncMs } = useMobileData();

  return (
    <View style={[styles.card, connected ? styles.cardConnected : styles.cardOffline]}>
      <View style={styles.row}>
        <View style={[styles.dot, connected ? styles.dotConnected : styles.dotOffline]} />
        <View style={styles.copy}>
          <Text style={styles.title}>
            {connected ? "Connected to shared database" : "Backend connection needed"}
          </Text>
          <Text style={styles.sub}>
            API: {apiBaseUrl}
          </Text>
          <Text style={styles.sub}>
            Last sync: {formatTimestamp(lastSyncedAt)}
          </Text>
          <Text style={styles.sub}>
            Auto-sync: every {Math.max(1, Math.round(Number(autoSyncMs || 0) / 1000))}s
          </Text>
          {!connected && !!error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={() => reload()}
          disabled={loading}
        >
          {loading ? <ActivityIndicator size="small" color="#111827" /> : <Text style={styles.buttonText}>Sync now</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardConnected: {
    backgroundColor: "#F5F9ED",
    borderColor: "#D7E8B0",
  },
  cardOffline: {
    backgroundColor: "#FFF4F4",
    borderColor: "#F5C2C2",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
  },
  dotConnected: {
    backgroundColor: "#65A30D",
  },
  dotOffline: {
    backgroundColor: "#DC2626",
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  button: {
    minWidth: 78,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#E8C547",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
});
