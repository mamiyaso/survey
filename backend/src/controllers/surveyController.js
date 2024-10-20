// backend/src/controllers/surveyController.js
const Survey = require('../models/Survey');
const Response = require('../models/Response');

exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().select('title createdAt');
    res.json(surveys);
  } catch (error) {
    console.error('Error fetching all surveys:', error);
    res.status(500).json({ message: 'Anketler getirilirken bir hata oluştu' });
  }
};

exports.createSurvey = async (req, res) => {
  try {
    console.log('Received survey data:', JSON.stringify(req.body, null, 2));

    const { title, questions, enablePagination } = req.body;

    // Veri doğrulama
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Geçersiz anket başlığı' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'En az bir soru gereklidir' });
    }

    const processedQuestions = questions.map(question => {
      if (question.type === 'text') {
        return { ...question, options: [] };
      }
      return question;
    });

    const survey = new Survey({
      title,
      questions: processedQuestions,
      enablePagination,
      createdBy: req.user.id
    });

    console.log('Survey to be saved:', JSON.stringify(survey, null, 2));

    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Doğrulama hatası', errors: error.errors });
    }
    res.status(500).json({ 
      message: 'Anket oluşturulurken bir hata oluştu', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


exports.getSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Anket bulunamadı' });
    }
    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ message: 'Anket getirilirken bir hata oluştu' });
  }
};

exports.getUserSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ createdBy: req.user.id }).select('title createdAt responseCount');
    res.json(surveys);
  } catch (error) {
    console.error('Error fetching user surveys:', error);
    res.status(500).json({ message: 'Kullanıcı anketleri getirilirken bir hata oluştu' });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    const { title, questions, enablePagination } = req.body;
    const survey = await Survey.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { title, questions, enablePagination },
      { new: true, runValidators: true }
    );
    if (!survey) {
      return res.status(404).json({ message: 'Anket bulunamadı veya güncelleme izniniz yok' });
    }
    res.json(survey);
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ message: 'Anket güncellenirken bir hata oluştu' });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!survey) {
      return res.status(404).json({ message: 'Anket bulunamadı veya silme izniniz yok' });
    }
    res.json({ message: 'Anket başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ message: 'Anket silinirken bir hata oluştu' });
  }
};

exports.respondToSurvey = async (req, res) => {
  try {
    const { answers } = req.body;
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Anket bulunamadı' });
    }

    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    const response = new Response({
      survey: req.params.id,
      answers: formattedAnswers
    });

    await response.save();

    // Anket cevap sayısını artır
    await Survey.findByIdAndUpdate(req.params.id, { $inc: { responseCount: 1 } });

    res.status(201).json({ message: 'Yanıtınız kaydedildi' });
  } catch (error) {
    console.error('Error responding to survey:', error);
    res.status(500).json({ message: 'Yanıt kaydedilirken bir hata oluştu' });
  }
};

exports.getSurveyResults = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Anket bulunamadı' });
    }

    const responses = await Response.find({ survey: req.params.id });

    const results = survey.questions.map((question, index) => {
      const questionResponses = responses.map(r => r.answers[index]);
      
      if (question.type === 'text') {
        return {
          questionText: question.text,
          type: 'text',
          answers: questionResponses.map(r => r.answer).filter(Boolean)
        };
      } else {
        const optionCounts = question.options.map((_, optionIndex) => 
          questionResponses.filter(r => r.answer === optionIndex).length
        );
        return {
          questionText: question.text,
          type: question.type,
          options: question.options,
          optionCounts
        };
      }
    });

    res.json({
      surveyTitle: survey.title,
      totalResponses: responses.length,
      results
    });
  } catch (error) {
    console.error('Error fetching survey results:', error);
    res.status(500).json({ message: 'Anket sonuçları getirilirken bir hata oluştu' });
  }
};