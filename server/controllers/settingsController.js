const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSettings = async (req, res) => {
  try {
    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: { name: 'Vybrex Solutions' },
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({ data: req.body });
    } else {
      settings = await prisma.companySettings.update({
        where: { id: settings.id },
        data: req.body,
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const exportData = async (req, res) => {
  try {
    const [clients, employees, expenses, clientPayments, salaryPayments] = await Promise.all([
      prisma.client.findMany({ include: { payments: true } }),
      prisma.employee.findMany({ include: { salary_payments: true } }),
      prisma.expense.findMany(),
      prisma.clientPayment.findMany(),
      prisma.salaryPayment.findMany(),
    ]);

    res.json({
      exported_at: new Date().toISOString(),
      clients,
      employees,
      expenses,
      client_payments: clientPayments,
      salary_payments: salaryPayments,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const resetData = async (req, res) => {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.activityLog.deleteMany();
    await prisma.clientPayment.deleteMany();
    await prisma.client.deleteMany();
    await prisma.salaryPayment.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.expense.deleteMany();
    res.json({ message: 'All data cleared. Users and settings preserved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reset failed' });
  }
};

module.exports = { getSettings, updateSettings, exportData, resetData };
