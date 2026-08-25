import { Alert, Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTable(section) {
  const columns = Array.isArray(section?.columns) ? section.columns : [];
  const rows = Array.isArray(section?.rows) ? section.rows : [];
  const emptyMessage = section?.emptyMessage || "No data available.";

  const headerHtml = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const bodyHtml = rows.length
    ? rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => `<td>${escapeHtml(cell)}</td>`)
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${Math.max(columns.length, 1)}" class="empty">${escapeHtml(emptyMessage)}</td></tr>`;

  return `
    <section class="section">
      ${section?.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${bodyHtml}
        </tbody>
      </table>
    </section>
  `;
}

function buildHtml({ title, subtitle = "", sections = [] }) {
  const sectionHtml = sections.map(renderTable).join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title || "Report")}</title>
        <style>
          :root {
            color-scheme: light;
          }

          body {
            margin: 24px;
            font-family: Arial, sans-serif;
            color: #0f172a;
          }

          h1 {
            margin: 0 0 6px;
            font-size: 26px;
          }

          .subtitle {
            margin: 0 0 20px;
            color: #475569;
            font-size: 13px;
          }

          .section {
            margin-bottom: 24px;
          }

          .section h2 {
            margin: 0 0 10px;
            font-size: 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
            font-size: 12px;
            word-break: break-word;
          }

          th {
            background: #f8fafc;
            font-weight: 700;
          }

          td.empty {
            text-align: center;
            color: #64748b;
          }

          @media print {
            body {
              margin: 12px;
            }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title || "Report")}</h1>
        ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
        ${sectionHtml}
      </body>
    </html>
  `;
}

function openWebPrintWindow(html) {
  if (typeof window === "undefined") {
    return;
  }

  const printWindow = window.open("", "_blank", "width=1200,height=900");
  if (!printWindow) {
    Alert.alert("Popup blocked", "Allow popups in your browser to export the PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.onload = () => {
    window.setTimeout(triggerPrint, 150);
  };

  window.setTimeout(triggerPrint, 400);
}

export async function exportTabularPdf({ title, subtitle = "", sections = [] }) {
  const html = buildHtml({ title, subtitle, sections });

  try {
    if (Platform.OS === "web") {
      openWebPrintWindow(html);
      return;
    }

    const file = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: title || "Export PDF",
      });
      return;
    }

    await Print.printAsync({ html });
  } catch (error) {
    Alert.alert("Export failed", error?.message || "Could not generate the PDF report.");
  }
}
