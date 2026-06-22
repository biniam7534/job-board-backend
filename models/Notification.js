const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientType: { type: String, enum: ['employer', 'candidate'], required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['new_application', 'status_update', 'system'],
      default: 'system',
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
