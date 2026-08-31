const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      required: [true, 'Milestone ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [160, 'Task title cannot exceed 160 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'blocked', 'review', 'completed'],
      default: 'todo',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Estimated hours is required'],
      min: [0.5, 'Estimated hours must be at least 0.5']
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, 'Actual hours cannot be negative']
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    assignedMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectMember',
      default: null,
      index: true
    },
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast Kanban queries and task filtering
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ projectId: 1, milestoneId: 1 });
taskSchema.index({ projectId: 1, assignedMember: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
