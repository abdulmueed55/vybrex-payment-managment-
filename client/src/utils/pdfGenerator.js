import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from './format';

const fmt = (amount) => {
  if (!amount && amount !== 0) return 'Rs 0';
  return 'Rs ' + Number(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 });
};

const addHeader = (doc, company, title, subtitle = '') => {
  // White background header
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 38, 'F');

  // Logo if available
  let textX = 14;
  if (company?.logo_url) {
    try { doc.addImage(company.logo_url, 'PNG', 14, 6, 24, 24); textX = 44; } catch {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(company?.name || 'Vybrex Solutions', textX, 16);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text(company?.email || 'hello@vybrex.com', textX, 23);
  if (company?.phone) doc.text(company.phone, textX, 29);

  // Report title on right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(title, 196, 16, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(160, 160, 160);
  if (subtitle) doc.text(subtitle, 196, 23, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PK')}`, 196, 30, { align: 'right' });
};

const addFooter = (doc, company) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 286, 196, 286);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`${company?.name || 'Vybrex Solutions'} — Confidential`, 14, 292);
    doc.text(`Page ${i} of ${pageCount}`, 196, 292, { align: 'right' });
  }
};

export const generateMonthlyRevenueReport = (data, month, company) => {
  const doc = new jsPDF();
  addHeader(doc, company, 'Revenue Report', month);

  doc.autoTable({
    startY: 46,
    head: [['Date', 'Client', 'Method', 'Amount (PKR)']],
    body: data.map((r) => [formatDate(r.date), r.client_name, r.method || '—', fmt(r.amount)]),
    theme: 'grid',
    headStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    foot: [['', '', 'TOTAL', fmt(data.reduce((s, r) => s + r.amount, 0))]],
    footStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 3: { halign: 'right' } },
  });

  addFooter(doc, company);
  doc.save(`vybrex-revenue-${month}.pdf`);
};

export const generateClientPaymentReport = (client, payments, dateRange, company) => {
  const doc = new jsPDF();
  addHeader(doc, company, 'Client Payment Report', `${client.name} — ${dateRange}`);

  // Summary box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, 46, 182, 28, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, 46, 182, 28, 2, 2, 'S');
  doc.setFontSize(9); doc.setTextColor(100, 100, 100);
  doc.text(`Company: ${client.company || '—'}`, 20, 55);
  doc.text(`Service: ${client.service_type || '—'}`, 20, 62);
  doc.text(`Contract: ${client.contract_type === 'monthly' ? 'Monthly Retainer' : 'Project-Based'}`, 20, 69);
  doc.setFont(undefined, 'bold'); doc.setTextColor(30, 30, 30);
  doc.text(`Total: ${fmt(client.total_amount)}`, 110, 55);
  doc.text(`Paid: ${fmt(client.total_paid)}`, 110, 62);
  doc.setTextColor(client.remaining > 0 ? 200 : 30, client.remaining > 0 ? 30 : 120, 30);
  doc.text(`Remaining: ${fmt(client.remaining)}`, 110, 69);
  doc.setFont(undefined, 'normal');

  doc.autoTable({
    startY: 82,
    head: [['Date', 'Amount (PKR)', 'Method', 'Notes']],
    body: payments.map((p) => [formatDate(p.payment_date), fmt(p.amount), p.method || '—', p.notes || '—']),
    theme: 'grid',
    headStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    foot: [['TOTAL', fmt(payments.reduce((s, p) => s + p.amount, 0)), '', '']],
    footStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' } },
  });

  addFooter(doc, company);
  doc.save(`vybrex-client-${client.name.replace(/\s/g, '-')}.pdf`);
};

export const generateEmployeeSalaryReport = (employee, payments, dateRange, company) => {
  const doc = new jsPDF();
  addHeader(doc, company, 'Salary Report', `${employee.name} — ${dateRange}`);

  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, 46, 182, 20, 2, 2, 'F');
  doc.setFontSize(9); doc.setTextColor(100, 100, 100);
  doc.text(`Role: ${employee.role || '—'}`, 20, 54);
  doc.text(`Status: ${employee.status}`, 20, 61);
  doc.setFont(undefined, 'bold'); doc.setTextColor(30, 30, 30);
  doc.text(`Total Paid: ${fmt(employee.total_paid)}`, 110, 54);
  doc.setFont(undefined, 'normal');

  doc.autoTable({
    startY: 74,
    head: [['Payment Date', 'Month Covered', 'Amount (PKR)', 'Notes']],
    body: payments.map((p) => [formatDate(p.payment_date), p.month_covered || '—', fmt(p.amount), p.notes || '—']),
    theme: 'grid',
    headStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    foot: [['', 'TOTAL', fmt(payments.reduce((s, p) => s + p.amount, 0)), '']],
    footStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right' } },
  });

  addFooter(doc, company);
  doc.save(`vybrex-salary-${employee.name.replace(/\s/g, '-')}.pdf`);
};

export const generatePayslip = (employee, payment, company) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 50, 'F');

  let textX = 14;
  if (company?.logo_url) {
    try { doc.addImage(company.logo_url, 'PNG', 14, 8, 30, 30); textX = 50; } catch {}
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont(undefined, 'bold');
  doc.text(company?.name || 'Vybrex Solutions', textX, 20);
  doc.setFontSize(8); doc.setFont(undefined, 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text(company?.email || '', textX, 28);
  if (company?.address) doc.text(company.address, textX, 34);
  if (company?.phone) doc.text(company.phone, textX, 40);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont(undefined, 'bold');
  doc.text('PAYSLIP', 196, 20, { align: 'right' });
  doc.setFontSize(9); doc.setFont(undefined, 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text(payment.month_covered || formatDate(payment.payment_date), 196, 29, { align: 'right' });

  // Employee box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, 60, 85, 50, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, 60, 85, 50, 2, 2, 'S');
  doc.setFontSize(7); doc.setTextColor(120, 120, 120); doc.setFont(undefined, 'bold');
  doc.text('EMPLOYEE DETAILS', 20, 69);
  doc.setFontSize(13); doc.setTextColor(15, 15, 15); doc.setFont(undefined, 'bold');
  doc.text(employee.name, 20, 79);
  doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(80, 80, 80);
  doc.text(employee.role || '', 20, 87);
  doc.text(`Pay Date: ${formatDate(payment.payment_date)}`, 20, 95);
  doc.text(`Status: ${employee.status}`, 20, 102);

  // Payment box
  doc.setFillColor(15, 15, 15);
  doc.roundedRect(109, 60, 87, 50, 2, 2, 'F');
  doc.setFontSize(7); doc.setTextColor(160, 160, 160); doc.setFont(undefined, 'bold');
  doc.text('PAYMENT SUMMARY', 115, 69);
  doc.setFontSize(10); doc.setFont(undefined, 'normal');
  doc.setTextColor(200, 200, 200); doc.text('Gross Salary', 115, 79);
  doc.setTextColor(255, 255, 255); doc.setFont(undefined, 'bold');
  doc.text(fmt(payment.amount), 193, 79, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(200, 200, 200); doc.text('Deductions', 115, 88);
  doc.setTextColor(255, 255, 255); doc.text('Rs 0', 193, 88, { align: 'right' });
  doc.setDrawColor(60, 60, 60);
  doc.line(115, 92, 193, 92);
  doc.setFontSize(11); doc.setFont(undefined, 'bold');
  doc.setTextColor(74, 222, 128); doc.text('NET PAY', 115, 101);
  doc.text(fmt(payment.amount), 193, 101, { align: 'right' });

  // Notes
  if (payment.notes) {
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(14, 120, 182, 18, 2, 2, 'F');
    doc.setFontSize(7); doc.setTextColor(120, 120, 120); doc.setFont(undefined, 'bold');
    doc.text('NOTES', 20, 128);
    doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(50, 50, 50);
    doc.text(payment.notes, 20, 134);
  }

  // Signature line
  doc.setDrawColor(180, 180, 180);
  doc.line(14, 190, 90, 190);
  doc.setFontSize(8); doc.setTextColor(150, 150, 150);
  doc.text('Authorized Signature', 14, 196);

  doc.setFillColor(15, 15, 15);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setFontSize(7); doc.setTextColor(120, 120, 120);
  doc.text('This is a computer-generated payslip.', 14, 291);
  doc.text(`${company?.name || 'Vybrex Solutions'} — Confidential`, 196, 291, { align: 'right' });

  doc.save(`payslip-${employee.name.replace(/\s/g, '-')}-${payment.month_covered || 'payment'}.pdf`);
};

export const generateOutstandingReport = (clients, company) => {
  const doc = new jsPDF();
  addHeader(doc, company, 'Outstanding Report', `As of ${new Date().toLocaleDateString('en-PK')}`);

  const outstanding = clients.filter((c) => c.remaining > 0);
  doc.autoTable({
    startY: 46,
    head: [['Client', 'Company', 'Type', 'Total', 'Paid', 'Remaining', 'Due Date']],
    body: outstanding.map((c) => [
      c.name, c.company || '—',
      c.contract_type === 'monthly' ? 'Retainer' : 'Project',
      fmt(c.total_amount), fmt(c.total_paid), fmt(c.remaining),
      c.end_date ? formatDate(c.end_date) : '—',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 15, 15], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 5: { textColor: [200, 30, 30], fontStyle: 'bold' } },
  });

  const totalOutstanding = outstanding.reduce((s, c) => s + (c.remaining || 0), 0);
  const y = (doc.lastAutoTable?.finalY || 60) + 10;
  doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.setTextColor(200, 30, 30);
  doc.text(`Total Outstanding: ${fmt(totalOutstanding)}`, 14, y);

  addFooter(doc, company);
  doc.save('vybrex-outstanding.pdf');
};
