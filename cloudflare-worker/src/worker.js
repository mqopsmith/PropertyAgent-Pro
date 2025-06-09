// PropertyAgent Pro - File Upload & Tracking Worker
// This replaces Cloudinary with full PDF support + tracking

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      if (pathname === '/upload' && request.method === 'POST') {
        return await handleUpload(request, env);
      }
      
      if (pathname.startsWith('/track/') && request.method === 'GET') {
        return await handleTrackedView(request, env);
      }
      
      if (pathname.startsWith('/stats/') && request.method === 'GET') {
        return await handleStats(request, env);
      }

      if (pathname === '/analytics' && request.method === 'GET') {
        return await handleAnalytics(request, env);
      }

      return new Response('PropertyAgent Pro File Tracker', { 
        status: 200,
        headers: CORS_HEADERS 
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, { 
        status: 500,
        headers: CORS_HEADERS 
      });
    }
  },
};

async function handleUpload(request, env) {
  const formData = await request.formData();
  const file = formData.get('file');
  const agentId = formData.get('agentId') || 'sarah-lim-001';
  const messageId = formData.get('messageId') || `msg_${Date.now()}`;

  if (!file) {
    return new Response('No file provided', { 
      status: 400,
      headers: CORS_HEADERS 
    });
  }

  // Generate tracking ID and filename
  const trackingId = generateTrackingId();
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFilename = `${agentId}/${timestamp}_${safeFileName}`;

  // Upload to R2 with proper metadata
  await env.PROPERTYAGENT_FILES.put(uniqueFilename, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      contentDisposition: `inline; filename="${file.name}"`,
    },
    customMetadata: {
      originalName: file.name,
      trackingId: trackingId,
      agentId: agentId,
      messageId: messageId,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Initialize tracking data
  const trackingData = {
    trackingId,
    filename: uniqueFilename,
    originalName: file.name,
    agentId,
    messageId,
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    views: 0,
    uniqueViews: 0,
    viewHistory: [],
    lastViewed: null,
    hotLeadScore: 0,
  };

  await env.PROPERTYAGENT_TRACKING.put(trackingId, JSON.stringify(trackingData));

  // Create tracking URL that looks like a normal file link
  const trackingUrl = `${new URL(request.url).origin}/track/${trackingId}/${encodeURIComponent(file.name)}`;

  return new Response(JSON.stringify({
    success: true,
    trackingId,
    trackingUrl,
    cloudinaryUrl: trackingUrl, // Keep same property name for n8n compatibility  
    filename: uniqueFilename,
    originalName: file.name,
    fileSize: file.size,
    fileType: file.type,
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

async function handleTrackedView(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const trackingId = pathParts[2];
  const originalName = decodeURIComponent(pathParts[3] || '');

  // Get tracking data
  const trackingDataStr = await env.PROPERTYAGENT_TRACKING.get(trackingId);
  if (!trackingDataStr) {
    return new Response('File not found', { status: 404 });
  }

  const trackingData = JSON.parse(trackingDataStr);
  const filename = trackingData.filename;

  // Collect visitor information
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  const referer = request.headers.get('Referer') || 'direct';
  const country = request.cf?.country || 'unknown';
  const city = request.cf?.city || 'unknown';

  // Update tracking data
  trackingData.views += 1;
  trackingData.lastViewed = new Date().toISOString();
  
  const viewInfo = {
    timestamp: new Date().toISOString(),
    ip: clientIP,
    userAgent,
    referer,
    country,
    city,
  };
  
  trackingData.viewHistory.push(viewInfo);

  // Check for unique views (same IP within 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentViewsFromIP = trackingData.viewHistory.filter(
    view => view.ip === clientIP && new Date(view.timestamp) > oneDayAgo
  );
  
  if (recentViewsFromIP.length === 1) {
    trackingData.uniqueViews += 1;
  }

  // Calculate hot lead score
  trackingData.hotLeadScore = calculateHotLeadScore(trackingData);

  // Save updated tracking data
  await env.PROPERTYAGENT_TRACKING.put(trackingId, JSON.stringify(trackingData));

  // Send analytics to n8n (fire and forget)
  if (trackingData.views % 3 === 1) { // Every 3rd view, send analytics
    sendAnalyticsToN8n(trackingData, viewInfo).catch(err => 
      console.log('Analytics send failed (non-critical):', err.message)
    );
  }

  // Get file from R2
  const object = await env.PROPERTYAGENT_FILES.get(filename);
  if (!object) {
    return new Response('File not found in storage', { status: 404 });
  }

  // Return file with appropriate headers
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  
  // Ensure proper content disposition for different file types
  if (trackingData.fileType === 'application/pdf') {
    headers.set('Content-Disposition', `inline; filename="${originalName}"`);
    headers.set('Content-Type', 'application/pdf');
  } else if (trackingData.fileType.startsWith('image/')) {
    headers.set('Content-Disposition', `inline; filename="${originalName}"`);
  } else {
    headers.set('Content-Disposition', `attachment; filename="${originalName}"`);
  }
  
  headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}

async function handleStats(request, env) {
  const url = new URL(request.url);
  const trackingId = url.pathname.split('/')[2];

  const trackingDataStr = await env.PROPERTYAGENT_TRACKING.get(trackingId);
  if (!trackingDataStr) {
    return new Response('Tracking data not found', { status: 404 });
  }

  const trackingData = JSON.parse(trackingDataStr);
  
  const stats = {
    ...trackingData,
    engagement: {
      totalViews: trackingData.views,
      uniqueViews: trackingData.uniqueViews,
      hotLeadScore: trackingData.hotLeadScore,
      lastViewed: trackingData.lastViewed,
    },
    geography: getTopCountries(trackingData.viewHistory),
    timeline: getViewTimeline(trackingData.viewHistory),
  };

  return new Response(JSON.stringify(stats), {
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

async function handleAnalytics(request, env) {
  // Get all tracking data
  const { keys } = await env.PROPERTYAGENT_TRACKING.list();
  const allTrackingData = [];

  for (const key of keys) {
    const data = await env.PROPERTYAGENT_TRACKING.get(key.name);
    if (data) {
      allTrackingData.push(JSON.parse(data));
    }
  }

  const analytics = {
    summary: {
      totalFiles: allTrackingData.length,
      totalViews: allTrackingData.reduce((sum, data) => sum + data.views, 0),
      totalUniqueViews: allTrackingData.reduce((sum, data) => sum + data.uniqueViews, 0),
      averageEngagement: allTrackingData.length > 0 ? 
        allTrackingData.reduce((sum, data) => sum + data.hotLeadScore, 0) / allTrackingData.length : 0,
    },
    hotLeads: identifyHotLeads(allTrackingData),
    topFiles: allTrackingData
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(data => ({
        originalName: data.originalName,
        views: data.views,
        uniqueViews: data.uniqueViews,
        hotLeadScore: data.hotLeadScore,
        uploadedAt: data.uploadedAt,
        lastViewed: data.lastViewed,
      })),
    agentActivity: getAgentActivity(allTrackingData),
    engagementTrends: getEngagementTrends(allTrackingData),
  };

  return new Response(JSON.stringify(analytics), {
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

// Helper functions
function generateTrackingId() {
  return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateHotLeadScore(trackingData) {
  let score = 0;
  
  // Base points for engagement
  score += trackingData.views * 10;
  score += trackingData.uniqueViews * 25;
  
  // Recent activity bonus
  if (trackingData.lastViewed) {
    const hoursSinceLastView = (Date.now() - new Date(trackingData.lastViewed)) / (1000 * 60 * 60);
    if (hoursSinceLastView < 24) score += 50;
    else if (hoursSinceLastView < 168) score += 25;
  }
  
  // Multiple country views (sharing the link)
  const countries = new Set(trackingData.viewHistory.map(v => v.country));
  if (countries.size > 1) score += 30;
  
  return Math.min(score, 100); // Cap at 100
}

function getTopCountries(viewHistory) {
  const countries = {};
  viewHistory.forEach(view => {
    countries[view.country] = (countries[view.country] || 0) + 1;
  });
  
  return Object.entries(countries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));
}

function getViewTimeline(viewHistory) {
  const timeline = {};
  viewHistory.forEach(view => {
    const date = view.timestamp.split('T')[0];
    timeline[date] = (timeline[date] || 0) + 1;
  });
  
  return Object.entries(timeline)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, views]) => ({ date, views }));
}

function identifyHotLeads(allTrackingData) {
  const ipActivity = {};
  
  allTrackingData.forEach(data => {
    data.viewHistory.forEach(view => {
      if (!ipActivity[view.ip]) {
        ipActivity[view.ip] = {
          totalViews: 0,
          uniqueFiles: new Set(),
          countries: new Set(),
          lastActivity: null,
          fileTypes: new Set(),
        };
      }
      ipActivity[view.ip].totalViews += 1;
      ipActivity[view.ip].uniqueFiles.add(data.trackingId);
      ipActivity[view.ip].countries.add(view.country);
      ipActivity[view.ip].lastActivity = view.timestamp;
      ipActivity[view.ip].fileTypes.add(data.fileType);
    });
  });

  return Object.entries(ipActivity)
    .map(([ip, activity]) => ({
      ip,
      totalViews: activity.totalViews,
      uniqueFiles: activity.uniqueFiles.size,
      countries: Array.from(activity.countries),
      fileTypes: Array.from(activity.fileTypes),
      lastActivity: activity.lastActivity,
      hotScore: activity.totalViews * 10 + activity.uniqueFiles.size * 25,
    }))
    .filter(lead => lead.hotScore > 40)
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 10);
}

function getAgentActivity(allTrackingData) {
  const agents = {};
  allTrackingData.forEach(data => {
    if (!agents[data.agentId]) {
      agents[data.agentId] = { files: 0, views: 0 };
    }
    agents[data.agentId].files += 1;
    agents[data.agentId].views += data.views;
  });
  return agents;
}

function getEngagementTrends(allTrackingData) {
  const trends = {};
  allTrackingData.forEach(data => {
    data.viewHistory.forEach(view => {
      const date = view.timestamp.split('T')[0];
      if (!trends[date]) trends[date] = { views: 0, files: new Set() };
      trends[date].views += 1;
      trends[date].files.add(data.trackingId);
    });
  });
  
  return Object.entries(trends)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, data]) => ({
      date,
      views: data.views,
      uniqueFiles: data.files.size,
    }));
}

async function sendAnalyticsToN8n(trackingData, viewInfo) {
  const analyticsPayload = {
    body: {
      action: 'file_view_analytics',
      trackingId: trackingData.trackingId,
      fileName: trackingData.originalName,
      agentId: trackingData.agentId,
      messageId: trackingData.messageId,
      viewInfo: viewInfo,
      totalViews: trackingData.views,
      uniqueViews: trackingData.uniqueViews,
      hotLeadScore: trackingData.hotLeadScore,
      lastViewed: trackingData.lastViewed,
    }
  };

  // Send to your n8n webhook (fire and forget)
  try {
    await fetch('https://n8n.opsmith.biz/webhook/file-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyticsPayload)
    });
  } catch (error) {
    console.log('N8n analytics webhook failed:', error.message);
  }
}