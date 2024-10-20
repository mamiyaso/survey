const { body, validationResult } = require('express-validator');

exports.validateSurveyCreation = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Başlık 3-100 karakter arasında olmalıdır'),
  body('questions').isArray({ min: 1 }).withMessage('En az bir soru olmalıdır'),
  body('questions.*.text').trim().isLength({ min: 1 }).withMessage('Soru metni boş olamaz'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('Her soru için en az 2 seçenek olmalıdır'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateSurveyResponse = [
  body('answers').isArray().withMessage('Cevaplar bir dizi olmalıdır'),
  body('answers.*').isInt({ min: 0 }).withMessage('Her cevap geçerli bir seçenek indeksi olmalıdır'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];