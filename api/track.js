export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const url = new URL(request.url)
  
  // Handle both URL formats:
  // /api/track?id=track_123456789_0 (new format)
  // /api/track/track_123456789_0 (old format from path)
  let trackingId = url.searchParams.get('id') || url.pathname.split('/').pop()
  
  console.log('Request URL:', request.url)
  console.log('Extracted trackingId:', trackingId)
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Validate tracking ID format
  if (!trackingId || !trackingId.startsWith('track_')) {
    return new Response(JSON.stringify({ 
      error: 'Invalid tracking ID format',
      received: trackingId,
      url: request.url
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Step 1: Query Airtable to find the tracking record
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/appqqZz0lhYKvj1xh/tblesmMLTPYLqqTwV?filterByFormula={Tracking ID}="${trackingId}"`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!airtableResponse.ok) {
      throw new Error(`Airtable API error: ${airtableResponse.status}`)
    }

    const airtableData = await airtableResponse.json()
    
    console.log('Airtable response:', JSON.stringify(airtableData))
    
    // Check if tracking record exists
    if (!airtableData.records || airtableData.records.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Tracking ID not found',
        trackingId: trackingId,
        recordCount: airtableData.records?.length || 0
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trackingRecord = airtableData.records[0]
    
    // Step 2: Get the original Cloudinary URL from the tracking record
    const originalUrl = trackingRecord.fields['Original URL']
    
    console.log('Original URL found:', originalUrl)
    
    if (!originalUrl) {
      return new Response(JSON.stringify({ 
        error: 'Original URL not found for this tracking ID',
        trackingId: trackingId,
        availableFields: Object.keys(trackingRecord.fields)
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Step 3: Update click count in Airtable (fire and forget)
    const currentClickCount = trackingRecord.fields['Click Count'] || 0
    fetch(
      `https://api.airtable.com/v0/appqqZz0lhYKvj1xh/tblesmMLTPYLqqTwV/${trackingRecord.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Click Count': currentClickCount + 1,
            'Last Click': new Date().toISOString()
          }
        })
      }
    ).catch(error => console.error('Click count update failed:', error))

    console.log(`Click tracked: ${trackingId} -> ${originalUrl} (count: ${currentClickCount + 1})`)

    // Step 4: Redirect to the actual Cloudinary URL
    return Response.redirect(originalUrl, 302)

  } catch (error) {
    console.error('Tracking redirect error:', error)
    
    // Return error details for debugging
    return new Response(JSON.stringify({
      error: 'Tracking redirect failed',
      trackingId: trackingId,
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}