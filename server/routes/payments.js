const router = require('express').Router();
const { getLedger, getSummary, getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/paymentsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/ledger', getLedger);
router.get('/summary', getSummary);
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
