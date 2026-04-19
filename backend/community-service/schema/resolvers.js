import Post from '../models/Post.js';
import HelpRequest from '../models/HelpRequest.js';
import EmergencyAlert from '../models/EmergencyAlert.js';

const resolvers = {
  Query: {
    getPosts: async (_, { neighborhood, category }) => {
      const filter = {};
      if (neighborhood) filter.neighborhood = neighborhood;
      if (category) filter.category = category;
      return await Post.find(filter).sort({ createdAt: -1 });
    },

    getPost: async (_, { id }) => {
      return await Post.findById(id);
    },

    getHelpRequests: async (_, { neighborhood, status }) => {
      const filter = {};
      if (neighborhood) filter.neighborhood = neighborhood;
      if (status) filter.status = status;
      return await HelpRequest.find(filter).sort({ createdAt: -1 });
    },

    getHelpRequest: async (_, { id }) => {
      return await HelpRequest.findById(id);
    },

    getEmergencyAlerts: async (_, { neighborhood }) => {
      const filter = { resolved: false };
      if (neighborhood) filter.neighborhood = neighborhood;
      return await EmergencyAlert.find(filter).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    createPost: async (_, { title, content, category, neighborhood }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const post = new Post({
        title,
        content,
        category: category || 'news',
        neighborhood: neighborhood || '',
        authorId: context.user.id,
        authorName: context.user.username || 'Anonymous',
      });
      return await post.save();
    },

    addComment: async (_, { postId, content }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found.');
      post.comments.push({
        authorId: context.user.id,
        authorName: context.user.username || 'Anonymous',
        content,
      });
      return await post.save();
    },

    likePost: async (_, { postId }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likes: 1 } },
        { new: true }
      );
      if (!post) throw new Error('Post not found.');
      return post;
    },

    createHelpRequest: async (_, { title, description, category, neighborhood }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const helpRequest = new HelpRequest({
        title,
        description,
        category: category || 'other',
        neighborhood: neighborhood || '',
        authorId: context.user.id,
        authorName: context.user.username || 'Anonymous',
      });
      return await helpRequest.save();
    },

    offerHelp: async (_, { helpRequestId }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const helpRequest = await HelpRequest.findById(helpRequestId);
      if (!helpRequest) throw new Error('Help request not found.');
      const alreadyVolunteered = helpRequest.volunteers.some(
        (v) => v.userId === context.user.id
      );
      if (alreadyVolunteered) throw new Error('You have already offered help.');
      helpRequest.volunteers.push({
        userId: context.user.id,
        userName: context.user.username || 'Anonymous',
      });
      return await helpRequest.save();
    },

    updateHelpRequestStatus: async (_, { helpRequestId, status }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const helpRequest = await HelpRequest.findById(helpRequestId);
      if (!helpRequest) throw new Error('Help request not found.');
      if (helpRequest.authorId !== context.user.id) {
        throw new Error('Only the author can update the status.');
      }
      helpRequest.status = status;
      return await helpRequest.save();
    },

    createEmergencyAlert: async (_, { title, description, type, neighborhood }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const alert = new EmergencyAlert({
        title,
        description,
        type: type || 'other',
        neighborhood,
        authorId: context.user.id,
        authorName: context.user.username || 'Anonymous',
      });
      return await alert.save();
    },

    resolveEmergencyAlert: async (_, { alertId }, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      const alert = await EmergencyAlert.findById(alertId);
      if (!alert) throw new Error('Alert not found.');
      if (alert.authorId !== context.user.id) {
        throw new Error('Only the author can resolve this alert.');
      }
      alert.resolved = true;
      return await alert.save();
    },
  },
};

export default resolvers;