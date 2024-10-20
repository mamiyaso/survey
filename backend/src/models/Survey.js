// backend/src/models/Survey.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['radio', 'checkbox', 'text'],
    required: true
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        return this.type === 'text' || (Array.isArray(v) && v.length > 0);
      },
      message: props => `Options are required for ${props.value} type questions`
    }
  }
});

const SurveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    text: String,
    type: {
      type: String,
      enum: ['radio', 'checkbox', 'text'],
      required: true
    },
    options: [String]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responseCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Survey', SurveySchema);