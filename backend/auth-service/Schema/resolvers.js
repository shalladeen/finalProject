import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) throw new Error('Not authenticated. Please log in.');
      return await User.findById(context.user.id);
    },

    getUsers: async (_, __, context) => {
      if (!context.user) throw new Error('Not authenticated.');
      return await User.find();
    },
  },

  Mutation: {
    register: async (_, { username, email, password, role, neighborhood, interests }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('An account with that email already exists.');

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        username,
        email,
        password: hashedPassword,
        role: role || 'resident',
        neighborhood: neighborhood || '',
        interests: interests || [],
      });

      await user.save();
      const token = generateToken(user);
      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('No account found with that email.');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Incorrect password.');

      const token = generateToken(user);
      return { token, user };
    },
  },
};

export default resolvers;