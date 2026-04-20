import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const services = {
  auth: process.env.AUTH_SERVICE_URL,
  community: process.env.COMMUNITY_SERVICE_URL,
  business: process.env.BUSINESS_EVENTS_SERVICE_URL,
  ai: process.env.AI_SERVICE_URL,
};

const forwardRequest = (serviceUrl) => async (req, res) => {
  try {
    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: req.headers.authorization || '',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Service unreachable: ${err.message}` });
  }
};

app.post('/auth', forwardRequest(services.auth));
app.post('/community', forwardRequest(services.community));
app.post('/business', forwardRequest(services.business));
app.post('/ai', forwardRequest(services.ai));

app.get('/health', async (req, res) => {
  const results = {};
  for (const [name, url] of Object.entries(services)) {
    try {
      const r = await fetch(url.replace('/graphql', '/health'));
      results[name] = r.ok ? 'up' : 'down';
    } catch {
      results[name] = 'unreachable';
    }
  }
  res.json({ gateway: 'running', port: PORT, services: results });
});

app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
  console.log(`  /auth      → ${services.auth}`);
  console.log(`  /community → ${services.community}`);
  console.log(`  /business  → ${services.business}`);
  console.log(`  /ai        → ${services.ai}`);
});