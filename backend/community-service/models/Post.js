import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['news', 'discussion', 'announcement'],
      default: 'news',
    },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    neighborhood: { type: String, default: '' },
    likes: { type: Number, default: 0 },
    comments: [
      {
        authorId: String,
        authorName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;