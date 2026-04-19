const typeDefs = `#graphql

  # Returned by the summarization feature
  type Summary {
    originalLength: Int!
    summary: String!
  }

  # Returned by the sentiment analysis feature
  type SentimentResult {
    text: String!
    sentiment: String!   # "positive", "negative", or "neutral"
    score: Float!        # -1.0 (most negative) to 1.0 (most positive)
    confidence: String!  # "high", "medium", or "low"
  }

  # Returned by the volunteer matching feature
  type VolunteerMatch {
    userId: String!
    userName: String!
    matchScore: Float!
    matchReason: String!
  }

  # Returned by the event timing prediction feature
  type EventTimingSuggestion {
    suggestedDay: String!
    suggestedTime: String!
    reason: String!
  }

  type Query {
    # Summarize a long discussion or post
    summarizeText(text: String!): Summary!

    # Analyze sentiment of a review or post
    analyzeSentiment(text: String!): SentimentResult!

    # Suggest best volunteers for a help request
    matchVolunteers(
      helpRequestCategory: String!
      neighborhood: String!
    ): [VolunteerMatch!]!

    # Predict best time to run an event
    suggestEventTiming(
      eventCategory: String!
      neighborhood: String!
    ): EventTimingSuggestion!
  }
`;

export default typeDefs;