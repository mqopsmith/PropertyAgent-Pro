// PropertyAgent Pro - Cloudflare File Handling Upgrade
// Replace the existing Cloudinary functionality with this code

// NEW CONFIGURATION - Replace in your index.html
const CONFIG_CLOUDFLARE = {
    // Replace with your actual Cloudflare Worker URL after deployment
    CLOUDFLARE_WORKER_URL: 'https://propertyagent-pro-tracker.YOUR_USERNAME.workers.dev',
    N8N_BASE_URL: 'https://n8n.opsmith.biz/webhook',
    AGENT_ID: 'sarah-lim-001'
};

// REPLACE: The Cloudinary upload function with Cloudflare upload
async function uploadToCloudflare(file) {
    const messageId = `msg_${Date.now()}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agentId', CONFIG_CLOUDFLARE.AGENT_ID);
    formData.append('messageId', messageId);

    try {
        const response = await fetch(`${CONFIG_CLOUDFLARE.CLOUDFLARE_WORKER_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        return {
            name: result.originalName,
            type: getFileTypeFromMime(result.fileType),
            size: result.fileSize,
            cloudinaryUrl: result.trackingUrl, // Keep same property name for n8n compatibility
            trackingUrl: result.trackingUrl,
            trackingId: result.trackingId,
            publicId: result.trackingId, // For compatibility
            format: getFormatFromMime(result.fileType),
            uploadedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Cloudflare upload error:', error);
        throw error;
    }
}

// Helper functions for file type detection
function getFileTypeFromMime(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('video/')) return 'video';
    return 'document';
}

function getFormatFromMime(mimeType) {
    const typeMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
    };
    return typeMap[mimeType] || 'unknown';
}

// REPLACE: File validation function with enhanced support
function validateFileCloudflare(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        // Documents  
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Text
        'text/plain', 'text/csv'
    ];

    if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
    }

    if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported.`);
        return false;
    }

    return true;
}

// NEW: Analytics dashboard function
async function showFileAnalytics() {
    try {
        showNotification('Loading analytics...', 'info');
        
        const response = await fetch(`${CONFIG_CLOUDFLARE.CLOUDFLARE_WORKER_URL}/analytics`);
        if (!response.ok) {
            throw new Error(`Analytics failed: ${response.statusText}`);
        }
        
        const analytics = await response.json();
        displayAnalyticsDashboard(analytics);
        
    } catch (error) {
        console.error('Analytics error:', error);
        showNotification('Failed to load analytics: ' + error.message, 'error');
    }
}

function displayAnalyticsDashboard(analytics) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.analytics-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'analytics-modal';
    modal.innerHTML = `
        <div class="analytics-content">
            <h2>📊 PropertyAgent Pro Analytics</h2>
            
            <div class="analytics-stats">
                <div class="stat">
                    <h3>${analytics.summary.totalFiles}</h3>
                    <p>Total Files</p>
                </div>
                <div class="stat">
                    <h3>${analytics.summary.totalViews}</h3>
                    <p>Total Views</p>
                </div>
                <div class="stat">
                    <h3>${analytics.summary.totalUniqueViews}</h3>
                    <p>Unique Viewers</p>
                </div>
                <div class="stat">
                    <h3>${Math.round(analytics.summary.averageEngagement)}</h3>
                    <p>Avg Engagement</p>
                </div>
            </div>
            
            <div class="hot-leads">
                <h3>🔥 Hot Leads (High Engagement)</h3>
                ${analytics.hotLeads.length > 0 ? analytics.hotLeads.map(lead => `
                    <div class="hot-lead">
                        <strong>Visitor IP: ${lead.ip}</strong> 
                        <br>
                        <small>Score: ${lead.hotScore} | Files: ${lead.uniqueFiles} | Views: ${lead.totalViews}</small>
                        <br>
                        <small>Countries: ${lead.countries.join(', ')} | Last: ${new Date(lead.lastActivity).toLocaleString()}</small>
                    </div>
                `).join('') : '<p>No hot leads yet - file views will appear here</p>'}
            </div>
            
            <div class="top-files">
                <h3>📈 Top Performing Files</h3>
                ${analytics.topFiles.length > 0 ? analytics.topFiles.map(file => `
                    <div class="top-file">
                        <strong>${file.originalName}</strong>
                        <br>
                        <small>${file.views} views (${file.uniqueViews} unique) | Score: ${Math.round(file.hotLeadScore)}</small>
                    </div>
                `).join('') : '<p>No files tracked yet</p>'}
            </div>
            
            <div class="agent-activity">
                <h3>👨‍💼 Agent Activity</h3>
                ${Object.entries(analytics.agentActivity).map(([agentId, activity]) => `
                    <div class="agent-stat">
                        <strong>${agentId}:</strong> ${activity.files} files, ${activity.views} total views
                    </div>
                `).join('') || '<p>No activity yet</p>'}
            </div>
            
            <button onclick="this.closest('.analytics-modal').remove()" class="close-btn">Close Dashboard</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// NEW: Individual file stats function
async function getFileStats(trackingId) {
    try {
        const response = await fetch(`${CONFIG_CLOUDFLARE.CLOUDFLARE_WORKER_URL}/stats/${trackingId}`);
        if (!response.ok) {
            throw new Error(`Stats failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Stats error:', error);
        return null;
    }
}

// REPLACE: Update the file item display to show tracking info
function updateFilePreviewWithTracking() {
    const filePreview = document.getElementById('filePreview');
    filePreview.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-icon">${getFileIcon(file.type)}</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <div class="cloud-upload-status">
                    ☁️ Uploaded with tracking enabled
                    <button onclick="showFileStats('${file.trackingId}')" class="stats-btn">📊 View Stats</button>
                </div>
            </div>
            <button type="button" class="remove-file" onclick="removeFileCloudflare(${index})" title="Remove file">×</button>
        `;
        filePreview.appendChild(fileItem);
    });
}

async function showFileStats(trackingId) {
    const stats = await getFileStats(trackingId);
    if (!stats) {
        showNotification('Could not load file stats', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'analytics-modal';
    modal.innerHTML = `
        <div class="analytics-content">
            <h2>📄 File Analytics: ${stats.originalName}</h2>
            
            <div class="analytics-stats">
                <div class="stat">
                    <h3>${stats.engagement.totalViews}</h3>
                    <p>Total Views</p>
                </div>
                <div class="stat">
                    <h3>${stats.engagement.uniqueViews}</h3>
                    <p>Unique Viewers</p>
                </div>
                <div class="stat">
                    <h3>${Math.round(stats.engagement.hotLeadScore)}</h3>
                    <p>Lead Score</p>
                </div>
            </div>
            
            <div class="geography">
                <h3>🌍 Geographic Distribution</h3>
                ${stats.geography.map(geo => `
                    <div><strong>${geo.country}:</strong> ${geo.count} views</div>
                `).join('') || '<p>No views yet</p>'}
            </div>
            
            <div class="timeline">
                <h3>📅 View Timeline</h3>
                ${stats.timeline.map(day => `
                    <div><strong>${day.date}:</strong> ${day.views} views</div>
                `).join('') || '<p>No views yet</p>'}
            </div>
            
            <button onclick="this.closest('.analytics-modal').remove()" class="close-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// REPLACE: Remove file function
function removeFileCloudflare(index) {
    uploadedFiles.splice(index, 1);
    updateFilePreviewWithTracking();
    showNotification('File removed', 'info');
}

// NEW: Add analytics button to header
function addAnalyticsButton() {
    const userInfo = document.querySelector('.user-info');
    if (userInfo && !document.querySelector('.analytics-btn')) {
        const analyticsBtn = document.createElement('button');
        analyticsBtn.textContent = '📊 Analytics';
        analyticsBtn.className = 'analytics-btn';
        analyticsBtn.onclick = showFileAnalytics;
        userInfo.insertBefore(analyticsBtn, userInfo.firstChild);
    }
}

// AUTO-INITIALIZATION: Update existing functions when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Replace the Cloudinary widget functionality
    if (typeof openCloudinaryWidget === 'function') {
        window.openCloudinaryWidget = function() {
            document.getElementById('fileInput').click();
        };
        
        // Add file input handler if it doesn't exist
        let fileInput = document.getElementById('fileInput');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'fileInput';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx';
            document.body.appendChild(fileInput);
        }
        
        fileInput.addEventListener('change', async function(event) {
            const files = Array.from(event.target.files);
            for (const file of files) {
                if (validateFileCloudflare(file)) {
                    try {
                        showNotification(`Uploading ${file.name}...`, 'info');
                        const uploadResult = await uploadToCloudflare(file);
                        uploadedFiles.push(uploadResult);
                        updateFilePreviewWithTracking();
                        showNotification(`✅ ${file.name} uploaded with tracking!`, 'success');
                    } catch (error) {
                        showNotification(`❌ Failed to upload ${file.name}: ${error.message}`, 'error');
                    }
                }
            }
            event.target.value = ''; // Reset input
        });
    }
    
    // Add analytics button
    addAnalyticsButton();
    
    // Replace updateFilePreview function
    if (typeof updateFilePreview === 'function') {
        window.updateFilePreview = updateFilePreviewWithTracking;
    }
});

// Export functions for global access
window.uploadToCloudflare = uploadToCloudflare;
window.showFileAnalytics = showFileAnalytics;
window.getFileStats = getFileStats;
window.CONFIG_CLOUDFLARE = CONFIG_CLOUDFLARE;