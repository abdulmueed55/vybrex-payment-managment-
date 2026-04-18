const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Revenue this month (client payments)
    const monthPayments = await prisma.clientPayment.aggregate({
      where: { payment_date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    });

    // Total outstanding (total contract - total paid for active clients)
    const activeClients = await prisma.client.findMany({
      where: { status: 'active' },
      include: { payments: true },
    });

    let totalOutstanding = 0;
    for (const client of activeClients) {
      const paid = client.payments.reduce((sum, p) => sum + p.amount, 0);
      const total = client.contract_type === 'monthly'
        ? (client.monthly_amount || 0)
        : (client.project_amount || 0);
      if (total > paid) totalOutstanding += total - paid;
    }

    // Active clients count
    const activeClientsCount = await prisma.client.count({ where: { status: 'active' } });

    // Active employees count
    const activeEmployees = await prisma.employee.count({ where: { status: 'active' } });

    // Overdue payments (clients with end_date passed and outstanding balance)
    const overdueClients = await prisma.client.findMany({
      where: {
        status: 'active',
        end_date: { lt: now },
        is_ongoing: false,
      },
      include: { payments: true },
    });

    let overdueCount = 0;
    let overdueAmount = 0;
    for (const client of overdueClients) {
      const paid = client.payments.reduce((sum, p) => sum + p.amount, 0);
      const total = client.contract_type === 'monthly'
        ? (client.monthly_amount || 0)
        : (client.project_amount || 0);
      if (total > paid) {
        overdueCount++;
        overdueAmount += total - paid;
      }
    }

    res.json({
      revenue_this_month: monthPayments._sum.amount || 0,
      total_outstanding: totalOutstanding,
      active_clients: activeClientsCount,
      active_employees: activeEmployees,
      overdue_count: overdueCount,
      overdue_amount: overdueAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      });
    }

    const data = await Promise.all(
      months.map(async ({ year, month, label }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const result = await prisma.clientPayment.aggregate({
          where: { payment_date: { gte: start, lte: end } },
          _sum: { amount: true },
        });
        return { month: label, revenue: result._sum.amount || 0 };
      })
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAlerts = async (req, res) => {
  try {
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in14days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const clients = await prisma.client.findMany({
      where: { status: 'active' },
      include: { payments: true },
    });

    const alerts = [];
    for (const client of clients) {
      const paid = client.payments.reduce((sum, p) => sum + p.amount, 0);
      const total = client.contract_type === 'monthly'
        ? (client.monthly_amount || 0)
        : (client.project_amount || 0);
      const remaining = total - paid;

      if (remaining > 0 && client.end_date) {
        if (client.end_date < now) {
          const daysLate = Math.floor((now - new Date(client.end_date)) / (1000 * 60 * 60 * 24));
          alerts.push({ type: 'overdue', client: client.name, days: daysLate, amount: remaining });
        } else if (client.end_date <= in7days) {
          const daysLeft = Math.ceil((new Date(client.end_date) - now) / (1000 * 60 * 60 * 24));
          alerts.push({ type: 'due_soon', client: client.name, days: daysLeft, amount: remaining });
        }
      }

      if (client.contract_type === 'monthly' && client.end_date && !client.is_ongoing) {
        if (client.end_date <= in14days && client.end_date > now) {
          const daysLeft = Math.ceil((new Date(client.end_date) - now) / (1000 * 60 * 60 * 24));
          alerts.push({ type: 'retainer_ending', client: client.name, days: daysLeft });
        }
      }
    }

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getActivity = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: { user: { select: { name: true } } },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getSummary, getRevenueChart, getAlerts, getActivity };
