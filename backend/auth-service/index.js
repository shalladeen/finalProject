import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';

import connectDB from './db.js';
import typeDefs from './Schema/typeDefs.js';
import resolvers from './Schema/resolvers.js';
import getUser from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 4001;

await connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(cors());
app.use(bodyParser.json());


app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      const user = getUser(req); 
      return { user };
    },
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'auth-service running', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Auth service running at http://localhost:${PORT}/graphql`);
});