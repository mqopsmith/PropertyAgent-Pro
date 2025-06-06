# n8n Workflow - GitHub Enhanced Version

## 🔄 **Updated Workflow Structure**

Your existing workflow: `JZyxsw92c05GIOqB` needs these additions:

### **Add These 2 New Nodes:**

#### 1. **Fetch Agent Config** (HTTP Request Node)
- **Position**: After Webhook Trigger
- **URL**: `https://raw.githubusercontent.com/mqopsmith/PropertyAgent-Pro/main/configs/agent-settings.json`
- **Method**: GET
- **Response Format**: JSON
- **Node Name**: `Fetch Agent Config`

#### 2. **Fetch Template** (HTTP Request Node)  
- **Position**: Parallel to Fetch Agent Config
- **URL**: `https://raw.githubusercontent.com/mqopsmith/PropertyAgent-Pro/main/templates/commercial.txt`
- **Method**: GET
- **Response Format**: Text
- **Node Name**: `Fetch Template`

### **Update Existing Nodes:**

#### 3. **Update "Read Leads from Sheet" Node**
Change the Google Sheet ID from hardcoded to:
```
={{ $('Fetch Agent Config').first().json.googleSheetId }}
```

#### 4. **Update "AI Lead Segmentation" Code Node**
Replace the existing code with:

```javascript
// Enhanced AI analysis using GitHub configs
const config = $('Fetch Agent Config').first().json;
const leads = $input.all();

// Use GitHub settings for AI analysis
const aiSettings = config.aiSettings;

function analyzeLeads(leads) {
  return leads.map(item => {
    const lead = item.json;
    const notes = (lead.notes || '').toLowerCase();
    
    // AI scoring using GitHub config keywords
    let leadScore = 'Warm';
    let urgency = 'Medium';
    let insights = '';
    
    // Check urgency keywords from GitHub config
    if (aiSettings.urgencyKeywords.some(keyword => notes.includes(keyword))) {
      urgency = 'High';
      leadScore = 'Hot';
      insights = 'Time-sensitive buyer - prioritize immediate contact';
    }
    
    // Check budget keywords from GitHub config
    if (aiSettings.budgetKeywords.some(keyword => notes.includes(keyword))) {
      leadScore = 'Hot';
      insights = insights || 'Budget confirmed - serious buyer prospect';
    }
    
    // Check hot lead indicators from GitHub config
    if (aiSettings.hotLeadIndicators.some(indicator => notes.includes(indicator))) {
      leadScore = 'Hot';
      urgency = 'High';
      insights = insights || 'Qualified buyer - immediate follow-up required';
    }
    
    // Property type analysis (same as before)
    const propertyType = (lead.propertyType || '').toLowerCase();
    if (propertyType.includes('commercial')) {
      insights = insights || 'Commercial investor - focus on ROI and location benefits';
    } else if (propertyType.includes('condo')) {
      insights = insights || 'Residential buyer - emphasize lifestyle and amenities';
    }
    
    return {
      json: {
        ...lead,
        aiAnalysis: {
          leadScore,
          urgency,
          insights: insights || 'Standard follow-up recommended',
          confidence: 0.85
        }
      }
    };
  });
}

return analyzeLeads(leads);
```

#### 5. **Update "Generate Personalized Messages" Code Node**
Replace the existing code with:

```javascript
// Get GitHub configs and template
const config = $('Fetch Agent Config').first().json;
const template = $('Fetch Template').first().json;
const leads = $input.all();

// Process each lead with GitHub template
const processedLeads = leads.map(item => {
  const lead = item.json;
  const analysis = lead.aiAnalysis;
  
  // Personalize message using GitHub template
  const personalizedMessage = template
    .replace(/{{name}}/g, lead.name || 'there')
    .replace(/{{propertyType}}/g, lead.propertyType || 'property')
    .replace(/{{insights}}/g, analysis.insights || 'Great potential for your portfolio')
    .replace(/{{agentName}}/g, config.agentName)
    .replace(/{{agentPhone}}/g, config.agentPhone);
  
  // Clean phone and create WhatsApp URL
  const cleanPhone = (lead.phone || '').replace(/[\\s\\-\\(\\)]/g, '');
  const encodedMessage = encodeURIComponent(personalizedMessage);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  return {
    json: {
      ...lead,
      personalizedMessage,
      whatsappUrl,
      cleanPhone,
      templateUsed: config.defaultTemplate,
      processedAt: new Date().toISOString()
    }
  };
});

return processedLeads;
```

### **Updated Workflow Flow:**
```
Webhook Trigger 
    ↓
Fetch Agent Config (GitHub) ──┐
    ↓                         │
Fetch Template (GitHub) ──────┤
    ↓                         │
Read Leads from Sheet ←───────┘
    ↓
AI Lead Segmentation (Enhanced)
    ↓  
Generate Messages (GitHub Template)
    ↓
Update Leads in Sheet
    ↓
Return Dashboard Data
```

## ✅ **What This Achieves:**

### **Before GitHub Integration:**
- Templates hardcoded in n8n workflow
- Agent info hardcoded 
- AI keywords hardcoded
- Hard to change without editing workflow

### **After GitHub Integration:**
- Templates stored in GitHub (easy editing)
- Agent config in GitHub (version controlled)
- AI settings configurable via GitHub
- Zero workflow editing needed for updates

## 🔧 **Setup Steps:**

1. **Add the 2 HTTP Request nodes** to your workflow
2. **Update the 3 existing code sections** as shown above
3. **Update the Google Sheets node** to use GitHub config
4. **Test with one lead** to ensure it works
5. **Edit templates on GitHub** to see instant changes!

## 💡 **Key Benefits:**

- **Edit templates without touching n8n** ✅
- **Version control all changes** ✅  
- **Easy multi-agent scaling** ✅
- **Professional configuration management** ✅

**Total setup time: 15 minutes**
**Maintenance required: Zero**
