# Analytics Flow Documentation

## Overview
The TG Quiz Prize Bot now includes a comprehensive analytics system that tracks user interactions, campaign performance, and quiz results. All data is stored in Google Sheets for easy access and analysis.

## Features

### 1. Base64 Encoded Marketing Links
- Campaign IDs are encoded in Base64 format for secure tracking
- Links format: `t.me/tgquizprizebot/app?startapp={base64_encoded_campaign_id}`
- Backward compatibility with plain campaign IDs

### 2. Marketing Attribution Tracking
The system tracks multiple marketing attributes:
- **Campaign ID**: Unique identifier for each marketing campaign
- **Source**: Traffic source (e.g., telegram, facebook, twitter)
- **Medium**: Marketing medium (e.g., social, email, cpc)
- **Term**: Keywords for paid search campaigns
- **Content**: To differentiate similar content/links
- **Referrer**: The referring URL or channel

### 3. User Action Tracking
The analytics system automatically tracks:
- **Session Start**: When a user opens the app
- **Page Views**: Navigation between screens (home, quiz, result)
- **Quiz Start**: When a user begins a quiz
- **Question Answers**: Each answer with correctness tracking
- **Quiz Completion**: Final score and win/loss status
- **Button Clicks**: User interactions with UI elements

### 4. Google Sheets Integration
All analytics data is stored in the Google Sheets document:
- **Spreadsheet ID**: `1RKK7sohIl3vYUvEoESmGNkT54u1kTE-swnGxUjWnBh0`
- **Sheet Name**: `Analytics`
- **Columns**:
  - Timestamp
  - User ID
  - Campaign ID
  - Action
  - Source
  - Medium
  - Referrer
  - Session ID
  - Details (JSON)

## Bot Commands

### `/createcampaign`
Creates a new campaign link with Base64 encoding:
1. Bot asks for campaign ID
2. User provides campaign ID (e.g., "summer2024")
3. Bot generates Base64 encoded link
4. Returns shareable link for distribution

### `/campaigns`
Lists all existing campaign IDs from the database

### `/analytics`
View detailed analytics for a specific campaign:
- Unique users count
- Total sessions
- Quiz starts and completions
- Winners count
- Conversion rate
- Win rate

### `/help`
Shows all available commands and usage instructions

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- Google Service Account credentials
- Access to Google Sheets API

### 2. Environment Configuration
Create a `.env` file with:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
BOT_USERNAME=your_bot_username
API_BASE_URL=http://localhost:3001
GOOGLE_SERVICE_ACCOUNT_FILE=./google-credentials.json
```

### 3. Google Sheets Setup
Run the setup script to create the Analytics sheet:
```bash
npm run setup-analytics
```

This will:
- Create the Analytics sheet if it doesn't exist
- Add proper column headers
- Format the headers with styling

### 4. Installation
```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Or start production server
npm run prod
```

## Usage Examples

### Creating a Campaign Link
1. Send `/createcampaign` to the bot
2. Enter campaign ID: `blackfriday2024`
3. Receive encoded link: `t.me/tgquizprizebot/app?startapp=YmxhY2tmcmlkYXkyMDI0`

### Tracking Custom UTM Parameters
Add UTM parameters to your campaign links:
```
https://yourapp.com?utm_source=facebook&utm_medium=social&utm_campaign=summer2024
```

### Viewing Analytics
1. Send `/analytics` to the bot
2. Enter campaign ID: `blackfriday2024`
3. View detailed statistics:
   - Unique Users: 150
   - Sessions: 200
   - Quiz Starts: 180
   - Quiz Completes: 120
   - Winners: 45
   - Conversion Rate: 67%
   - Win Rate: 38%

## Analytics Data Flow

1. **User Clicks Campaign Link**
   - Link contains Base64 encoded campaign ID
   - User opens Telegram Web App

2. **App Initialization**
   - Decode campaign ID from start_param
   - Initialize analytics service
   - Track session start

3. **User Interaction**
   - Every action is tracked with:
     - User ID (from Telegram)
     - Campaign ID
     - Action type
     - Timestamp
     - Session ID
     - Marketing attributes

4. **Data Storage**
   - Analytics events sent to backend API
   - Data appended to Google Sheets
   - Failed events queued for retry

5. **Analytics Retrieval**
   - Bot command fetches data from Google Sheets
   - Calculates statistics
   - Displays formatted results

## API Endpoints

### `GET /api/campaign-link`
Generates a campaign link with Base64 encoding
- Query params: `campaign_id`
- Returns: `{ url, encodedId, campaignId }`

### `POST /api/analytics/track`
Tracks user actions
- Body: `{ userId, campaignId, action, details, timestamp, sessionId, source, medium, referrer }`
- Returns: `{ success: true }`

### `GET /api/analytics/campaign/:campaignId`
Retrieves analytics data for a campaign
- Returns: Array of analytics events

## Best Practices

1. **Campaign Naming**
   - Use descriptive, unique IDs
   - Include date/season (e.g., summer2024)
   - Avoid special characters

2. **Link Distribution**
   - Always use the encoded campaign link
   - Add UTM parameters for detailed tracking
   - Test links before mass distribution

3. **Data Analysis**
   - Regular monitoring of campaign performance
   - Compare conversion rates across campaigns
   - Identify drop-off points in user journey

4. **Privacy Considerations**
   - User IDs are from Telegram (anonymous if not available)
   - No personal information is stored
   - Data retention policies should be defined

## Troubleshooting

### Analytics Not Tracking
1. Check Google Sheets permissions
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Ensure campaign ID is properly encoded

### Missing Campaign Data
1. Verify users are using the correct link
2. Check if Analytics sheet exists
3. Review API logs for errors

### Google Sheets API Errors
1. Verify service account credentials
2. Check spreadsheet permissions
3. Ensure API is enabled in Google Cloud Console

## Future Enhancements

- Real-time analytics dashboard
- A/B testing support
- Custom event tracking
- Export analytics to CSV
- Automated reports via bot
- Integration with Google Analytics
- Funnel visualization
- Cohort analysis

## Support

For issues or questions:
1. Check bot logs for errors
2. Review Google Sheets for data
3. Use `/help` command for guidance
4. Contact technical support