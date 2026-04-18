const router = require('express').Router();
const {
  getClients, getClient, createClient, updateClient, deleteClient, addPayment, deletePayment,
} = require('../controllers/clientsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', getClients);
router.post('/', createClient);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.post('/:id/payments', addPayment);
router.delete('/:id/payments/:paymentId', deletePayment);

module.exports = router;
