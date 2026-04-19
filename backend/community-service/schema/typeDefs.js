const typeDefs = `#graphql

  type Comment {
    authorId: String!
    authorName: String!
    content: String!
    createdAt: String
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    category: String!
    authorId: String!
    authorName: String!
    neighborhood: String
    likes: Int
    comments: [Comment]
    createdAt: String
  }

  type Volunteer {
    userId: String!
    userName: String!
    offeredAt: String
  }

  type HelpRequest {
    id: ID!
    title: String!
    description: String!
    category: String!
    authorId: String!
    authorName: String!
    neighborhood: String
    status: String!
    volunteers: [Volunteer]
    createdAt: String
  }

  type EmergencyAlert {
    id: ID!
    title: String!
    description: String!
    type: String!
    authorId: String!
    authorName: String!
    neighborhood: String!
    resolved: Boolean!
    createdAt: String
  }

  type Query {
    getPosts(neighborhood: String, category: String): [Post]
    getPost(id: ID!): Post
    getHelpRequests(neighborhood: String, status: String): [HelpRequest]
    getHelpRequest(id: ID!): HelpRequest
    getEmergencyAlerts(neighborhood: String): [EmergencyAlert]
  }

  type Mutation {
    createPost(
      title: String!
      content: String!
      category: String
      neighborhood: String
    ): Post!

    addComment(
      postId: ID!
      content: String!
    ): Post!

    likePost(postId: ID!): Post!

    createHelpRequest(
      title: String!
      description: String!
      category: String
      neighborhood: String
    ): HelpRequest!

    offerHelp(helpRequestId: ID!): HelpRequest!

    updateHelpRequestStatus(
      helpRequestId: ID!
      status: String!
    ): HelpRequest!

    createEmergencyAlert(
      title: String!
      description: String!
      type: String
      neighborhood: String!
    ): EmergencyAlert!

    resolveEmergencyAlert(alertId: ID!): EmergencyAlert!
  }
`;

export default typeDefs;