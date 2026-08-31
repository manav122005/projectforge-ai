const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Milestone name is required'],
      trim: true,
      maxlength: [120, 'Milestone name cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    startDate: {
      type: Date,
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'delayed'],
      default: 'planning',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying project milestones
milestoneSchema.index({ projectId: 1, createdAt: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;
