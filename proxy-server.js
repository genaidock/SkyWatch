// Simple CORS proxy server for SkyWatch
// Run: node proxy-server.js
// Then access APIs through: http://localhost:3001/proxy?url=https://...

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.url;

  if (!targetUrl) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Missing url parameter' }));
    return;
  }

  try {
    const targetUrlObj = new URL(targetUrl);
    const protocol = targetUrlObj.protocol === 'https:' ? https : http;

    protocol.get(targetUrl, { timeout: 8000 }, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        res.writeHead(200);
        res.end(data);
      });
    }).on('error', (error) => {
      console.error('Proxy error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    });
  } catch (error) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Invalid URL: ' + error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Usage: http://localhost:${PORT}/proxy?url=https://api.example.com/endpoint\n`);
});
