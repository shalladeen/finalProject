import Business from '../models/Business.js';
import Deal from '../models/Deal.js';
import Event from '../models/Event.js';
import Review from '../models/Review.js';

const resolvers = {
  Query: {
    getBusinesses: async (_, { neighborhood, category }) => {
      const filter = {};
      if (neighborhood) filter.neighborhood = neighborhood;
      if (category) filter.category = category;
      return await Business.find(filter).sort({ createdAt: -1 });
    },

    getBusiness: async (_, { id }) => {
      return await Business.findById(id);
    },

    getDeals: async (_, { businessId }) => {
      const filter = { active: true };
      if (businessId) filter.businessId = businessId;
      return await Deal.find(filter).sort({ createdAt: -1 });
    },

    getEvents: async (_, { neighborhood, category }) => {
      const filter = {};
      if (neighborhood) filter.neighborhood = neighborhood;
      if (category) filter.category = category;
      return await Event.find(filter).sort({ date: 1 });
    },

    getEvent: async (_, { id }) => {
      return await Event.findById(id);
    },

    getReviews: async (_, { businessId }) => {
      return await Review.find({ businessId }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    createBusiness: async (_, args, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      if (context.user.role !== 'business_owner') {
        throw new Error('Only business owners can create a listing.');
      }
      const business = new Business({
        ...args,
        ownerId: context.user.id,
        ownerName: context.user.username || 'Anonymous',
      });
      return await business.save();
    },

    createDeal: async (_, args, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      if (context.user.role !== 'business_owner') {
        throw new Error('Only business owners can create deals.');
      }
      const deal = new Deal({
        ...args,
        ownerId: context.user.id,
      });
      return await deal.save();
    },

    toggleDeal: async (_, { dealId }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const deal = await Deal.findById(dealId);
      if (!deal) throw new Error('Deal not found.');
      if (deal.ownerId !== context.user.id) {
        throw new Error('Only the owner can toggle this deal.');
      }
      deal.active = !deal.active;
      return await deal.save();
    },

    createEvent: async (_, args, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      if (context.user.role !== 'community_organizer') {
        throw new Error('Only community organizers can create events.');
      }
      const event = new Event({
        ...args,
        date: new Date(args.date),
        organizerId: context.user.id,
        organizerName: context.user.username || 'Anonymous',
      });
      return await event.save();
    },

    joinEvent: async (_, { eventId }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found.');
      const alreadyJoined = event.attendees.some((a) => a.userId === context.user.id);
      if (alreadyJoined) throw new Error('You have already joined this event.');
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        throw new Error('This event is full.');
      }
      event.attendees.push({
        userId: context.user.id,
        userName: context.user.username || 'Anonymous',
      });
      return await event.save();
    },

    volunteerForEvent: async (_, { eventId, skills }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found.');
      const alreadyVolunteered = event.volunteers.some((v) => v.userId === context.user.id);
      if (alreadyVolunteered) throw new Error('You have already volunteered for this event.');
      event.volunteers.push({
        userId: context.user.id,
        userName: context.user.username || 'Anonymous',
        skills: skills || [],
      });
      return await event.save();
    },

    createReview: async (_, { businessId, rating, content }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const review = new Review({
        businessId,
        rating,
        content,
        authorId: context.user.id,
        authorName: context.user.username || 'Anonymous',
      });
      return await review.save();
    },

    replyToReview: async (_, { reviewId, reply }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const review = await Review.findById(reviewId);
      if (!review) throw new Error('Review not found.');
      const business = await Business.findById(review.businessId);
      if (!business || business.ownerId !== context.user.id) {
        throw new Error('Only the business owner can reply to reviews.');
      }
      review.ownerReply = reply;
      return await review.save();
    },
  },
};

export default resolvers;