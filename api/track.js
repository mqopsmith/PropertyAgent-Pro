export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const url = new URL(request.url)
  const trackingId = url.pathname.split('/').pop()
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Validate tracking ID format
  if (!trackingId || !trackingId.startsWith('track_')) {
    return new Response(JSON.stringify({ error: 'Invalid tracking ID format' }), {
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
    
    // Check if tracking record exists
    if (!airtableData.records || airtableData.records.length === 0) {
      return new Response(JSON.stringify({ error: 'Tracking ID not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trackingRecord = airtableData.records[0]
    
    // Step 2: Get the original Cloudinary URL from the tracking record
    const originalUrl = trackingRecord.fields['Original URL']
    
    if (!originalUrl) {
      return new Response(JSON.stringify({ error: 'Original URL not found for this tracking ID' }), {
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
    ).catch(console.error) // Fire and forget

    console.log(`Click tracked: ${trackingId} -> ${originalUrl} (count: ${currentClickCount + 1})`)

    // Step 4: Redirect to the actual Cloudinary URL
    return Response.redirect(originalUrl, 302)

  } catch (error) {
    console.error('Tracking redirect error:', error)
    
    // Fallback: redirect to a placeholder image
    const fallbackUrl = `https://res.cloudinary.com/dvgfjpjot/image/upload/w_800,h_600,c_fill,b_auto,f_auto,q_auto/v1/placeholder.jpg`
    return Response.redirect(fallbackUrl, 302)
  }
}