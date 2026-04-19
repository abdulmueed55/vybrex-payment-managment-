const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getLedger = async (req, res) => {
  try {
    const { from, to, type, category } = req.query;
    const fromDate = from ? new Date(from) : new Date('2000-01-01');
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59);

    const clientPayments = await prisma.clientPayment.findMany({
      where: { payment_date: { gte: fromDate, lte: toDate } },
      include: { client: { select: { name: true } } },
    });

    const expenses = await prisma.expense.findMany({
      where: { expense_date: { gte: fromDate, lte: toDate } },
    });

    const salaryPayments = await prisma.salaryPayment.findMany({
      where: { payment_date: { gte: fromDate, lte: toDate } },
      include: { employee: { select: { name: true } } },
    });

    const transactions = [];

    if (!type || type === 'all' || type === 'income') {
      clientPayments.forEach((p) => {
        transactions.push({
          id: `cp_${p.id}`,
          date: p.payment_date,
          type: 'income',
          description: `Payment from ${p.client.name}`,
          category: 'Client Payment',
          amount: p.amount,
          notes: p.notes,
        });
      });
    }

    if (!type || type === 'all' || type === 'expense') {
      expenses.forEach((e) => {
        if (!category || category === 'all' || e.category === category) {
          transactions.push({
            id: `exp_${e.id}`,
            date: e.expense_date,
            type: 'expense',
            description: e.description,
            category: e.category,
            amount: e.amount,
          });
        }
      });

      // Salary payments count as expenses — only shown when no specific category filter
      if (!category || category === 'all') {
        salaryPayments.forEach((p) => {
          transactions.push({
            id: `sal_${p.id}`,
            date: p.payment_date,
            type: 'expense',
            description: `Salary — ${p.employee.name}`,
            category: 'Salary',
            amount: p.amount,
            notes: p.notes,
          });
        });
      }
    }

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    const withBalance = transactions.map((t) => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      return { ...t, running_balance: runningBalance };
    });

    res.json(withBalance.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthIncome, monthExpenses, monthSalaries, expensesByCategory, topClients] = await Promise.all([
      prisma.clientPayment.aggregate({
        where: { payment_date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { expense_date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.salaryPayment.aggregate({
        where: { payment_date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where: { expense_date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.clientPayment.groupBy({
        by: ['client_id'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
    ]);

    const income = monthIncome._sum.amount || 0;
    const expenses = monthExpenses._sum.amount || 0;
    const salaries = monthSalaries._sum.amount || 0;
    const totalExpenses = expenses + salaries;

    const topClientsWithNames = await Promise.all(
      topClients.map(async (tc) => {
        const client = await prisma.client.findUnique({ where: { id: tc.client_id }, select: { name: true } });
        return { name: client?.name || 'Unknown', amount: tc._sum.amount };
      })
    );

    const expensesList = expensesByCategory.map((e) => ({ name: e.category, value: e._sum.amount }));
    if (salaries > 0) {
      expensesList.push({ name: 'Salary', value: salaries });
    }

    res.json({
      monthly_income: income,
      monthly_expenses: totalExpenses,
      monthly_profit: income - totalExpenses,
      expenses_by_category: expensesList,
      top_clients: topClientsWithNames,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { expense_date: 'desc' } });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { category, amount, expense_date, description } = req.body;
    const expense = await prisma.expense.create({
      data: {
        category,
        amount: parseFloat(amount),
        expense_date: new Date(expense_date),
        description,
      },
    });
    await prisma.activityLog.create({
      data: {
        user_id: req.user.id,
        action: `Added expense: ${description} (${amount})`,
        entity_type: 'expense',
        entity_id: expense.id,
      },
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.expense_date) data.expense_date = new Date(data.expense_date);
    if (data.amount) data.amount = parseFloat(data.amount);
    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getLedger, getSummary, getExpenses, createExpense, updateExpense, deleteExpense };
