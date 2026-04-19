const typeDefs = `#graphql

  type Business {
    id: ID!
    name: String!
    description: String!
    category: String!
    ownerId: String!
    ownerName: String!
    neighborhood: String
    address: String
    phone: String
    website: String
    imageUrl: String
    createdAt: String
  }

  type Deal {
    id: ID!
    title: String!
    description: String!
    discount: String
    businessId: String!
    businessName: String!
    ownerId: String!
    expiresAt: String
    active: Boolean!
    createdAt: String
  }

  type Attendee {
    userId: String!
    userName: String!
    joinedAt: String
  }

  type EventVolunteer {
    userId: String!
    userName: String!
    skills: [String]
    joinedAt: String
  }

  type Event {
    id: ID!
    title: String!
    description: String!
    category: String!
    organizerId: String!
    organizerName: String!
    neighborhood: String
    location: String
    date: String!
    maxAttendees: Int
    attendees: [Attendee]
    volunteers: [EventVolunteer]
    createdAt: String
  }

  type Review {
    id: ID!
    businessId: String!
    authorId: String!
    authorName: String!
    rating: Int!
    content: String!
    ownerReply: String
    createdAt: String
  }

  type Query {
    getBusinesses(neighborhood: String, category: String): [Business]
    getBusiness(id: ID!): Business
    getDeals(businessId: String): [Deal]
    getEvents(neighborhood: String, category: String): [Event]
    getEvent(id: ID!): Event
    getReviews(businessId: String!): [Review]
  }

  type Mutation {
    createBusiness(
      name: String!
      description: String!
      category: String
      neighborhood: String
      address: String
      phone: String
      website: String
      imageUrl: String
    ): Business!

    createDeal(
      title: String!
      description: String!
      discount: String
      businessId: String!
      businessName: String!
      expiresAt: String
    ): Deal!

    toggleDeal(dealId: ID!): Deal!

    createEvent(
      title: String!
      description: String!
      category: String
      neighborhood: String
      location: String
      date: String!
      maxAttendees: Int
    ): Event!

    joinEvent(eventId: ID!): Event!

    volunteerForEvent(eventId: ID!, skills: [String]): Event!

    createReview(
      businessId: String!
      rating: Int!
      content: String!
    ): Review!

    replyToReview(reviewId: ID!, reply: String!): Review!
  }
`;

export default typeDefs;