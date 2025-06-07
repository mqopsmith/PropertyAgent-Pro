import Head from 'next/head'

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>PropertyAgent Pro - Enhanced Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://widget.cloudinary.com/v2.0/global/all.js" />
      </Head>
      
      <div>
        <style jsx>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
          }

          .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            padding: 1rem 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }

          .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .user-info {
            color: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .status-indicator {
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(46, 204, 113, 0.2);
            color: #27ae60;
            border: 1px solid rgba(46, 204, 113, 0.3);
          }

          .container {
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 2rem;
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .main-panel {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .property-input-section {
            margin-bottom: 2rem;
          }

          .property-input {
            width: 100%;
            min-height: 120px;
            padding: 1.5rem;
            border: 2px solid #e8f2ff;
            border-radius: 12px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s ease;
            resize: vertical;
            font-family: inherit;
          }

          .property-input:focus {
            border-color: #667eea;
          }

          .property-input::placeholder {
            color: #888;
            line-height: 1.5;
          }

          .file-upload-section {
            margin: 1.5rem 0;
          }

          .upload-area {
            border: 3px dashed #ddd;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            transition: all 0.3s ease;
            background: #f8f9fa;
            margin-bottom: 20px;
            cursor: pointer;
          }

          .upload-area:hover {
            border-color: #667eea;
            background: #e3f2fd;
            transform: scale(1.02);
          }

          .upload-icon {
            width: 60px;
            height: 60px;
            background: #667eea;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
          }

          .upload-text {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 15px;
          }

          .upload-btn {
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .upload-btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
          }

          .file-preview {
            margin-top: 20px;
          }

          .file-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            margin-bottom: 10px;
          }

          .file-icon {
            width: 40px;
            height: 40px;
            background: #4CAF50;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          }

          .file-info {
            flex: 1;
          }

          .file-name {
            font-weight: 500;
            color: #333;
          }

          .file-size {
            font-size: 0.9rem;
            color: #666;
          }

          .remove-file {
            background: #f44336;
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
          }

          .cloud-upload-status {
            background: #e8f5e8;
            color: #2e7d32;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            margin-top: 5px;
          }

          .action-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }

          .btn {
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          }

          .btn-secondary {
            background: #6c757d;
            color: white;
          }

          .btn:disabled {
            background: #95a5a6;
            cursor: not-allowed;
            transform: none;
          }

          .matches-section {
            display: none;
            margin-top: 2rem;
          }

          .matches-summary {
            background: #f8f9ff;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-left: 4px solid #667eea;
          }

          .matches-grid {
            display: grid;
            gap: 1.5rem;
          }

          .lead-match-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 2px solid #e8f2ff;
            transition: all 0.3s ease;
          }

          .lead-match-card:hover {
            border-color: #667eea;
            transform: translateY(-2px);
          }

          .lead-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .lead-info h3 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
          }

          .lead-details {
            color: #666;
            font-size: 0.9rem;
          }

          .match-score {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .score-badge {
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
          }

          .score-hot { background: #ffebee; color: #c62828; }
          .score-warm { background: #fff3e0; color: #ef6c00; }
          .score-cold { background: #e3f2fd; color: #1565c0; }

          .generated-message {
            background: #f8f9ff;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            border-left: 3px solid #667eea;
            position: relative;
          }

          .message-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }

          .btn-success {
            background: #27ae60;
            color: white;
          }

          .btn-success:hover {
            background: #219a52;
          }

          .btn-edit {
            background: #f39c12;
            color: white;
          }

          .btn-edit:hover {
            background: #d68910;
          }

          .message-editor {
            display: none;
            margin-top: 1rem;
          }

          .message-textarea {
            width: 100%;
            min-height: 100px;
            padding: 1rem;
            border: 2px solid #e8f2ff;
            border-radius: 8px;
            font-size: 0.9rem;
            outline: none;
            resize: vertical;
            font-family: inherit;
          }

          .message-textarea:focus {
            border-color: #667eea;
          }

          .spinner {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 0.5rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
          }

          .notification.show {
            transform: translateX(0);
          }

          .notification.success { background: #27ae60; }
          .notification.error { background: #e74c3c; }
          .notification.info { background: #3498db; }

          .example-prompts {
            margin-top: 1rem;
            padding: 1rem;
            background: #f8f9ff;
            border-radius: 8px;
            border-left: 3px solid #667eea;
          }

          .example-prompts h4 {
            color: #667eea;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }

          .example-list {
            font-size: 0.85rem;
            color: #666;
            line-height: 1.6;
          }

          @media (max-width: 768px) {
            .container {
              padding: 0 1rem;
            }
            
            .action-buttons {
              flex-direction: column;
            }
            
            .lead-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }

            .upload-area {
              padding: 30px 20px;
            }
          }
        `}</style>

        <div className="header">
          <div className="header-content">
            <div className="logo">
              🏠 PropertyAgent Pro
            </div>
            <div className="user-info">
              <div className="status-indicator" id="statusIndicator">⚡ System Online</div>
              <span>Sarah Lim - ERA Singapore</span>
              <div style={{width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600'}}>SL</div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="main-panel">
            <div className="property-input-section">
              <h2 className="section-title">✏️ Create Your Message</h2>
              <textarea 
                className="property-input" 
                id="messageInput" 
                placeholder={`Write your message here... This could be:

• Property Listing: 'New Marina Bay luxury condo - 3BR/2BA, $2.3M, stunning bay views, immediate occupancy'

• Market Update: 'Weekly Singapore property market update: CBD condo prices up 8% this quarter, new launches showing strong demand...'

• Newsletter: 'Investment opportunities in emerging districts, rental yields holding steady at 3-4%...'

• General Content: Any property-related message you want to share with relevant leads`}
              />
              
              <div className="file-upload-section">
                <label><strong>📎 Attachments (Optional)</strong></label>
                <div className="upload-area" id="uploadArea" onClick={() => openCloudinaryWidget()}>
                  <div className="upload-icon">☁️</div>
                  <div className="upload-text">
                    Click to upload files to cloud storage<br />
                    <small>Images, PDFs, Brochures, Market Reports (Max 25MB each)</small>
                  </div>
                  <button type="button" className="upload-btn" onClick={() => openCloudinaryWidget()}>
                    📁 Upload to Cloud
                  </button>
                </div>
                <div id="filePreview" className="file-preview"></div>
              </div>
              
              <div className="action-buttons">
                <button className="btn btn-primary" id="findMatchesBtn" onClick={() => findMatchingLeads()}>
                  🔍 Find Relevant Leads
                </button>
                <button className="btn btn-secondary" onClick={() => clearInput()}>
                  🗑️ Clear All
                </button>
              </div>

              <div className="example-prompts">
                <h4>💡 Enhanced Capabilities:</h4>
                <div className="example-list">
                  • <strong>Cloud Storage:</strong> Files uploaded to professional cloud hosting<br />
                  • <strong>Auto-Optimization:</strong> Images automatically optimized for fast loading<br />
                  • <strong>Smart Ranking:</strong> AI analyzes content and ranks all leads by relevance<br />
                  • <strong>File Tracking:</strong> Know which leads engage with your attachments
                </div>
              </div>
            </div>

            <div className="matches-section" id="matchesSection">
              <h2 className="section-title">🎯 All Leads (Ranked by Relevance)</h2>
              
              <div className="matches-summary" id="matchesSummary">
              </div>

              <div className="matches-grid" id="matchesGrid">
              </div>
            </div>
          </div>
        </div>

        <div id="notification" className="notification"></div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // Your existing JavaScript code here (truncated for brevity)
            // This includes all the functions from your HTML file
            let uploadedFiles = [];
            let isProcessing = false;
            let currentMatches = [];

            const CONFIG = {
              N8N_BASE_URL: 'https://n8n.opsmith.biz/webhook',
              AGENT_ID: 'sarah-lim-001',
              CLOUDINARY_CLOUD_NAME: 'dvgfjpjot',
              CLOUDINARY_UPLOAD_PRESET: 'property-agent-files'
            };

            const ENDPOINTS = {
              MATCH_LEADS: CONFIG.N8N_BASE_URL + '/match-leads',
              SEND_MESSAGE: CONFIG.N8N_BASE_URL + '/send-message'
            };

            let cloudinaryWidget;

            function initializeCloudinaryWidget() {
              cloudinaryWidget = cloudinary.createUploadWidget({
                cloudName: CONFIG.CLOUDINARY_CLOUD_NAME,
                uploadPreset: CONFIG.CLOUDINARY_UPLOAD_PRESET,
                folder: 'property-agent-pro/session-' + Date.now(),
                resourceType: 'auto',
                maxFileSize: 25000000,
                sources: ['local', 'url', 'camera'],
                multiple: true,
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
                maxFiles: 10,
                cropping: false,
                showAdvancedOptions: false,
                showUploadMoreButton: false,
                theme: 'minimal'
              }, (error, result) => {
                if (!error && result && result.event === "success") {
                  handleCloudinaryUpload(result.info);
                }
                
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  showNotification('Upload failed: ' + error.message, 'error');
                }
              });
            }

            function openCloudinaryWidget() {
              if (!cloudinaryWidget) {
                initializeCloudinaryWidget();
              }
              cloudinaryWidget.open();
            }

            function handleCloudinaryUpload(uploadInfo) {
              const fileData = {
                name: uploadInfo.original_filename + '.' + uploadInfo.format,
                type: uploadInfo.resource_type,
                size: uploadInfo.bytes,
                cloudinaryUrl: uploadInfo.secure_url,
                publicId: uploadInfo.public_id,
                format: uploadInfo.format,
                uploadedAt: new Date().toISOString()
              };
              
              uploadedFiles.push(fileData);
              updateFilePreview();
              
              console.log('File uploaded to Cloudinary:', fileData);
              showNotification('✅ ' + fileData.name + ' uploaded successfully!', 'success');
            }

            function updateFilePreview() {
              const filePreview = document.getElementById('filePreview');
              filePreview.innerHTML = '';
              
              uploadedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = 
                  '<div class="file-icon">' + getFileIcon(file.type) + '</div>' +
                  '<div class="file-info">' +
                    '<div class="file-name">' + file.name + '</div>' +
                    '<div class="file-size">' + formatFileSize(file.size) + '</div>' +
                    '<div class="cloud-upload-status">☁️ Uploaded to cloud storage</div>' +
                  '</div>' +
                  '<button type="button" class="remove-file" onclick="removeFile(' + index + ')" title="Remove file">×</button>';
                filePreview.appendChild(fileItem);
              });
            }

            function removeFile(index) {
              uploadedFiles.splice(index, 1);
              updateFilePreview();
              showNotification('File removed', 'info');
            }

            function getFileIcon(fileType) {
              if (fileType === 'image') return '🖼️';
              if (fileType === 'raw') return '📄';
              if (fileType === 'video') return '🎥';
              return '📁';
            }

            function formatFileSize(bytes) {
              if (bytes === 0) return '0 Bytes';
              const k = 1024;
              const sizes = ['Bytes', 'KB', 'MB', 'GB'];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            function showNotification(message, type) {
              const notification = document.getElementById('notification');
              notification.textContent = message;
              notification.className = 'notification ' + (type || 'info');
              notification.classList.add('show');
              
              setTimeout(function() {
                notification.classList.remove('show');
              }, 4000);
            }

            function clearInput() {
              document.getElementById('messageInput').value = '';
              document.getElementById('matchesSection').style.display = 'none';
              uploadedFiles = [];
              updateFilePreview();
              currentMatches = [];
            }

            // Add other functions as needed
            async function findMatchingLeads() {
              // Implementation here
            }

            document.addEventListener('DOMContentLoaded', function() {
              initializeCloudinaryWidget();
            });
          `
        }} />
      </div>
    </>
  )
}
