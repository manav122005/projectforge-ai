const mongoose = require('mongoose');

const projectEventSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: [
        'PROJECT_CREATED',
        'AI_ANALYSIS_COMPLETED',
        'ARCHITECTURE_GENERATED',
        'PLAN_GENERATED',
        'TASK_CREATED',
        'TASK_COMPLETED',
        'TASK_STATUS_CHANGED',
        'RISK_DETECTED',
        'RISK_RESOLVED',
        'RECOVERY_RECOMMENDED',
        'RECOVERY_APPLIED',
        'MEMBER_ADDED',
        'MEMBER_REMOVED',
        'HEALTH_SCORE_CHANGED',
        'COPILOT_QUERY'
      ],
      required: [true, 'Event type is required'],
      index: true
    },
    message: {
      type: String,
      required: [true, 'Event message is required'],
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

projectEventSchema.index({ projectId: 1, createdAt: -1 });

const ProjectEvent = mongoose.model('ProjectEvent', projectEventSchema);

module.exports = ProjectEvent;
