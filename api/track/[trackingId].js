// Tracking redirect API for PropertyAgent Pro
// Handles: https://property-agent-pro.vercel.app/api/track/{trackingId}

export default async function handler(req, res) {
  const { trackingId } = req.query;
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate tracking ID format
  if (!trackingId || !trackingId.startsWith('track_')) {
    return res.status(400).json({ error: 'Invalid tracking ID format' });
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
    );

    if (!airtableResponse.ok) {
      throw new Error(`Airtable API error: ${airtableResponse.status}`);
    }

    const airtableData = await airtableResponse.json();
    
    // Check if tracking record exists
    if (!airtableData.records || airtableData.records.length === 0) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const trackingRecord = airtableData.records[0];
    
    // Step 2: Get the original Cloudinary URL from the property record
    const propertyIds = trackingRecord.fields.Property;
    if (!propertyIds || propertyIds.length === 0) {
      return res.status(404).json({ error: 'No property linked to tracking record' });
    }

    // For now, we'll reconstruct the Cloudinary URL based on the file info
    // Since we don't store the original URL, we'll use the tracking ID pattern
    const fileName = trackingRecord.fields['File Type'] === 'Property Photos' 
      ? 'property-photo.jpg' 
      : 'document.pdf';
    
    // Extract session info from tracking ID (track_timestamp_index)
    const parts = trackingId.split('_');
    const timestamp = parts[1];
    
    // Construct Cloudinary URL
    const cloudinaryUrl = `https://res.cloudinary.com/dvgfjpjot/image/upload/property-agent-pro/session-${timestamp}/${fileName}`;

    // Step 3: Update click count in Airtable
    const currentClickCount = trackingRecord.fields['Click Count'] || 0;
    const updateResponse = await fetch(
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
    );

    if (!updateResponse.ok) {
      console.error('Failed to update click count:', updateResponse.status);
      // Continue anyway - don't block the redirect
    }

    // Step 4: Log the click for debugging
    console.log(`Click tracked: ${trackingId} -> ${cloudinaryUrl} (count: ${currentClickCount + 1})`);

    // Step 5: Redirect to the original Cloudinary URL
    return res.redirect(302, cloudinaryUrl);

  } catch (error) {
    console.error('Tracking redirect error:', error);
    
    // Fallback: redirect to a default error page or property website
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process tracking redirect'
    });
  }
}