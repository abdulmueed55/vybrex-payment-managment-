const router = require('express').Router();
const { getSettings, updateSettings, exportData } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/export', exportData);

module.exports = router;
