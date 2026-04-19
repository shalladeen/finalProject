import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['pet_care', 'moving', 'groceries', 'repairs', 'tutoring', 'other'],
      default: 'other',
    },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    neighborhood: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
    // volunteers who offered to help
    volunteers: [
      {
        userId: String,
        userName: String,
        offeredAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);
export default HelpRequest;