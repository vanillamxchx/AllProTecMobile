function firstImage(...values) {
  return values
    .map((value) => String(value || "").trim())
    .find(Boolean) || "";
}

function getPaymentRecord(payment) {
  return payment && typeof payment === "object" ? payment : {};
}

function getLegacyProofImage(payment = {}) {
  const record = getPaymentRecord(payment);
  return firstImage(
    record.proofImage,
    record.proofUrl,
    record.paymentProofUrl,
    record.paymentProofImage,
    record.paymentProof,
    record.receiptImage,
    record.receiptUrl,
    record.receipt,
    record.image
  );
}

function isFinalPaymentSubmitted(payment = {}) {
  const record = getPaymentRecord(payment);
  const finalStatus = String(record.finalPaymentStatus || "").trim().toLowerCase();
  return Boolean(record.finalPaymentProofSubmittedAt) ||
    ["for verification", "paid", "rejected"].includes(finalStatus);
}

export function getDownPaymentProofImage(payment = {}) {
  const record = getPaymentRecord(payment);
  const downPaymentProof = firstImage(
    record.downPaymentProofUrl,
    record.downPaymentProofImage,
    record.downPaymentProof,
    record.downPaymentImage,
    record.dpProofUrl,
    record.dpProofImage
  );
  if (downPaymentProof) return downPaymentProof;
  return isFinalPaymentSubmitted(payment) ? "" : getLegacyProofImage(payment);
}

export function getFinalPaymentProofImage(payment = {}) {
  const record = getPaymentRecord(payment);
  const finalProof = firstImage(
    record.finalPaymentProofUrl,
    record.finalPaymentProofImage,
    record.finalPaymentProof,
    record.finalPaymentImage,
    record.balancePaymentProofUrl,
    record.balanceProofUrl,
    record.balanceProofImage,
    record.balanceProof
  );
  if (finalProof) return finalProof;

  const hasSeparateDownPaymentProof = Boolean(
    firstImage(
      record.downPaymentProofUrl,
      record.downPaymentProofImage,
      record.downPaymentProof,
      record.downPaymentImage,
      record.dpProofUrl,
      record.dpProofImage
    )
  );
  return isFinalPaymentSubmitted(payment) && !hasSeparateDownPaymentProof
    ? getLegacyProofImage(payment)
    : "";
}
