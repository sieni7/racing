import jsPDF from 'jspdf';
import Papa from 'papaparse';

interface ExportColumn {
  key: string;
  label: string;
}

export function exportCSV<T extends Record<string, unknown>>(data: T[], columns: ExportColumn[], filename: string) {
  const rows = data.map(item => {
    const row: Record<string, unknown> = {};
    columns.forEach(col => { row[col.label] = item[col.key]; });
    return row;
  });
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF<T extends Record<string, unknown>>(data: T[], columns: ExportColumn[], title: string, filename: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(8);

  const colWidth = (pageWidth - 28) / columns.length;
  let y = 30;

  doc.setFillColor(249, 115, 22);
  doc.setTextColor(255, 255, 255);
  columns.forEach((col, i) => {
    doc.text(col.label, 14 + i * colWidth + 2, y + 4);
  });
  y += 8;

  doc.setTextColor(0, 0, 0);
  data.forEach((item, rowIdx) => {
    if (y > 180) {
      doc.addPage();
      y = 20;
    }
    if (rowIdx % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(14, y - 3, pageWidth - 28, 7, 'F');
    }
    columns.forEach((col, i) => {
      doc.text(String(item[col.key] ?? ''), 14 + i * colWidth + 2, y + 1);
    });
    y += 7;
  });

  doc.save(`${filename}.pdf`);
}
