import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['workshop', 'meetup', 'cleanup', 'fundraiser', 'social', 'other'],
      default: 'other',
    },
    organizerId: { type: String, required: true },
    organizerName: { type: String, required: true },
    neighborhood: { type: String, default: '' },
    location: { type: String, default: '' },
    date: { type: Date, required: true },
    maxAttendees: { type: Number, default: null },
    attendees: [
      {
        userId: String,
        userName: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    volunteers: [
      {
        userId: String,
        userName: String,
        skills: [String],
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;