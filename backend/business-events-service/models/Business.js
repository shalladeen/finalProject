import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['restaurant', 'retail', 'service', 'health', 'education', 'other'],
      default: 'other',
    },
    ownerId: { type: String, required: true },
    ownerName: { type: String, required: true },
    neighborhood: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const Business = mongoose.model('Business', businessSchema);
export default Business;