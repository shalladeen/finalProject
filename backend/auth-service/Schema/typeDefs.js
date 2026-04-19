const typeDefs = `#graphql

  # What a User looks like when returned from the API
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    neighborhood: String
    interests: [String]
    createdAt: String
  }

  # Returned after login or register — includes the JWT token
  type AuthPayload {
    token: String!
    user: User!
  }

  # Read operations
  type Query {
    # Get the currently logged-in user (requires JWT in header)
    me: User
    # Get all users — useful for admin/volunteer matching later
    getUsers: [User]
  }

  # Write operations
  type Mutation {
    # Create a new account
    register(
      username: String!
      email: String!
      password: String!
      role: String
      neighborhood: String
      interests: [String]
    ): AuthPayload!

    # Log in and receive a JWT
    login(
      email: String!
      password: String!
    ): AuthPayload!
  }
`;

export default typeDefs;