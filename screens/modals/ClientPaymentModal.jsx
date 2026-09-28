import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import styles from "../../styles/css/modals/clientPaymentModalStyles";
import { formatCurrency, getRewardPreview } from "../../context/MobileDataContext.jsx";
import { validatePaymentProof } from "../../services/paymentReferenceChecker";
import { getDownPaymentProofImage, getFinalPaymentProofImage } from "../../services/paymentProofs";

function formatDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const nextDate = new Date(raw);
  if (Number.isNaN(nextDate.getTime())) return raw;
  return nextDate.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatDateTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const nextDate = new Date(raw);
  if (Number.isNaN(nextDate.getTime())) return raw;
  return nextDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatApproxTimeLeft(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const due = new Date(raw);
  if (Number.isNaN(due.getTime())) return "";
  const hours = Math.ceil((due.getTime() - Date.now()) / (60 * 60 * 1000));
  if (hours <= 0) return "expired";
  if (hours === 1) return "approximately 1 hour";
  return `approximately ${hours} hours`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function compressImageFile(file) {
  const rawDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await loadImage(rawDataUrl);
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return rawDataUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function isCashPaymentMethod(value) {
  return String(value || "").trim().toLowerCase() === "cash";
}

export default function ClientPaymentModal({
  visible,
  payment,
  usableRewards = [],
  getPaymentStageLabel,
  getAmountPaid,
  getPaymentTotal,
  getRemainingBalance,
  normalizeStageStatus,
  initialMode = "details",
  onClose,
  onViewInvoice,
  onSubmitProof,
}) {
  const [mode, setMode] = useState("details");
  const [proofError, setProofError] = useState("");
  const [proofBusy, setProofBusy] = useState(false);
  const [proofForm, setProofForm] = useState({
    reference: "",
    notes: "",
    method: "",
    proofImage: "",
    proofImageUri: "",
    proofFileName: "",
    rewardId: "",
  });

  useEffect(() => {
    if (!visible) return;
    setMode(initialMode);
    setProofError("");
    setProofBusy(false);
    setProofForm({
      reference: "",
      notes: String(payment?.notes || "").trim(),
      method: "",
      proofImage: "",
      proofImageUri: "",
      proofFileName: "",
      rewardId: String(payment?.rewardId || "").trim(),
    });
  }, [visible, payment, initialMode]);

  const statusRaw = String(getPaymentStageLabel?.(payment) || payment?.status || "-");
  const normalizedStatus = statusRaw.toLowerCase();
  const isPaid = normalizedStatus.includes("paid");
  const isFinalPaymentMode = mode === "finalPaymentProof";
  const isCashMethod = isCashPaymentMethod(proofForm.method);
  const downPaymentStatus =
    normalizeStageStatus?.(
      payment?.downPaymentStatus,
      payment?.downPaymentRequired === false ? "Not Required" : "Pending"
    ) || "Pending";
  const finalPaymentStatus =
    normalizeStageStatus?.(payment?.finalPaymentStatus, payment?.status || "Pending") || "Pending";

  const pillStyle = normalizedStatus.includes("paid")
    ? styles.stPaid
    : normalizedStatus.includes("verification")
      ? styles.stReview
      : normalizedStatus.includes("reject") || normalizedStatus.includes("cancel")
        ? styles.stRejected
        : normalizedStatus.includes("pending")
          ? styles.stPending
          : styles.stDefault;

  const selectedReward = useMemo(
    () => usableRewards.find((reward) => reward.id === proofForm.rewardId) || null,
    [proofForm.rewardId, usableRewards]
  );
  const paymentBaseBeforeReward = useMemo(
    () => Math.max(0, Number(payment?.originalAmount || payment?.amount || 0) - Number(payment?.promoDiscountAmount || 0)),
    [payment]
  );
  const rewardPreview = useMemo(
    () => getRewardPreview(selectedReward, paymentBaseBeforeReward),
    [paymentBaseBeforeReward, selectedReward]
  );
  const paymentCancelled = Boolean(payment?.autoCancelledForNoDownPaymentProof);
  const downPaymentProofImage = getDownPaymentProofImage(payment);
  const downPaymentProofName = String(payment?.downPaymentProofName || payment?.proofFileName || "").trim();
  const finalPaymentProofImage = getFinalPaymentProofImage(payment);
  const finalPaymentProofName = String(payment?.finalPaymentProofName || "").trim();
  const finalReviewLocked =
    finalPaymentStatus === "Paid" ||
    finalPaymentStatus === "For Verification" ||
    normalizedStatus === "paid";
  const canUploadDownPayment =
    !paymentCancelled &&
    !finalReviewLocked &&
    payment?.downPaymentRequired === true &&
    ["Pending", "Rejected"].includes(downPaymentStatus);
  const canUploadFinalPayment =
    !paymentCancelled &&
    !finalReviewLocked &&
    (
      payment?.downPaymentRequired === false ||
      downPaymentStatus === "Not Required" ||
      downPaymentStatus === "Paid" ||
      finalPaymentStatus === "Rejected"
    );

  async function handleChooseProof() {
    setProofError("");

    if (isCashMethod) {
      return;
    }

    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          const compressedImage = await compressImageFile(file);
          setProofForm((prev) => ({
            ...prev,
            proofImage: compressedImage,
            proofImageUri: "",
            proofFileName: file.name,
          }));
        } catch (_error) {
          setProofError("Failed to process the selected image.");
        }
      };
      input.click();
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setProofError("Photo library permission is required to upload payment proof.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.72,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        setProofError("Failed to read the selected image.");
        return;
      }

      const processedAsset = asset.uri
        ? await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 1280 } }],
            { compress: 0.58, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          )
        : asset;
      const proofBase64 = processedAsset.base64 || asset.base64;
      const proofImage = `data:image/jpeg;base64,${proofBase64}`;
      setProofForm((prev) => ({
        ...prev,
        proofImage,
        proofImageUri: asset.uri || processedAsset.uri || "",
        proofFileName: asset.fileName || `payment-proof-${Date.now()}.jpg`,
      }));
    } catch (_error) {
      setProofError("Failed to pick the selected image.");
    }
  }

  async function handleSubmitProof() {
    setProofError("");
    if (!proofForm.method) {
      setProofError(`Please select a ${isFinalPaymentMode ? "final payment" : "down payment"} method.`);
      return;
    }
    const trimmedReference = String(proofForm.reference || "").trim();
    if (!trimmedReference) {
      setProofError("Reference number is required.");
      return;
    }
    if (trimmedReference.length > 80) {
      setProofError("Reference number must be 80 characters or less.");
      return;
    }
    if (!isCashMethod && !proofForm.proofImage) {
      setProofError(`Please upload a ${isFinalPaymentMode ? "final payment" : "down payment"} proof image.`);
      return;
    }

    try {
      setProofBusy(true);
      let referenceCheck = {
        transactionTimestamp: "",
        transactionTimestampRaw: "",
      };
      if (!isCashMethod) {
        setProofError("Checking receipt, reference, and timestamp...");
        referenceCheck = await validatePaymentProof({
          method: proofForm.method,
          reference: trimmedReference,
          proofImage: proofForm.proofImage,
          proofImageUri: proofForm.proofImageUri,
          dueAt: !isFinalPaymentMode ? payment?.downPaymentDueAt : "",
        });

        if (referenceCheck.status === "unreadable") {
          setProofError("Validation error: Unable to read the proof of payment. Please upload a clearer image.");
          return;
        }
        if (referenceCheck.status === "not-receipt") {
          setProofError("Validation error: The uploaded image does not look like a real payment receipt.");
          return;
        }
        if (referenceCheck.status !== "matched") {
          setProofError("Validation error: Reference number does not match the uploaded proof of payment.");
          return;
        }
        setProofError("");
      }

      const referenceCheckedAt = new Date().toISOString();
      await onSubmitProof?.(
        payment,
        isFinalPaymentMode
          ? {
              finalPaymentStatus: "For Verification",
              finalPaymentMethod: proofForm.method,
              finalPaymentReference: trimmedReference,
              finalPaymentProofUrl: isCashMethod ? "" : proofForm.proofImage,
              finalPaymentProofName: isCashMethod ? "" : proofForm.proofFileName,
              finalPaymentReferenceCheckStatus: isCashMethod ? "cash_not_required" : "matched",
              finalPaymentReferenceCheckedAt: referenceCheckedAt,
              finalPaymentTransactionTimestamp: isCashMethod ? "" : referenceCheck.transactionTimestamp,
              finalPaymentTransactionTimestampRaw: isCashMethod ? "" : referenceCheck.transactionTimestampRaw,
              status: "For Verification",
              method: proofForm.method,
              reference: trimmedReference,
              proofImage: String(payment?.proofImage || payment?.downPaymentProofUrl || "").trim(),
              proofFileName: String(payment?.proofFileName || payment?.downPaymentProofName || "").trim(),
              notes: proofForm.notes,
            }
          : {
              downPaymentStatus: "For Verification",
              downPaymentMethod: proofForm.method,
              downPaymentReference: trimmedReference,
              downPaymentProofUrl: isCashMethod ? "" : proofForm.proofImage,
              downPaymentProofName: isCashMethod ? "" : proofForm.proofFileName,
              downPaymentReferenceCheckStatus: isCashMethod ? "cash_not_required" : "matched",
              downPaymentReferenceCheckedAt: referenceCheckedAt,
              downPaymentTransactionTimestamp: isCashMethod ? "" : referenceCheck.transactionTimestamp,
              downPaymentTransactionTimestampRaw: isCashMethod ? "" : referenceCheck.transactionTimestampRaw,
              status: "For Verification",
              method: proofForm.method,
              reference: trimmedReference,
              proofImage: isCashMethod ? "" : proofForm.proofImage,
              proofFileName: isCashMethod ? "" : proofForm.proofFileName,
              notes: proofForm.notes,
            }
      );
    } catch (error) {
      setProofError(error?.message || "Failed to submit payment proof.");
    } finally {
      setProofBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.center}>
          <View style={styles.card}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {mode === "details" ? (
                <>
                  <Text style={styles.title}>View Payment Details</Text>

                  <Row label="Booking ID:" value={payment?.bookingId || payment?.id} />
                  <Row label="Booking Date:" value={formatDate(payment?.date)} />
                  <Row label="Customer:" value={payment?.customer} />
                  <Row label="Service:" value={payment?.service} />
                  <Row label="Appointment:" value={payment?.service || "Checking"} />
                  <Row label="Amount:" value={`P ${Number(getPaymentTotal?.(payment) || payment?.amount || 0).toLocaleString()}`} />

                  <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <View style={[styles.statusPill, pillStyle]}>
                      <Text style={styles.statusTxt}>{statusRaw}</Text>
                    </View>
                  </View>

                  <Row label="DP Status:" value={downPaymentStatus} />
                  <Row label="Final Status:" value={finalPaymentStatus} />
                  <Row label="Method:" value={payment?.finalPaymentMethod || payment?.downPaymentMethod || payment?.method} />
                  <Row label="Reference:" value={payment?.finalPaymentReference || payment?.downPaymentReference || payment?.reference} />
                  <Row label="Amount Paid:" value={`P ${Number(getAmountPaid?.(payment) || 0).toLocaleString()}`} />
                  <Row label="Remaining:" value={`P ${Number(getRemainingBalance?.(payment) || 0).toLocaleString()}`} />
                  <Row
                    label="DP Proof Submitted:"
                    value={payment?.downPaymentProofSubmittedAt ? formatDateTime(payment?.downPaymentProofSubmittedAt) : "-"}
                  />
                  <Row
                    label="Balance Proof Submitted:"
                    value={payment?.finalPaymentProofSubmittedAt ? formatDateTime(payment?.finalPaymentProofSubmittedAt) : "-"}
                  />
                  {payment?.downPaymentDueAt ? (
                    <Row
                      label="DP Due:"
                      value={`${formatDateTime(payment?.downPaymentDueAt)}${formatApproxTimeLeft(payment?.downPaymentDueAt) ? ` (${formatApproxTimeLeft(payment?.downPaymentDueAt)} left)` : ""}`}
                    />
                  ) : null}
                  {payment?.rewardId ? (
                    <Row
                      label="Reward Used:"
                      value={`${payment?.rewardName || "-"} (${payment?.rewardValue || payment?.rewardType || "-"})`}
                    />
                  ) : null}

                  {downPaymentProofImage ? (
                    <View style={styles.proofPreviewWrap}>
                      <Text style={styles.blockLabel}>Down Payment Proof</Text>
                      <Image source={{ uri: downPaymentProofImage }} style={styles.proofPreviewImage} resizeMode="cover" />
                    </View>
                  ) : null}

                  {finalPaymentProofImage ? (
                    <View style={styles.proofPreviewWrap}>
                      <Text style={styles.blockLabel}>Final Payment Proof</Text>
                      <Image source={{ uri: finalPaymentProofImage }} style={styles.proofPreviewImage} resizeMode="cover" />
                    </View>
                  ) : null}

                  <View style={styles.row}>
                    <Text style={styles.label}>Invoice:</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.miniBtn} onPress={() => onViewInvoice?.(payment)}>
                      <Text style={styles.miniBtnTxt}>View</Text>
                    </TouchableOpacity>
                  </View>

                  {canUploadDownPayment || canUploadFinalPayment ? (
                    <View style={styles.rowTop}>
                      <Text style={styles.label}>Proof:</Text>
                      <View style={styles.proofActionsCol}>
                        {canUploadDownPayment ? (
                          <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.proofBtn}
                            onPress={() => {
                              setProofForm((prev) => ({
                                ...prev,
                                reference: String(payment?.downPaymentReference || payment?.reference || "").trim(),
                                method: String(payment?.downPaymentMethod || payment?.method || "").trim(),
                                proofImage: downPaymentProofImage,
                                proofImageUri: "",
                                proofFileName: downPaymentProofName,
                              }));
                              setMode("downPaymentProof");
                            }}
                          >
                            <Text style={styles.proofBtnTxt}>
                              {downPaymentProofImage ? "Update DP Proof" : "Upload DP Proof"}
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        {canUploadFinalPayment ? (
                          <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.proofBtnSecondary}
                            onPress={() => {
                              setProofForm((prev) => ({
                                ...prev,
                                reference: String(payment?.finalPaymentReference || "").trim(),
                                method: String(payment?.finalPaymentMethod || "").trim(),
                                proofImage: finalPaymentProofImage,
                                proofImageUri: "",
                                proofFileName: finalPaymentProofName,
                              }));
                              setMode("finalPaymentProof");
                            }}
                          >
                            <Text style={styles.proofBtnSecondaryTxt}>
                              {finalPaymentProofImage ? "Update Balance Proof" : "Upload Balance Proof"}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.title}>{isFinalPaymentMode ? "Submit Remaining Balance Proof" : "Submit Down Payment Proof"}</Text>

                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryLabel}>Total Amount</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(getPaymentTotal?.(payment) || payment?.amount || 0)}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryLabel}>{isFinalPaymentMode ? "Amount Paid" : "Required DP"}</Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(isFinalPaymentMode ? (getAmountPaid?.(payment) || 0) : Number(payment?.downPaymentAmount || 0))}
                      </Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryLabel}>Remaining Balance</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(getRemainingBalance?.(payment) || 0)}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryLabel}>{isFinalPaymentMode ? "Final Status" : "DP Status"}</Text>
                      <Text style={styles.summaryValue}>{isFinalPaymentMode ? finalPaymentStatus : downPaymentStatus}</Text>
                    </View>
                  </View>

                  <FieldLabel text={isFinalPaymentMode ? "Final Payment Method" : "Down Payment Method"} />
                  <View style={styles.choiceWrap}>
                    {["Cash", "E-Wallet", "Bank Transfer", "Online Transfer"].map((option) => {
                      const active = proofForm.method === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          activeOpacity={0.85}
                          style={[styles.choiceBtn, active && styles.choiceBtnActive]}
                          onPress={() =>
                            setProofForm((prev) => ({
                              ...prev,
                              method: option,
                              ...(isCashPaymentMethod(option) ? { proofImage: "", proofImageUri: "", proofFileName: "" } : {}),
                            }))
                          }
                        >
                          <Text style={[styles.choiceTxt, active && styles.choiceTxtActive]}>{option}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.cashNotice}>
                    Cash payment is for walk-in customers only.
                  </Text>

                  {!isFinalPaymentMode ? (
                    <>
                      <FieldLabel text={isPaid ? "Applied Reward" : "Apply Reward"} />
                      <View style={styles.choiceWrap}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          disabled={isPaid}
                          style={[styles.choiceBtn, !proofForm.rewardId && styles.choiceBtnActive, isPaid && styles.choiceBtnDisabled]}
                          onPress={() => {
                            if (isPaid) return;
                            setProofForm((prev) => ({ ...prev, rewardId: "" }));
                          }}
                        >
                          <Text style={[styles.choiceTxt, !proofForm.rewardId && styles.choiceTxtActive, isPaid && styles.choiceTxtDisabled]}>No reward</Text>
                        </TouchableOpacity>
                        {usableRewards.map((reward) => {
                          const active = proofForm.rewardId === reward.id;
                          return (
                            <TouchableOpacity
                              key={reward.id}
                              activeOpacity={0.85}
                              disabled={isPaid}
                              style={[styles.choiceBtn, active && styles.choiceBtnActive, isPaid && styles.choiceBtnDisabled]}
                              onPress={() => {
                                if (isPaid) return;
                                setProofForm((prev) => ({ ...prev, rewardId: reward.id }));
                              }}
                            >
                              <Text style={[styles.choiceTxt, active && styles.choiceTxtActive, isPaid && styles.choiceTxtDisabled]}>
                                {reward.rewardName || reward.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {selectedReward ? (
                        <View style={styles.rewardPreview}>
                          <Text style={styles.rewardTitle}>{selectedReward.rewardName}</Text>
                          <Text style={styles.rewardMeta}>{selectedReward.rewardType || "Reward"} - {selectedReward.rewardValue || "Benefit"}</Text>
                          <Text style={styles.rewardMeta}>Discount preview: -{formatCurrency(rewardPreview.discountAmount)}</Text>
                          <Text style={styles.rewardMeta}>Final amount due: {formatCurrency(rewardPreview.finalAmount)}</Text>
                        </View>
                      ) : null}
                    </>
                  ) : null}

                  <FieldLabel text="Reference Number" />
                  <TextInput
                    value={proofForm.reference}
                    onChangeText={(value) => setProofForm((prev) => ({ ...prev, reference: value }))}
                    placeholder="Enter reference number"
                    placeholderTextColor="#9AA0A6"
                    style={styles.input}
                  />

                  <FieldLabel text="Photo Proof" />
                  <TouchableOpacity activeOpacity={0.9} style={[styles.uploadBtn, isCashMethod && styles.uploadBtnDisabled]} onPress={handleChooseProof}>
                    <Text style={styles.uploadBtnTxt}>
                      {isCashMethod ? "Cash payment - no image required" : proofForm.proofFileName ? "Change Photo Proof" : "Choose Image"}
                    </Text>
                  </TouchableOpacity>
                  {proofForm.proofFileName ? <Text style={styles.fileTxt}>Selected: {proofForm.proofFileName}</Text> : null}
                  {proofForm.proofImage ? (
                    <Image source={{ uri: proofForm.proofImage }} style={styles.proofPreviewImage} resizeMode="cover" />
                  ) : null}

                  {proofError ? <Text style={styles.errorTxt}>{proofError}</Text> : null}

                  <FieldLabel text="Notes" />
                  <TextInput
                    value={proofForm.notes}
                    editable={false}
                    multiline
                    placeholder="Admin/staff notes will appear here."
                    placeholderTextColor="#9AA0A6"
                    style={[styles.input, styles.textArea, styles.inputDisabled]}
                  />

                  <View style={styles.actionsRow}>
                    <TouchableOpacity activeOpacity={0.9} style={styles.secondaryBtn} onPress={() => setMode("details")}>
                      <Text style={styles.secondaryBtnTxt}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.9} style={styles.primaryBtn} onPress={handleSubmitProof}>
                      <Text style={styles.primaryBtnTxt}>
                        {proofBusy ? "Submitting..." : isFinalPaymentMode ? "Submit Balance Proof" : "Submit DP Proof"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>

            {mode === "details" ? (
              <View style={styles.actions}>
                <TouchableOpacity activeOpacity={0.9} style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeTxt}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

function FieldLabel({ text }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}
