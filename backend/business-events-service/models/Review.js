import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    businessId: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    ownerReply: { type: String, default: '' },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;