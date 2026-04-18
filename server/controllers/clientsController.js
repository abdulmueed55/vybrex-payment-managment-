const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const logActivity = async (userId, action, entityType, entityId, details) => {
  await prisma.activityLog.create({
    data: { user_id: userId, action, entity_type: entityType, entity_id: entityId, details },
  });
};

const getClients = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    const clients = await prisma.client.findMany({
      where,
      include: { payments: true },
      orderBy: { created_at: 'desc' },
    });

    const enriched = clients.map((c) => {
      const paid = c.payments.reduce((sum, p) => sum + p.amount, 0);
      const total = c.contract_type === 'monthly' ? (c.monthly_amount || 0) : (c.project_amount || 0);
      const remaining = Math.max(0, total - paid);
      const now = new Date();
      let alert = null;
      if (remaining > 0 && c.end_date) {
        const endDate = new Date(c.end_date);
        if (endDate < now) alert = 'overdue';
        else if (endDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) alert = 'due_soon';
      }
      if (c.contract_type === 'monthly' && c.end_date && !c.is_ongoing) {
        const endDate = new Date(c.end_date);
        if (endDate <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) && endDate > now) {
          alert = alert || 'retainer_ending';
        }
      }
      return { ...c, total_paid: paid, total_amount: total, remaining, alert };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        payments: { orderBy: { payment_date: 'desc' } },
      },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const paid = client.payments.reduce((sum, p) => sum + p.amount, 0);
    const total = client.contract_type === 'monthly' ? (client.monthly_amount || 0) : (client.project_amount || 0);
    res.json({ ...client, total_paid: paid, total_amount: total, remaining: Math.max(0, total - paid) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createClient = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.start_date) data.start_date = new Date(data.start_date);
    if (data.end_date) data.end_date = new Date(data.end_date);
    if (data.monthly_amount) data.monthly_amount = parseFloat(data.monthly_amount);
    if (data.project_amount) data.project_amount = parseFloat(data.project_amount);
    data.is_ongoing = data.is_ongoing === true || data.is_ongoing === 'true';

    const client = await prisma.client.create({ data });
    await logActivity(req.user.id, `Added client: ${client.name}`, 'client', client.id, null);
    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateClient = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.start_date) data.start_date = new Date(data.start_date);
    if (data.end_date) data.end_date = new Date(data.end_date);
    else data.end_date = null;
    if (data.monthly_amount !== undefined) data.monthly_amount = data.monthly_amount ? parseFloat(data.monthly_amount) : null;
    if (data.project_amount !== undefined) data.project_amount = data.project_amount ? parseFloat(data.project_amount) : null;
    data.is_ongoing = data.is_ongoing === true || data.is_ongoing === 'true';

    const client = await prisma.client.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    await logActivity(req.user.id, `Updated client: ${client.name}`, 'client', client.id, null);
    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    await prisma.client.delete({ where: { id: parseInt(req.params.id) } });
    await logActivity(req.user.id, `Deleted client: ${client.name}`, 'client', null, null);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addPayment = async (req, res) => {
  try {
    const { amount, payment_date, method, notes } = req.body;
    const payment = await prisma.clientPayment.create({
      data: {
        client_id: parseInt(req.params.id),
        amount: parseFloat(amount),
        payment_date: new Date(payment_date),
        method,
        notes,
      },
    });
    const client = await prisma.client.findUnique({ where: { id: parseInt(req.params.id) } });
    await logActivity(req.user.id, `Added payment for client: ${client.name} (${amount})`, 'client', client.id, null);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deletePayment = async (req, res) => {
  try {
    await prisma.clientPayment.delete({ where: { id: parseInt(req.params.paymentId) } });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient, addPayment, deletePayment };
