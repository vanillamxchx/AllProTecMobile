import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useMobileData } from "../../context/MobileDataContext.jsx";
import styles from "../../styles/css/admin/adminFinancialTrackerStyles.js";
import { exportTabularPdf } from "../../services/exportPdf.js";

const ICON_SEARCH = require("../../styles/icons/search.png");

const CATEGORY_COLORS = {
  Materials: "violet",
  Utilities: "cyan",
  Equipment: "amber",
  Supplies: "green",
  Marketing: "pink",
  Commissions: "cyan",
};

const EXPENSE_CATEGORIES = ["Materials", "Utilities", "Equipment", "Supplies", "Marketing", "Commissions"];
const EXPENSE_PAGE_SIZE = 5;

function peso(value) {
  return `PHP ${Number(value || 0).toLocaleString("en-PH")}`;
}

function percentOf(value, max) {
  const safeValue = Number(value || 0);
  const safeMax = Number(max || 0);
  if (safeValue <= 0 || safeMax <= 0) return 0;
  return Math.min((safeValue / safeMax) * 100, 100);
}

function toNumber(value) {
  const normalized = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  const parsed = Number(normalized || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isFinancialValidationMessage(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized === "financial data is required." ||
    normalized === "financial data is required" ||
    normalized.includes("financial data is required") ||
    normalized.includes("no financial data") ||
    normalized.includes("provide financial data")
  );
}

function isPaidPaymentRecord(payment) {
  const legacyStatus = String(payment?.status || "").trim().toLowerCase();
  const finalPaymentStatus = String(payment?.finalPaymentStatus || "").trim().toLowerCase();
  return legacyStatus === "paid" || finalPaymentStatus === "paid";
}

function normalizeCommissionRate(rawRate, earned, serviceValue) {
  const directRate = toNumber(rawRate);
  if (directRate > 0) {
    return directRate > 0 && directRate <= 1 ? Number((directRate * 100).toFixed(2)) : directRate;
  }

  const safeEarned = toNumber(earned);
  const safeServiceValue = toNumber(serviceValue);
  if (safeEarned > 0 && safeServiceValue > 0) {
    return Number(((safeEarned / safeServiceValue) * 100).toFixed(2));
  }

  return 10;
}

function normalizeCommissionItem(item) {
  const source = item && typeof item === "object" ? item : {};
  const serviceValue = toNumber(
    source.serviceValue ??
      source.tally ??
      source.serviceAmount ??
      source.bookingAmount ??
      source.baseAmount ??
      source.amount
  );
  const rate = normalizeCommissionRate(
    source.rate ?? source.commissionRate ?? source.percentage ?? source.commissionPercentage,
    source.earned ?? source.commission ?? source.amountEarned,
    serviceValue
  );
  const earned = toNumber(
    source.earned ??
      source.commission ??
      source.amountEarned ??
      (serviceValue > 0 && rate > 0 ? (serviceValue * rate) / 100 : 0)
  );

  return {
    ...source,
    id: source.id || source._id || `${source.worker || "worker"}-${source.service || "service"}-${source.date || "date"}`,
    worker: source.worker || source.staffName || source.assignedTo || source.assigned || "-",
    role: source.role || source.staffRole || source.userType || "Staff",
    service: source.service || source.serviceName || source.bookingService || "-",
    serviceValue,
    tally: serviceValue,
    rate,
    earned,
    date: source.date || source.createdAt || source.updatedAt || "-",
  };
}

function normalizeSectionValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
  }

  const text = String(value).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry || "").trim()).filter(Boolean);
    }
  } catch (_error) {}

  return text
    .split(/\n|•|-/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeFinancialAiResponse(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    return {
      summary: raw.trim(),
      keyObservations: [],
      possibleCauses: [],
      recommendations: [],
      warnings: [],
      model: "",
    };
  }

  const source = raw.interpretation || raw.result || raw.data || raw;
  if (typeof source === "string") {
    return {
      summary: source.trim(),
      keyObservations: [],
      possibleCauses: [],
      recommendations: [],
      warnings: [],
      model: raw.model || "",
    };
  }
  const summary =
    source.summary ||
    source.overview ||
    source.interpretationSummary ||
    source.message ||
    source.text ||
    "";

  return {
    summary: String(summary || "").trim(),
    keyObservations: normalizeSectionValue(
      source.keyObservations || source.observations || source.highlights
    ),
    possibleCauses: normalizeSectionValue(
      source.possibleCauses || source.causes || source.drivers
    ),
    recommendations: normalizeSectionValue(
      source.recommendations || source.actions || source.nextSteps
    ),
    warnings: normalizeSectionValue(
      source.warnings || source.risks || source.alerts
    ),
    model: source.model || raw.model || "",
  };
}

function normalizeAvailableResponse(raw) {
  if (!raw) return { available: false, message: "AI unavailable right now." };
  if (raw.available === false) {
    return { available: false, message: raw.message || "AI unavailable right now." };
  }
  if (isFinancialValidationMessage(raw.message)) {
    return { available: false, message: raw.message || "Financial data is required." };
  }

  const normalized = normalizeFinancialAiResponse(raw);
  if (isFinancialValidationMessage(normalized?.summary)) {
    return { available: false, message: normalized.summary || raw.message || "Financial data is required." };
  }
  const hasContent =
    normalized &&
    (normalized.summary ||
      normalized.keyObservations.length ||
      normalized.possibleCauses.length ||
      normalized.recommendations.length ||
      normalized.warnings.length);

  if (!hasContent) {
    return {
      available: false,
      message: raw.message || "AI returned an unreadable financial interpretation.",
    };
  }

  return { available: true, ...normalized };
}

function buildFinancialFallbackInterpretation({
  totalRevenue,
  totalExpenses,
  totalCommissions,
  netProfit,
  filteredExpenses,
  filteredCommissions,
  paidPayments,
}) {
  const topExpense = [...filteredExpenses]
    .sort((a, b) => toNumber(b.amount) - toNumber(a.amount))[0];
  const topCommission = [...filteredCommissions]
    .sort((a, b) => toNumber(b.earned) - toNumber(a.earned))[0];
  const commissionShare = totalRevenue > 0
    ? Number(((totalCommissions / totalRevenue) * 100).toFixed(2))
    : 0;
  const expenseShare = totalRevenue > 0
    ? Number(((totalExpenses / totalRevenue) * 100).toFixed(2))
    : 0;

  const keyObservations = [];
  const possibleCauses = [];
  const recommendations = [];
  const warnings = [];

  if (totalRevenue > 0) {
    keyObservations.push(`Paid revenue currently totals ${peso(totalRevenue)} from ${paidPayments.length} paid transaction(s).`);
  } else {
    warnings.push("No paid revenue has been recorded yet, so profitability cannot be confirmed.");
  }

  keyObservations.push(`Total expenses are ${peso(totalExpenses)} and total commissions are ${peso(totalCommissions)}.`);

  if (topExpense) {
    possibleCauses.push(`The largest recorded expense in the current view is ${topExpense.description || "an expense"} at ${peso(topExpense.amount)}.`);
  }

  if (topCommission) {
    keyObservations.push(`${topCommission.worker || "A staff member"} has the highest visible commission at ${peso(topCommission.earned)}.`);
  }

  if (netProfit > 0) {
    keyObservations.push(`Net profit is positive at ${peso(netProfit)}.`);
  } else if (netProfit < 0) {
    warnings.push(`Net profit is negative at ${peso(netProfit)}.`);
    possibleCauses.push("Expenses and commissions are currently outweighing collected revenue.");
  } else {
    warnings.push("Net profit is currently break-even.");
  }

  if (expenseShare >= 70) {
    warnings.push(`Expenses are consuming ${expenseShare}% of revenue in the current data set.`);
    recommendations.push("Review the largest expense categories first and validate whether recent costs are expected.");
  }

  if (commissionShare >= 20) {
    warnings.push(`Commissions account for ${commissionShare}% of revenue, which is high for the current totals.`);
    recommendations.push("Check whether recent high-value completed services are skewing commission totals or if service pricing needs review.");
  } else if (commissionShare > 0) {
    keyObservations.push(`Commissions represent ${commissionShare}% of paid revenue.`);
  }

  if (!recommendations.length) {
    recommendations.push("Keep tracking paid revenue against expenses and commissions to confirm the current margin trend over time.");
  }

  const summary = totalRevenue > 0
    ? `Fallback analysis: revenue is ${peso(totalRevenue)}, expenses are ${peso(totalExpenses)}, commissions are ${peso(totalCommissions)}, and net profit is ${peso(netProfit)}.`
    : "Fallback analysis: there is not enough paid revenue yet to produce a strong financial trend from the current data.";

  return {
    available: true,
    summary,
    keyObservations,
    possibleCauses,
    recommendations,
    warnings,
    model: "Local fallback analysis",
  };
}

export default function AdminFinancialTracker() {
  const {
    expenses,
    commissions,
    payments,
    users,
    getPaymentTotal,
    generateFinancialInterpretation,
    generateFinancialTrackerInterpretation,
    generateFinanceInterpretation,
    generateAiFinancialInterpretation,
  } = useMobileData();
  const [expenseQuery, setExpenseQuery] = useState("");
  const [expenseType, setExpenseType] = useState("All types");
  const [expensePage, setExpensePage] = useState(1);
  const [workerQuery, setWorkerQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [aiState, setAiState] = useState({
    status: "idle",
    message: "",
    summary: "",
    keyObservations: [],
    possibleCauses: [],
    recommendations: [],
    warnings: [],
    model: "",
  });
  const normalizedCommissions = useMemo(
    () => commissions.map((item) => normalizeCommissionItem(item)),
    [commissions]
  );

  const paidPayments = useMemo(
    () => payments.filter((item) => isPaidPaymentRecord(item)),
    [payments]
  );
  const totalRevenue = useMemo(
    () => paidPayments.reduce((sum, item) => sum + Number(getPaymentTotal?.(item) || item.finalAmount || item.amount || 0), 0),
    [getPaymentTotal, paidPayments]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );
  const totalCommissions = useMemo(
    () => normalizedCommissions.reduce((sum, item) => sum + Number(item.earned || 0), 0),
    [normalizedCommissions]
  );
  const netProfit = totalRevenue - totalExpenses - totalCommissions;

  const staffOptions = useMemo(
    () =>
      users
        .filter((user) => String(user.userType || "").trim().toLowerCase() === "staff" && user.name)
        .map((user) => user.name)
        .filter((name, index, list) => list.indexOf(name) === index),
    [users]
  );

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = expenseQuery.toLowerCase();
    return expenses.filter((item) => {
      const matchesText = `${item.description} ${item.note} ${item.category} ${item.paidBy}`
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesType = expenseType === "All types" || item.category === expenseType;
      const matchesFrom = !dateFrom || item.date >= dateFrom;
      const matchesTo = !dateTo || item.date <= dateTo;
      return matchesText && matchesType && matchesFrom && matchesTo;
    });
  }, [expenses, expenseQuery, expenseType, dateFrom, dateTo]);

  const filteredCommissions = useMemo(() => {
    const normalizedWorker = String(workerQuery || "").trim().toLowerCase();
    return normalizedCommissions.filter((item) => {
      const matchesWorker = !normalizedWorker || String(item.worker || "").trim().toLowerCase().includes(normalizedWorker);
      const matchesFrom = !dateFrom || item.date >= dateFrom;
      const matchesTo = !dateTo || item.date <= dateTo;
      return matchesWorker && matchesFrom && matchesTo;
    });
  }, [normalizedCommissions, workerQuery, dateFrom, dateTo]);
  const visibleCommissionTotal = useMemo(
    () => filteredCommissions.reduce((sum, item) => sum + Number(item.earned || 0), 0),
    [filteredCommissions]
  );

  const expenseTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredExpenses.length / EXPENSE_PAGE_SIZE)),
    [filteredExpenses.length]
  );
  const safeExpensePage = Math.min(Math.max(expensePage, 1), expenseTotalPages);
  const visibleExpenses = useMemo(
    () =>
      filteredExpenses.slice(
        (safeExpensePage - 1) * EXPENSE_PAGE_SIZE,
        safeExpensePage * EXPENSE_PAGE_SIZE
      ),
    [filteredExpenses, safeExpensePage]
  );

  const compareMax = useMemo(
    () => Math.max(totalRevenue, totalExpenses, totalCommissions, 0),
    [totalRevenue, totalExpenses, totalCommissions]
  );

  const financialAiPayload = useMemo(
    () => ({
      totalRevenue,
      totalExpenses,
      totalCommissions,
      netProfit,
      filteredExpenseCount: filteredExpenses.length,
      filteredCommissionCount: filteredCommissions.length,
      paymentCount: paidPayments.length,
      revenue: totalRevenue,
      expensesTotal: totalExpenses,
      commissionsTotal: totalCommissions,
      paidRevenue: totalRevenue,
      expenses: (filteredExpenses.length ? filteredExpenses : expenses).slice(0, 20).map((item) => ({
        date: item.date,
        description: item.description,
        category: item.category,
        amount: Number(item.amount || 0),
        paidBy: item.paidBy,
      })),
      commissions: (filteredCommissions.length ? filteredCommissions : normalizedCommissions).slice(0, 20).map((item) => ({
        worker: item.worker,
        role: item.role,
        service: item.service,
        serviceValue: Number(item.serviceValue || 0),
        rate: Number(item.rate || 0),
        earned: Number(item.earned || 0),
      })),
      payments: (paidPayments.length ? paidPayments : payments)
        .slice(0, 20)
        .map((item) => ({
          date: item.date,
          service: item.service,
          amount: Number(getPaymentTotal?.(item) || item.finalAmount || item.amount || 0),
          status: item.status,
          finalPaymentStatus: item.finalPaymentStatus || "",
          downPaymentStatus: item.downPaymentStatus || "",
          method: item.method || item.paymentMethod || "",
        })),
    }),
    [
      expenses,
      filteredCommissions,
      filteredExpenses,
      netProfit,
      normalizedCommissions,
      paidPayments,
      payments,
      getPaymentTotal,
      totalCommissions,
      totalExpenses,
      totalRevenue,
    ]
  );

  const aiLines = useMemo(() => {
    const lines = [];
    if (aiState.summary) lines.push(aiState.summary);
    aiState.keyObservations.forEach((item) => lines.push(`Observation: ${item}`));
    aiState.possibleCauses.forEach((item) => lines.push(`Possible cause: ${item}`));
    aiState.recommendations.forEach((item) => lines.push(`Recommendation: ${item}`));
    aiState.warnings.forEach((item) => lines.push(`Warning: ${item}`));
    return lines;
  }, [aiState]);

  useEffect(() => {
    setExpensePage((prev) => Math.min(Math.max(prev, 1), expenseTotalPages));
  }, [expenseTotalPages]);

  const clearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  const handleGenerateInterpretation = async () => {
    const aiGenerator =
      generateFinancialInterpretation ||
      generateFinancialTrackerInterpretation ||
      generateFinanceInterpretation ||
      generateAiFinancialInterpretation;

    if (typeof aiGenerator !== "function") {
      setAiState({
        status: "error",
        message: "AI interpretation is not available right now.",
        summary: "",
        keyObservations: [],
        possibleCauses: [],
        recommendations: [],
        warnings: [],
        model: "",
      });
      return;
    }

    setAiState({
      status: "loading",
      message: "",
      summary: "",
      keyObservations: [],
      possibleCauses: [],
      recommendations: [],
      warnings: [],
      model: "",
    });

    try {
      const response = await aiGenerator(financialAiPayload);
      const normalizedResponse = normalizeAvailableResponse(response);

      if (!normalizedResponse.available) {
        setAiState({
          status: "success",
          message: normalizedResponse.message || "Using local fallback analysis.",
          ...buildFinancialFallbackInterpretation({
            totalRevenue,
            totalExpenses,
            totalCommissions,
            netProfit,
            filteredExpenses,
            filteredCommissions,
            paidPayments,
          }),
        });
        return;
      }

      setAiState({
        status: "success",
        message: "",
        summary: normalizedResponse.summary,
        keyObservations: normalizedResponse.keyObservations,
        possibleCauses: normalizedResponse.possibleCauses,
        recommendations: normalizedResponse.recommendations,
        warnings: normalizedResponse.warnings,
        model: normalizedResponse.model,
      });
    } catch (error) {
      const fallback = buildFinancialFallbackInterpretation({
        totalRevenue,
        totalExpenses,
        totalCommissions,
        netProfit,
        filteredExpenses,
        filteredCommissions,
        paidPayments,
      });

      setAiState({
        status: "success",
        message: error.message || "Remote AI unavailable. Showing local fallback analysis.",
        ...fallback,
      });
    }
  };

  const exportPdf = () =>
    exportTabularPdf({
      title: "Admin Financial Tracker Report",
      subtitle: "Revenue, expenses, commissions, and performance insights.",
      sections: [
        {
          title: "Summary",
          columns: ["Metric", "Value"],
          rows: [
            ["Total Revenue", peso(totalRevenue)],
            ["Total Expenses", peso(totalExpenses)],
            ["Total Commissions", peso(totalCommissions)],
            ["Net Profit", peso(netProfit)],
          ],
        },
        {
          title: "Interpretation",
          columns: ["Insight"],
          rows: aiLines.map((line) => [line]),
          emptyMessage: "No AI interpretation generated yet.",
        },
        {
          title: "Filtered Expenses",
          columns: ["Date", "Description", "Category", "Amount", "Paid By", "Note"],
          rows: filteredExpenses.map((item) => [
            item.date || "-",
            item.description || "-",
            item.category || "-",
            peso(item.amount),
            item.paidBy || "-",
            item.note || "-",
          ]),
          emptyMessage: "No expenses matched the selected filters.",
        },
        {
          title: "Filtered Worker Commissions",
          columns: ["Date", "Worker", "Role", "Service", "Service Value", "Rate", "Earned"],
          rows: filteredCommissions.map((item) => [
            item.date || "-",
            item.worker || "-",
            item.role || "-",
            item.service || "-",
            peso(item.serviceValue),
            `${item.rate || 0}%`,
            peso(item.earned),
          ]),
          emptyMessage: "No commission records matched the selected filters.",
        },
      ],
    });

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View style={styles.dateFilterRow}>
          <TextInput
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholder="From YYYY-MM-DD"
            placeholderTextColor="#9AA0A6"
            style={styles.dateInput}
          />
          <TextInput
            value={dateTo}
            onChangeText={setDateTo}
            placeholder="To YYYY-MM-DD"
            placeholderTextColor="#9AA0A6"
            style={styles.dateInput}
          />
          <TouchableOpacity activeOpacity={0.85} style={styles.ghostBtn} onPress={clearDateFilters}>
            <Text style={styles.ghostBtnTxt}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity activeOpacity={0.85} style={styles.exportBtn} onPress={exportPdf}>
            <Text style={styles.exportTxt}>Export PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pageIntro}>
        <Text style={styles.h1}>Financial Tracker</Text>
        <Text style={styles.h2}>Revenue, expenses, and worker commissions.</Text>
      </View>

      <View style={styles.topGrid}>
        <View style={styles.leftStack}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Daily Expenses</Text>
              <View style={styles.inlineFilters}>
                <View style={styles.inlineSearchBox}>
                  <Image source={ICON_SEARCH} style={styles.searchIcon} resizeMode="contain" />
                  <TextInput
                    value={expenseQuery}
                    onChangeText={(value) => {
                      setExpenseQuery(value);
                      setExpensePage(1);
                    }}
                    placeholder="Search..."
                    placeholderTextColor="#9AA0A6"
                    style={styles.inlineSearchInput}
                  />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChipRow}>
                  {["All types", ...EXPENSE_CATEGORIES].map((category) => {
                    const active = expenseType === category;
                    return (
                      <TouchableOpacity
                        key={category}
                        activeOpacity={0.85}
                        style={[styles.typeChip, active && styles.typeChipActive]}
                        onPress={() => {
                          setExpenseType(category);
                          setExpensePage(1);
                        }}
                      >
                        <Text style={[styles.typeChipTxt, active && styles.typeChipTxtActive]}>{category}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderTxt, styles.dateCol]}>Date</Text>
              <Text style={[styles.tableHeaderTxt, styles.descriptionCol]}>Description</Text>
              <Text style={[styles.tableHeaderTxt, styles.categoryCol]}>Category</Text>
              <Text style={[styles.tableHeaderTxt, styles.amountCol]}>Amount</Text>
            </View>

            {visibleExpenses.length === 0 ? (
              <EmptyCard text="No expenses matched the selected filters." />
            ) : (
              visibleExpenses.map((item) => (
                <View key={item.id} style={styles.tableRowCard}>
                  <Text style={[styles.tableDateTxt, styles.dateCol]}>{item.date || "-"}</Text>
                  <View style={styles.descriptionCol}>
                    <Text style={styles.mainTxt}>{item.description || "-"}</Text>
                    {!!item.note && <Text style={styles.subTxt}>{item.note}</Text>}
                    <Text style={styles.metaTxt}>Paid by: {item.paidBy || "-"}</Text>
                  </View>
                  <View style={styles.categoryCol}>
                    <Tag label={item.category || "-"} tone={CATEGORY_COLORS[item.category] || "violet"} />
                  </View>
                  <Text style={[styles.amountTxt, styles.amountCol]}>{peso(item.amount)}</Text>
                </View>
              ))
            )}

            <Text style={styles.footerStat}>
              Total expenses shown: {peso(visibleExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
            </Text>

            <View style={styles.pagerRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.pagerBtn, safeExpensePage === 1 && styles.pagerBtnDisabled]}
                onPress={() => setExpensePage((prev) => Math.max(1, prev - 1))}
                disabled={safeExpensePage === 1}
              >
                <Text style={styles.pagerBtnTxt}>{"<"}</Text>
              </TouchableOpacity>
              <View style={styles.pagerCurrent}>
                <Text style={styles.pagerCurrentTxt}>{safeExpensePage}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.pagerBtn, safeExpensePage === expenseTotalPages && styles.pagerBtnDisabled]}
                onPress={() => setExpensePage((prev) => Math.min(expenseTotalPages, prev + 1))}
                disabled={safeExpensePage === expenseTotalPages}
              >
                <Text style={styles.pagerBtnTxt}>{">"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.rightStack}>
          <View style={styles.card}>
            <View style={styles.cardHeadStack}>
              <View>
                <Text style={styles.cardTitle}>Revenue vs Expenses</Text>
                <Text style={styles.cardSub}>A clearer comparison of income and total business expenses.</Text>
              </View>
              <View style={styles.compareSummary}>
                <View style={[styles.compareChip, styles.compareChipRevenue]}>
                  <Text style={styles.compareChipLabel}>Revenue</Text>
                  <Text style={styles.compareChipValue}>{peso(totalRevenue)}</Text>
                </View>
                <View style={[styles.compareChip, styles.compareChipExpense]}>
                  <Text style={styles.compareChipLabel}>Expenses</Text>
                  <Text style={[styles.compareChipValue, styles.compareChipValueExpense]}>{peso(totalExpenses)}</Text>
                </View>
                <View style={[styles.compareChip, styles.compareChipCommission]}>
                  <Text style={styles.compareChipLabel}>Commissions</Text>
                  <Text style={[styles.compareChipValue, styles.compareChipValueCommission]}>{peso(totalCommissions)}</Text>
                </View>
              </View>
            </View>

            <BarRow label="Revenue" value={totalRevenue} width={percentOf(totalRevenue, compareMax)} tone="revenue" />
            <BarRow label="Expenses" value={totalExpenses} width={percentOf(totalExpenses, compareMax)} tone="expense" />
            <BarRow label="Commissions" value={totalCommissions} width={percentOf(totalCommissions, compareMax)} tone="commission" />
            <View style={styles.netProfitCard}>
              <Text style={styles.netProfitLabel}>Net Profit</Text>
              <Text style={styles.netProfitValue}>{peso(netProfit)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.interpretationHead}>
              <Text style={styles.cardTitle}>Interpretation</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.aiPill, aiState.status === "loading" && styles.aiPillDisabled]}
                onPress={handleGenerateInterpretation}
                disabled={aiState.status === "loading"}
              >
                <Text style={styles.aiPillTxt}>
                  {aiState.status === "loading" ? "Generating..." : "Generate AI"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.interpretationList}>
              {aiState.status === "idle" ? (
                <InterpretationItem
                  text="Generate AI to analyze the current revenue, expense, and commission records."
                  muted
                />
              ) : null}
              {aiState.status === "loading" ? (
                <InterpretationItem text="Analyzing the filtered financial data..." muted />
              ) : null}
              {aiState.status === "success" && aiState.model ? (
                <InterpretationItem text={`AI interpretation ready • ${aiState.model}`} muted />
              ) : null}
              {aiState.message ? (
                <InterpretationItem text={aiState.message} muted />
              ) : null}
              {aiLines.map((line) => (
                <InterpretationItem key={line} text={line} />
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.commissionCard]}>
        <View style={styles.cardHeadStack}>
          <View>
            <Text style={styles.cardTitle}>Worker Commission Log</Text>
            <Text style={styles.cardSub}>
              Entries are created automatically when a staff-assigned booking is marked completed. Every completed service gives the assigned staff member a fixed 10% commission.
            </Text>
            <Text style={styles.commissionSummary}>
              Commission tally shown: {peso(visibleCommissionTotal)}
            </Text>
          </View>
          <View style={styles.inlineSearchBox}>
            <Image source={ICON_SEARCH} style={styles.searchIcon} resizeMode="contain" />
            <TextInput
              value={workerQuery}
              onChangeText={setWorkerQuery}
              placeholder={staffOptions.length ? "Search worker..." : "Search worker..."}
              placeholderTextColor="#9AA0A6"
              style={styles.inlineSearchInput}
            />
          </View>
        </View>

        <View style={styles.commissionHeaderRow}>
          <Text style={[styles.tableHeaderTxt, styles.commissionDateCol]}>Date</Text>
          <Text style={[styles.tableHeaderTxt, styles.commissionWorkerCol]}>Worker</Text>
          <Text style={[styles.tableHeaderTxt, styles.commissionRoleCol]}>Role</Text>
          <Text style={[styles.tableHeaderTxt, styles.commissionServiceCol]}>Service</Text>
          <Text style={[styles.tableHeaderTxt, styles.commissionTallyCol]}>Tally</Text>
          <Text style={[styles.tableHeaderTxt, styles.commissionRateCol]}>%</Text>
          <Text style={[styles.tableHeaderTxt, styles.commissionEarnedCol]}>Earned</Text>
        </View>

        {filteredCommissions.length === 0 ? (
          <EmptyCard text="No commission records yet." />
        ) : (
          filteredCommissions.map((item) => (
            <View key={item.id} style={styles.tableRowCard}>
              <Text style={[styles.tableDateTxt, styles.commissionDateCol]}>{item.date || "-"}</Text>
              <Text style={[styles.mainTxt, styles.commissionWorkerCol]}>{item.worker || "-"}</Text>
              <Text style={[styles.metaTxtStrong, styles.commissionRoleCol]}>{item.role || "-"}</Text>
              <View style={styles.commissionServiceCol}>
                <Text style={styles.mainTxt}>{item.service || "-"}</Text>
              </View>
              <Text style={[styles.amountTxt, styles.commissionTallyCol]}>{peso(item.tally)}</Text>
              <Text style={[styles.metaTxtStrong, styles.commissionRateCol]}>{item.rate || 0}%</Text>
              <Text style={[styles.amountTxt, styles.commissionEarnedCol]}>{peso(item.earned)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Tag({ label, tone }) {
  return (
    <View style={[styles.tag, styles[`tag_${tone}`]]}>
      <Text style={styles.tagTxt}>{label}</Text>
    </View>
  );
}

function BarRow({ label, value, width, tone }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, styles[`barFill_${tone}`], width <= 0 && styles.barFillZero, { width: `${width}%` }]}>
          <Text style={styles.barValue}>{peso(value)}</Text>
        </View>
      </View>
    </View>
  );
}

function InterpretationItem({ text, muted = false }) {
  return (
    <View style={[styles.interpretationItem, muted && styles.interpretationItemMuted]}>
      <Text style={[styles.interpretationTxt, muted && styles.interpretationTxtMuted]}>{text}</Text>
    </View>
  );
}

function EmptyCard({ text }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTxt}>{text}</Text>
    </View>
  );
}
