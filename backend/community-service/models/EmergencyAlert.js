import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['missing_pet', 'safety', 'weather', 'infrastructure', 'other'],
      default: 'other',
    },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    neighborhood: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);
export default EmergencyAlert;