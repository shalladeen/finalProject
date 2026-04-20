import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Each service has its own endpoint through the gateway
export const authLink_url = 'http://localhost:4000/auth';
export const communityLink_url = 'http://localhost:4000/community';
export const businessLink_url = 'http://localhost:4000/business';
export const aiLink_url = 'http://localhost:4000/ai';

// Adds the JWT token to every request header automatically
const authMiddleware = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Auth service client
const authHttpLink = createHttpLink({ uri: authLink_url });
export const authClient = new ApolloClient({
  link: authMiddleware.concat(authHttpLink),
  cache: new InMemoryCache(),
});

// Community service client
const communityHttpLink = createHttpLink({ uri: communityLink_url });
export const communityClient = new ApolloClient({
  link: authMiddleware.concat(communityHttpLink),
  cache: new InMemoryCache(),
});

// Business & Events service client
const businessHttpLink = createHttpLink({ uri: businessLink_url });
export const businessClient = new ApolloClient({
  link: authMiddleware.concat(businessHttpLink),
  cache: new InMemoryCache(),
});

// AI service client
const aiHttpLink = createHttpLink({ uri: aiLink_url });
export const aiClient = new ApolloClient({
  link: authMiddleware.concat(aiHttpLink),
  cache: new InMemoryCache(),
});