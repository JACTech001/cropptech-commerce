"use client";

import { Download } from "lucide-react";

export default function CsvExportButton({ filename, columns, rows, label = "EXPORT CSV", disabled = false }) {
  function exportCsv() {
    if (disabled || !rows?.length) return;
    const quote = (value) => '"' + String(value ?? "").replaceAll('"', '""') + '"';
    const csv = [
      columns.map((column) => column.label),
      ...rows.map((row) => columns.map((column) => row[column.key])),
    ].map((line) => line.map(quote).join(",")).join("\\r\\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename.endsWith(".csv") ? filename : filename + ".csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return <button type="button" className="admin-orders-export" onClick={exportCsv} disabled={disabled || !rows?.length}><Download size={15}/>{label}</button>;
}
