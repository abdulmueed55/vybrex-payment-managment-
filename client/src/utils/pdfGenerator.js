import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './format';

const addHeader = (doc, title, subtitle = '') => {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Vybrex Solutions', 14, 15);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('hello@vybrex.com', 14, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 30);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 37);
  }
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 30);
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 285, 210, 15, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('Vybrex Solutions — Confidential', 14, 293);
    doc.text(`Page ${i} of ${pageCount}`, 185, 293);
  }
};

export const generateMonthlyRevenueReport = (data, month) => {
  const doc = new jsPDF();
  addHeader(doc, 'Monthly Revenue Report', month);

  const tableData = data.map((row) => [
    formatDate(row.date),
    row.client_name,
    row.method || '—',
    formatCurrency(row.amount),
  ]);

  doc.autoTable({
    startY: 45,
    head: [['Date', 'Client', 'Method', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    foot: [['', '', 'Total', formatCurrency(data.reduce((s, r) => s + r.amount, 0))]],
    footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
  });

  addFooter(doc);
  doc.save(`vybrex-revenue-${month}.pdf`);
};

export const generateClientPaymentReport = (client, payments, dateRange) => {
  const doc = new jsPDF();
  addHeader(doc, 'Client Payment Report', `${client.name} — ${dateRange}`);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Company: ${client.company || '—'}`, 14, 48);
  doc.text(`Service: ${client.service_type || '—'}`, 14, 55);
  doc.text(`Contract: ${client.contract_type === 'monthly' ? 'Monthly Retainer' : 'Project-Based'}`, 14, 62);
  doc.text(`Total Amount: ${formatCurrency(client.total_amount)}`, 120, 48);
  doc.text(`Total Paid: ${formatCurrency(client.total_paid)}`, 120, 55);
  doc.text(`Remaining: ${formatCurrency(client.remaining)}`, 120, 62);

  const tableData = payments.map((p) => [
    formatDate(p.payment_date),
    formatCurrency(p.amount),
    p.method || '—',
    p.notes || '—',
  ]);

  doc.autoTable({
    startY: 72,
    head: [['Date', 'Amount', 'Method', 'Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    foot: [['Total', formatCurrency(payments.reduce((s, p) => s + p.amount, 0)), '', '']],
    footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
  });

  addFooter(doc);
  doc.save(`vybrex-client-${client.name.replace(/\s/g, '-')}-report.pdf`);
};

export const generateEmployeeSalaryReport = (employee, payments, dateRange) => {
  const doc = new jsPDF();
  addHeader(doc, 'Employee Salary Report', `${employee.name} — ${dateRange}`);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Role: ${employee.role || '—'}`, 14, 48);
  doc.text(`Status: ${employee.status}`, 14, 55);
  doc.text(`Total Paid: ${formatCurrency(employee.total_paid)}`, 120, 48);

  const tableData = payments.map((p) => [
    formatDate(p.payment_date),
    p.month_covered || '—',
    formatCurrency(p.amount),
    p.notes || '—',
  ]);

  doc.autoTable({
    startY: 65,
    head: [['Payment Date', 'Month Covered', 'Amount', 'Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    foot: [['', 'Total', formatCurrency(payments.reduce((s, p) => s + p.amount, 0)), '']],
    footStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
  });

  addFooter(doc);
  doc.save(`vybrex-salary-${employee.name.replace(/\s/g, '-')}-report.pdf`);
};

export const generatePayslip = (employee, payment, company) => {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text(company?.name || 'Vybrex Solutions', 14, 18);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(company?.email || 'hello@vybrex.com', 14, 26);
  if (company?.address) doc.text(company.address, 14, 32);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('PAYSLIP', 160, 18);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(payment.month_covered || formatDate(payment.payment_date), 160, 26);

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(14, 55, 85, 45, 3, 3, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('EMPLOYEE', 20, 64);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(employee.name, 20, 73);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(employee.role || '', 20, 80);
  doc.text(`Pay Date: ${formatDate(payment.payment_date)}`, 20, 87);
  doc.text(`Status: ${employee.status}`, 20, 94);

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(109, 55, 87, 45, 3, 3, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('PAYMENT SUMMARY', 115, 64);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Gross Salary', 115, 75);
  doc.text(formatCurrency(payment.amount), 165, 75);
  doc.setTextColor(100, 116, 139);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Deductions', 115, 83);
  doc.text(formatCurrency(0), 165, 83);
  doc.setDrawColor(59, 130, 246);
  doc.line(115, 87, 193, 87);
  doc.setTextColor(34, 197, 94);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('Net Pay', 115, 94);
  doc.text(formatCurrency(payment.amount), 165, 94);

  if (payment.notes) {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(14, 110, 182, 20, 3, 3, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('NOTES', 20, 118);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.text(payment.notes, 20, 124);
  }

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Authorized Signature', 14, 200);
  doc.setDrawColor(100, 116, 139);
  doc.line(14, 195, 90, 195);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated payslip and does not require a physical signature.', 14, 285);

  doc.save(`payslip-${employee.name.replace(/\s/g, '-')}-${payment.month_covered || 'payment'}.pdf`);
};

export const generateOutstandingReport = (clients) => {
  const doc = new jsPDF();
  addHeader(doc, 'Outstanding Payments Report', `As of ${new Date().toLocaleDateString()}`);

  const tableData = clients
    .filter((c) => c.remaining > 0)
    .map((c) => [
      c.name,
      c.company || '—',
      c.contract_type === 'monthly' ? 'Retainer' : 'Project',
      formatCurrency(c.total_amount),
      formatCurrency(c.total_paid),
      formatCurrency(c.remaining),
      c.end_date ? formatDate(c.end_date) : '—',
    ]);

  doc.autoTable({
    startY: 45,
    head: [['Client', 'Company', 'Type', 'Total', 'Paid', 'Remaining', 'Due Date']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: { 5: { textColor: [239, 68, 68], fontStyle: 'bold' } },
  });

  const totalOutstanding = clients.reduce((s, c) => s + (c.remaining || 0), 0);
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Outstanding: ${formatCurrency(totalOutstanding)}`, 14, finalY);

  addFooter(doc);
  doc.save(`vybrex-outstanding-report.pdf`);
};
