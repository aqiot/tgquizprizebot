const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const ANALYTICS_SPREADSHEET_ID = '1RKK7sohIl3vYUvEoESmGNkT54u1kTE-swnGxUjWnBh0';

// Load Google Service Account credentials
function loadGoogleCredentials() {
  try {
    const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE || 
                           process.env.GOOGLE_APPLICATION_CREDENTIALS ||
                           './google-credentials.json';
    
    if (fs.existsSync(credentialsPath)) {
      console.log(`Loading Google credentials from file: ${credentialsPath}`);
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      return credentials;
    }
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      console.log('Loading Google credentials from GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    }
    
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      console.log('Loading Google credentials from individual environment variables');
      return {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
      };
    }
    
    throw new Error('No Google Service Account credentials found.');
  } catch (error) {
    console.error('Error loading Google credentials:', error.message);
    throw error;
  }
}

async function setupAnalyticsSheet() {
  try {
    console.log('Setting up Analytics sheet...');
    
    const credentials = loadGoogleCredentials();
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    // Check if Analytics sheet exists
    console.log('Checking if Analytics sheet exists...');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: ANALYTICS_SPREADSHEET_ID,
      fields: 'sheets.properties.title'
    });
    
    const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    const analyticsSheetExists = sheetNames.includes('Analytics');
    
    if (!analyticsSheetExists) {
      console.log('Creating Analytics sheet...');
      
      // Add new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: ANALYTICS_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Analytics',
                  gridProperties: {
                    rowCount: 10000,
                    columnCount: 10
                  }
                }
              }
            }
          ]
        }
      });
      
      console.log('Analytics sheet created successfully!');
    } else {
      console.log('Analytics sheet already exists.');
    }
    
    // Add headers if the sheet is empty
    console.log('Checking for headers...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ANALYTICS_SPREADSHEET_ID,
      range: 'Analytics!A1:I1'
    });
    
    if (!response.data.values || response.data.values.length === 0) {
      console.log('Adding headers to Analytics sheet...');
      
      const headers = [
        ['Timestamp', 'User ID', 'Campaign ID', 'Action', 'Source', 'Medium', 'Referrer', 'Session ID', 'Details']
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: ANALYTICS_SPREADSHEET_ID,
        range: 'Analytics!A1:I1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: headers
        }
      });
      
      // Format headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: ANALYTICS_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: spreadsheet.data.sheets.find(s => s.properties.title === 'Analytics')?.properties.sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.2,
                      green: 0.6,
                      blue: 0.86
                    },
                    textFormat: {
                      foregroundColor: {
                        red: 1,
                        green: 1,
                        blue: 1
                      },
                      fontSize: 11,
                      bold: true
                    }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
              }
            }
          ]
        }
      });
      
      console.log('Headers added successfully!');
    } else {
      console.log('Headers already exist.');
    }
    
    console.log('\n✅ Analytics sheet setup complete!');
    console.log(`📊 View your analytics data at: https://docs.google.com/spreadsheets/d/${ANALYTICS_SPREADSHEET_ID}/edit#gid=0`);
    
  } catch (error) {
    console.error('Error setting up Analytics sheet:', error.message);
    process.exit(1);
  }
}

// Run setup
setupAnalyticsSheet();