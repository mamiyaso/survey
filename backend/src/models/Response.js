// backend/src/models/Response.js
const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', ResponseSchema);