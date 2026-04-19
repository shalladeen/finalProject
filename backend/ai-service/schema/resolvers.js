// All AI features are mocked here.
// When a real API key is available, replace the mock logic
// inside each resolver with an actual Gemini or OpenAI API call.

const resolvers = {
  Query: {
    // Mock summarization — trims long text and appends a note
    summarizeText: async (_, { text }, context) => {
      if (!context.user) throw new Error('Not authenticated.');

      const words = text.trim().split(/\s+/);
      const originalLength = words.length;

      // If text is short enough, no summary needed
      if (originalLength <= 50) {
        return {
          originalLength,
          summary: text,
        };
      }

      // Take first 40 words as a mock summary
      const summary = words.slice(0, 40).join(' ') + '... [AI-generated summary]';
      return { originalLength, summary };
    },

    // Mock sentiment analysis — checks for positive/negative keywords
    analyzeSentiment: async (_, { text }, context) => {
      if (!context.user) throw new Error('Not authenticated.');

      const lower = text.toLowerCase();

      const positiveWords = ['great', 'excellent', 'love', 'amazing', 'good', 'helpful', 'wonderful', 'fantastic', 'best', 'happy'];
      const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'horrible', 'disappointing', 'poor', 'rude', 'never'];

      let score = 0;
      positiveWords.forEach((w) => { if (lower.includes(w)) score += 0.2; });
      negativeWords.forEach((w) => { if (lower.includes(w)) score -= 0.2; });

      // Clamp score between -1 and 1
      score = Math.max(-1, Math.min(1, score));

      const sentiment = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
      const confidence = Math.abs(score) > 0.5 ? 'high' : Math.abs(score) > 0.2 ? 'medium' : 'low';

      return { text, sentiment, score, confidence };
    },

    // Mock volunteer matching — returns placeholder matches
    matchVolunteers: async (_, { helpRequestCategory, neighborhood }, context) => {
      if (!context.user) throw new Error('Not authenticated.');

      // In production this would query the user service and rank by interests/location
      return [
        {
          userId: 'mock-user-1',
          userName: 'Alice M.',
          matchScore: 0.95,
          matchReason: `Strong match: interested in ${helpRequestCategory} and lives in ${neighborhood}`,
        },
        {
          userId: 'mock-user-2',
          userName: 'James T.',
          matchScore: 0.78,
          matchReason: `Partial match: has helped with ${helpRequestCategory} before`,
        },
        {
          userId: 'mock-user-3',
          userName: 'Priya K.',
          matchScore: 0.61,
          matchReason: `Nearby volunteer available in ${neighborhood}`,
        },
      ];
    },

    // Mock event timing suggestion — based on category
    suggestEventTiming: async (_, { eventCategory, neighborhood }, context) => {
      if (!context.user) throw new Error('Not authenticated.');

      const timingMap = {
        workshop: { day: 'Saturday', time: '10:00 AM', reason: 'Workshops see highest attendance on weekend mornings' },
        meetup: { day: 'Thursday', time: '6:30 PM', reason: 'Weekday evenings work best for casual meetups' },
        cleanup: { day: 'Sunday', time: '9:00 AM', reason: 'Community cleanups get more volunteers on Sunday mornings' },
        fundraiser: { day: 'Saturday', time: '2:00 PM', reason: 'Fundraisers peak on Saturday afternoons' },
        social: { day: 'Friday', time: '7:00 PM', reason: 'Social events are most popular on Friday evenings' },
      };

      const timing = timingMap[eventCategory] || {
        day: 'Saturday',
        time: '11:00 AM',
        reason: `Based on general engagement patterns in ${neighborhood}`,
      };

      return {
        suggestedDay: timing.day,
        suggestedTime: timing.time,
        reason: timing.reason,
      };
    },
  },
};

export default resolvers;