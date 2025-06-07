// Simple test API to verify Vercel API routes are working
export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}