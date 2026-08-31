const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Risk title is required'],
      trim: true,
      maxlength: [180, 'Risk title cannot exceed 180 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    category: {
      type: String,
      enum: ['timeline', 'technical', 'scope', 'skills', 'workload', 'dependency', 'resource'],
      default: 'technical',
      index: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },
    probability: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    recommendedAction: {
      type: String,
      trim: true,
      maxlength: [2000, 'Recommended action cannot exceed 2000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'mitigated'],
      default: 'open',
      index: true
    },
    source: {
      type: String,
      enum: ['deterministic_engine', 'ai_analyst', 'user_defined'],
      default: 'deterministic_engine'
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

riskSchema.index({ projectId: 1, status: 1 });
riskSchema.index({ projectId: 1, severity: 1 });

const Risk = mongoose.model('Risk', riskSchema);

module.exports = Risk;
