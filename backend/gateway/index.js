import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Each route proxies to the correct microservice
// The frontend sends requests to /auth, /community, /business, /ai
// and the gateway forwards them to the right port

app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL.replace('/graphql', ''),
  changeOrigin: true,
  pathRewrite: { '^/auth': '/graphql' },
}));

app.use('/community', createProxyMiddleware({
  target: process.env.COMMUNITY_SERVICE_URL.replace('/graphql', ''),
  changeOrigin: true,
  pathRewrite: { '^/community': '/graphql' },
}));

app.use('/business', createProxyMiddleware({
  target: process.env.BUSINESS_EVENTS_SERVICE_URL.replace('/graphql', ''),
  changeOrigin: true,
  pathRewrite: { '^/business': '/graphql' },
}));

app.use('/ai', createProxyMiddleware({
  target: process.env.AI_SERVICE_URL.replace('/graphql', ''),
  changeOrigin: true,
  pathRewrite: { '^/ai': '/graphql' },
}));

// Health check — also checks if all services are reachable
app.get('/health', async (req, res) => {
  const services = {
    auth: process.env.AUTH_SERVICE_URL.replace('/graphql', '/health'),
    community: process.env.COMMUNITY_SERVICE_URL.replace('/graphql', '/health'),
    business: process.env.BUSINESS_EVENTS_SERVICE_URL.replace('/graphql', '/health'),
    ai: process.env.AI_SERVICE_URL.replace('/graphql', '/health'),
  };

  const results = {};
  for (const [name, url] of Object.entries(services)) {
    try {
      const res2 = await fetch(url);
      results[name] = res2.ok ? 'up' : 'down';
    } catch {
      results[name] = 'unreachable';
    }
  }

  res.json({ gateway: 'running', port: PORT, services: results });
});

app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
  console.log(`  /auth      → ${process.env.AUTH_SERVICE_URL}`);
  console.log(`  /community → ${process.env.COMMUNITY_SERVICE_URL}`);
  console.log(`  /business  → ${process.env.BUSINESS_EVENTS_SERVICE_URL}`);
  console.log(`  /ai        → ${process.env.AI_SERVICE_URL}`);
});