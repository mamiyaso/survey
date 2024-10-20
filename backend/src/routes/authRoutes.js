// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.put('/update', auth, authController.updateUser);
router.delete('/delete', auth, authController.deleteUser);

module.exports = router;