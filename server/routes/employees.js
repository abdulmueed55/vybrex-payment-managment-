const router = require('express').Router();
const {
  getEmployees, getEmployee, createEmployee, updateEmployee,
  deleteEmployee, addSalaryPayment, deleteSalaryPayment,
} = require('../controllers/employeesController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', getEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/:id/salary-payments', addSalaryPayment);
router.delete('/:id/salary-payments/:paymentId', deleteSalaryPayment);

module.exports = router;
