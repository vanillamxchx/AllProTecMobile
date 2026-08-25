import React, { useMemo, useState, useEffect } from "react";
import { Modal, View, Text, Pressable, TextInput, TouchableOpacity } from "react-native";
import styles from "../../styles/css/modals/reviewModalStyles";

function Star({ filled, onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.starBtn}>
      <Text style={[styles.star, filled && styles.starFilled]}>{filled ? "★" : "☆"}</Text>
    </Pressable>
  );
}

export default function ReviewModal({ visible, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0); // 1..5
  const [comment, setComment] = useState("");

  // live validation
  const [touched, setTouched] = useState({ name: false, rating: false, comment: false });

  useEffect(() => {
    if (!visible) return;
    // reset every time modal opens
    setName("");
    setRating(0);
    setComment("");
    setTouched({ name: false, rating: false, comment: false });
  }, [visible]);

  const nameErr = useMemo(() => {
    if (!touched.name) return "";
    if (!name.trim()) return "Name is required.";
    return "";
  }, [name, touched.name]);

  const ratingErr = useMemo(() => {
    if (!touched.rating) return "";
    if (rating < 1) return "Please select a rating.";
    return "";
  }, [rating, touched.rating]);

  // comment is optional in your screenshot (no *), but we can still show a gentle rule if you want
  const canSubmit = name.trim() && rating >= 1;

  const submit = () => {
    setTouched({ name: true, rating: true, comment: true });
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    if (onSubmit) onSubmit(payload);
    else console.log("REVIEW SUBMIT:", payload);

    onClose?.();
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <Text style={styles.title}>Add Review</Text>

            {/* Name* */}
            <Text style={styles.label}>Name*</Text>
            <View style={[styles.inputWrap, nameErr ? styles.inputWrapErr : null]}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter Your Name"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              />
            </View>
            {!!nameErr && <Text style={styles.errTxt}>{nameErr}</Text>}

            {/* Rating */}
            <Text style={styles.label2}>How would you rate our service?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  filled={i <= rating}
                  onPress={() => {
                    setRating(i);
                    setTouched((t) => ({ ...t, rating: true }));
                  }}
                />
              ))}
            </View>
            {!!ratingErr && <Text style={styles.errTxt}>{ratingErr}</Text>}

            {/* Comment */}
            <Text style={styles.label2}>Tell us something about your experience</Text>
            <View style={styles.textAreaWrap}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Add comments here..."
                placeholderTextColor="#9CA3AF"
                style={styles.textArea}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Submit */}
            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.92}
                style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                disabled={!canSubmit}
                onPress={submit}
              >
                <Text style={styles.submitTxt}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
