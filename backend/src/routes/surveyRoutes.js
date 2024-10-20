// backend/src/routes/surveyRoutes.js

const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const auth = require('../middleware/auth');

// Protected routes
router.get('/user', auth, surveyController.getUserSurveys);
router.post('/', auth, surveyController.createSurvey);
router.put('/:id', auth, surveyController.updateSurvey);
router.delete('/:id', auth, surveyController.deleteSurvey);
router.get('/:id/results', auth, surveyController.getSurveyResults);

// Public routes
router.get('/', surveyController.getAllSurveys);
router.get('/:id', surveyController.getSurvey);
router.post('/:id/respond', surveyController.respondToSurvey);

module.exports = router;