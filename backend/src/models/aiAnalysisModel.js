const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
      default: null
    },
    provider: {
      type: String,
      enum: ['openrouter', 'gemini', 'deterministic'],
      required: true
    },
    model: {
      type: String,
      required: true
    },
    analysisType: {
      type: String,
      enum: ['full_blueprint', 'architecture', 'planning'],
      required: true
    },
    promptVersion: {
      type: String,
      default: 'v1.0'
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    confidence: {
      type: Number,
      default: 0.9,
      min: 0,
      max: 1
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);

module.exports = AIAnalysis;
