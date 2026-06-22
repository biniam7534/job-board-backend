const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    note: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'applied',
    },
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// A candidate can only apply once per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
