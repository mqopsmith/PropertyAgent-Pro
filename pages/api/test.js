// Test API to verify Vercel deployment is working
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API routes are working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers
  });
}