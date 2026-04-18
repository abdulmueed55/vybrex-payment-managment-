const router = require('express').Router();
const { getSummary, getRevenueChart, getAlerts, getActivity } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

router.get('/summary', authMiddleware, getSummary);
router.get('/revenue-chart', authMiddleware, getRevenueChart);
router.get('/alerts', authMiddleware, getAlerts);
router.get('/activity', authMiddleware, getActivity);

module.exports = router;
