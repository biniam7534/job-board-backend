const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    location: { type: String, trim: true },
    resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

candidateSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

candidateSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

candidateSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Candidate', candidateSchema);
