import { Platform } from "react-native";

export function normalizePaymentReference(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function getReferenceCheckUnavailableReason({ method, reference, proofImage }) {
  const normalizedMethod = String(method || "").trim().toLowerCase();
  if (normalizedMethod === "cash") return "cash";
  if (!String(proofImage || "").trim()) return "no-proof";
  if (!String(reference || "").trim()) return "no-reference";
  return "";
}

export function getReferenceCheckMessage(reason) {
  if (reason === "cash") return "Cash payment - reference check not required.";
  if (reason === "no-proof") return "No payment proof available for reference checking.";
  if (reason === "no-reference") return "No reference number provided by customer.";
  if (reason === "checking") return "Checking reference...";
  if (reason === "matched") return "Reference matched";
  if (reason === "not-matched") return "Reference not found";
  if (reason === "not-receipt") return "The image does not look like a payment receipt.";
  return "Unable to read proof image";
}

export function getReferenceValidationDisplay({ method, reference, proofImage, status, checkedAt }) {
  const normalizedMethod = String(method || "").trim().toLowerCase();
  if (normalizedMethod === "cash" || status === "cash_not_required") {
    return {
      status: "cash",
      message: getReferenceCheckMessage("cash"),
      checkedAt,
    };
  }
  if (!String(proofImage || "").trim()) {
    return {
      status: "no-proof",
      message: getReferenceCheckMessage("no-proof"),
      checkedAt,
    };
  }
  if (!String(reference || "").trim()) {
    return {
      status: "no-reference",
      message: getReferenceCheckMessage("no-reference"),
      checkedAt,
    };
  }
  if (status === "matched") {
    return {
      status: "matched",
      message: "Reference matched during customer submission.",
      checkedAt,
    };
  }
  if (status === "not-matched" || status === "unreadable") {
    return {
      status,
      message: getReferenceCheckMessage(status),
      checkedAt,
    };
  }
  return {
    status: "legacy-not-checked",
    message: "Reference validation not available for legacy records.",
    checkedAt,
  };
}

async function loadTesseract() {
  const tesseractModule = await import("tesseract.js");
  return tesseractModule.default || tesseractModule;
}

async function extractTextWithTesseract(proofImage) {
  const tesseract = await loadTesseract();
  const recognize = tesseract.recognize || tesseract.default?.recognize;

  if (typeof recognize !== "function") {
    throw new Error("Tesseract.js OCR is unavailable.");
  }

  const options = Platform.OS === "web"
    ? { logger: () => {} }
    : { logger: () => {}, workerBlobURL: false };
  const result = await recognize(proofImage, "eng", options);
  return String(result?.data?.text || result?.text || "").trim();
}

async function extractTextWithNativeMlKit(proofImageUri) {
  const mlKitModule = await import("@react-native-ml-kit/text-recognition");
  const textRecognition = mlKitModule.default || mlKitModule;
  const recognize = textRecognition.recognize || textRecognition.default?.recognize;

  if (typeof recognize !== "function") {
    throw new Error("Native OCR is unavailable.");
  }

  const result = await recognize(proofImageUri);
  return String(result?.text || "").trim();
}

async function extractProofText({ proofImage, proofImageUri }) {
  if (Platform.OS !== "web" && String(proofImageUri || "").trim()) {
    return extractTextWithNativeMlKit(proofImageUri);
  }

  return extractTextWithTesseract(proofImage);
}

function normalizeProofText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasReceiptLikeKeywords(text) {
  const normalized = normalizeProofText(text).toLowerCase();
  if (!normalized) return { valid: false, matchedKeywords: [] };

  const keywords = [
    "reference",
    "ref no",
    "ref #",
    "transaction",
    "receipt",
    "payment",
    "amount",
    "total",
    "date",
    "time",
    "gcash",
    "maya",
    "bank",
    "transfer",
    "sender",
    "recipient",
    "account",
    "paid",
    "successful",
  ];

  const matchedKeywords = keywords.filter((keyword) => normalized.includes(keyword));
  const hasCurrencyAmount = /(?:php|p|₱)\s*\d|(?:\d[\d,]*\.\d{2})/.test(normalized);
  const hasDateLikeToken =
    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/.test(normalized) ||
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4}\b/i.test(normalized);

  return {
    valid: matchedKeywords.length >= 2 && (hasCurrencyAmount || hasDateLikeToken),
    matchedKeywords,
  };
}

function parseTimestampCandidate(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return null;

  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return { raw: value, iso: directDate.toISOString() };
  }

  const normalized = value
    .replace(/([0-9])([AaPp][Mm])\b/g, "$1 $2")
    .replace(/([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})(\d{1,2}:\d{2})/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  const withCurrentYear = normalized.replace(
    /\b(\d{1,2}[\/-]\d{1,2})(?![\/-]\d{2,4})\b/,
    `$1/${new Date().getFullYear()}`
  );
  const nextDate = new Date(withCurrentYear);
  if (!Number.isNaN(nextDate.getTime())) {
    return { raw: value, iso: nextDate.toISOString() };
  }

  return null;
}

function extractTransactionTimestamp(text) {
  const normalized = normalizeProofText(text)
    .replace(/([0-9])([AaPp][Mm])\b/g, "$1 $2")
    .replace(/([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})(\d{1,2}:\d{2})/g, "$1 $2");
  if (!normalized) return null;

  const patterns = [
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|0ct)[a-z0-9]*\.?\s+\d{1,2},?\s+\d{2,4}(?:\s+\d{1,2}:\d{2}\s*(?:am|pm)?)?/i,
    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}(?:\s+\d{1,2}:\d{2}\s*(?:am|pm)?)?\b/i,
    /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}(?:\s+\d{1,2}:\d{2}\s*(?:am|pm)?)?\b/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const parsed = parseTimestampCandidate(match?.[0] || "");
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

export async function validatePaymentProof({ method, reference, proofImage, proofImageUri = "", dueAt = "" }) {
  const unavailableReason = getReferenceCheckUnavailableReason({ method, reference, proofImage });
  if (unavailableReason) {
    return {
      status: unavailableReason,
      message: getReferenceCheckMessage(unavailableReason),
      detectedText: "",
      receiptLike: unavailableReason === "cash",
      transactionTimestamp: "",
      transactionTimestampRaw: "",
    };
  }

  try {
    const detectedText = await extractProofText({ proofImage, proofImageUri });
    const receiptCheck = hasReceiptLikeKeywords(detectedText);
    const normalizedReference = normalizePaymentReference(reference);
    const normalizedDetectedText = normalizePaymentReference(detectedText);
    const transactionTimestamp = extractTransactionTimestamp(detectedText);

    if (!normalizedDetectedText) {
      return {
        status: "unreadable",
        message: getReferenceCheckMessage("unreadable"),
        detectedText,
        receiptLike: false,
        transactionTimestamp: "",
        transactionTimestampRaw: "",
      };
    }

    if (!receiptCheck.valid) {
      return {
        status: "not-receipt",
        message: getReferenceCheckMessage("not-receipt"),
        detectedText,
        receiptLike: false,
        transactionTimestamp: transactionTimestamp?.iso || "",
        transactionTimestampRaw: transactionTimestamp?.raw || "",
      };
    }

    const matched = Boolean(normalizedReference && normalizedDetectedText.includes(normalizedReference));
    return {
      status: matched ? "matched" : "not-matched",
      message: getReferenceCheckMessage(matched ? "matched" : "not-matched"),
      detectedText,
      receiptLike: true,
      transactionTimestamp: transactionTimestamp?.iso || "",
      transactionTimestampRaw: transactionTimestamp?.raw || "",
    };
  } catch (_error) {
    return {
      status: "unreadable",
      message: getReferenceCheckMessage("unreadable"),
      detectedText: "",
      receiptLike: false,
      transactionTimestamp: "",
      transactionTimestampRaw: "",
    };
  }
}

export async function checkPaymentReference(input) {
  return validatePaymentProof(input);
}
