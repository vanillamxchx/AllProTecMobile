import React from "react";
import { Modal, View, Text, Pressable, TouchableOpacity, ScrollView } from "react-native";
import styles from "../../styles/css/common/notificationCenterModalStyles.js";

export default function NotificationCenterModal({
  open,
  onClose,
  notifications = [],
  unreadCount = 0,
  loading = false,
  onMarkRead,
}) {
  if (!open) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.head}>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.sub}>{unreadCount > 0 ? `${unreadCount} unread` : "You are all caught up"}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.actionBtn} onPress={onMarkRead}>
              <Text style={styles.actionTxt}>Mark Read</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {loading && notifications.length === 0 ? (
              <Text style={styles.empty}>Loading notifications...</Text>
            ) : notifications.length === 0 ? (
              <Text style={styles.empty}>No notifications yet.</Text>
            ) : (
              notifications.map((item) => (
                <View key={item.id} style={[styles.item, item.isUnread && styles.itemUnread]}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.isUnread ? <View style={styles.dot} /> : null}
                  </View>
                  <Text style={styles.itemBody}>{item.message}</Text>
                  <Text style={styles.itemMeta}>{item.ts || item.createdAt || ""}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.foot}>
            <TouchableOpacity activeOpacity={0.85} style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
