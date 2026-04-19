const router = require('express').Router();
const { getSettings, updateSettings, exportData, resetData } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/export', exportData);
router.post('/reset-data', resetData);

module.exports = router;
