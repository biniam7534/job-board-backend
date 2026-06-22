const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    location: { type: String, required: true, trim: true },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'contract', 'internship'],
      required: true,
    },
    skillsRequired: [{ type: String, trim: true }],
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    experienceRequired: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });
jobSchema.index({ location: 1, jobType: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
