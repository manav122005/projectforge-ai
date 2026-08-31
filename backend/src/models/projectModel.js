const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    originalIdea: {
      type: String,
      trim: true,
      maxlength: [5000, 'Original idea cannot exceed 5000 characters'],
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'planning', 'active', 'paused', 'completed', 'archived'],
      default: 'planning',
      index: true
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70
    },
    healthBreakdown: {
      technical: { type: Number, default: 75 },
      timeline: { type: Number, default: 70 },
      skills: { type: Number, default: 65 },
      scope: { type: Number, default: 72 },
      team: { type: Number, default: 70 }
    },
    healthHistory: [
      {
        score: { type: Number, required: true },
        recordedAt: { type: Date, default: Date.now }
      }
    ],
    architecture: {
      nodes: { type: Array, default: [] },
      edges: { type: Array, default: [] }
    },
    technologyStack: [
      {
        technology: String,
        category: String,
        reason: String,
        confidence: Number,
        alternatives: [String]
      }
    ],
    requiredSkills: {
      type: [String],
      default: []
    },
    skillGaps: {
      type: Array,
      default: []
    },
    recommendedMVP: {
      type: [String],
      default: []
    },
    risks: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Search indexes
projectSchema.index({ name: 'text', description: 'text', originalIdea: 'text' });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
