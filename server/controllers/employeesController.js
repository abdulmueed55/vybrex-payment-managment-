const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const logActivity = async (userId, action, entityType, entityId, details) => {
  await prisma.activityLog.create({
    data: { user_id: userId, action, entity_type: entityType, entity_id: entityId, details },
  });
};

const getEmployees = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;

    const employees = await prisma.employee.findMany({
      where,
      include: { salary_payments: true },
      orderBy: { created_at: 'desc' },
    });

    const enriched = employees.map((e) => {
      const total_paid = e.salary_payments.reduce((sum, p) => sum + p.amount, 0);
      return { ...e, total_paid };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { salary_payments: { orderBy: { payment_date: 'desc' } } },
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    const total_paid = employee.salary_payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ ...employee, total_paid });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const data = { ...req.body };
    data.join_date = data.join_date ? new Date(data.join_date) : null;
    data.leave_date = data.leave_date ? new Date(data.leave_date) : null;
    data.monthly_salary = data.monthly_salary ? parseFloat(data.monthly_salary) : null;

    const employee = await prisma.employee.create({ data });
    await logActivity(req.user.id, `Added employee: ${employee.name}`, 'employee', employee.id, null);
    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.join_date) data.join_date = new Date(data.join_date);
    if (data.leave_date) data.leave_date = new Date(data.leave_date);
    else data.leave_date = null;
    if (data.monthly_salary !== undefined) data.monthly_salary = data.monthly_salary ? parseFloat(data.monthly_salary) : null;

    const employee = await prisma.employee.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    await logActivity(req.user.id, `Updated employee: ${employee.name}`, 'employee', employee.id, null);
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
    await logActivity(req.user.id, `Deleted employee: ${employee.name}`, 'employee', null, null);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addSalaryPayment = async (req, res) => {
  try {
    const { amount, payment_date, month_covered, notes } = req.body;
    const payment = await prisma.salaryPayment.create({
      data: {
        employee_id: parseInt(req.params.id),
        amount: parseFloat(amount),
        payment_date: new Date(payment_date),
        month_covered,
        notes,
      },
    });
    const employee = await prisma.employee.findUnique({ where: { id: parseInt(req.params.id) } });
    await logActivity(req.user.id, `Paid salary for ${employee.name} (${amount})`, 'employee', employee.id, null);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteSalaryPayment = async (req, res) => {
  try {
    await prisma.salaryPayment.delete({ where: { id: parseInt(req.params.paymentId) } });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getEmployees, getEmployee, createEmployee, updateEmployee,
  deleteEmployee, addSalaryPayment, deleteSalaryPayment,
};
