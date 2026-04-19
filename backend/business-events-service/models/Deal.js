import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    discount: { type: String, default: '' },
    businessId: { type: String, required: true },
    businessName: { type: String, required: true },
    ownerId: { type: String, required: true },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;