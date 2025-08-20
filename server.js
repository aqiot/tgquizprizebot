const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for Docker environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? false  // In production, served from same origin
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Google Sheets configuration
const QUIZ_SPREADSHEET_ID = '1RKK7sohIl3vYUvEoESmGNkT54u1kTE-swnGxUjWnBh0';
const CAMPAIGN_SPREADSHEET_ID = '1YxRImYKl_i3aeikfkIvhwwQxaTbej_j0mkLbNLqOrnc';

// Load Google Service Account credentials
function loadGoogleCredentials() {
  try {
    // First, try to load from file path specified in environment variable
    const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE || 
                           process.env.GOOGLE_APPLICATION_CREDENTIALS ||
                           './google-credentials.json';
    
    if (fs.existsSync(credentialsPath)) {
      console.log(`Loading Google credentials from file: ${credentialsPath}`);
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      return credentials;
    }
    
    // If file doesn't exist, try to parse from environment variable (for Docker/CI environments)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      console.log('Loading Google credentials from GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    }
    
    // Fallback to individual environment variables (backward compatibility)
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
    
    throw new Error('No Google Service Account credentials found. Please provide credentials via file or environment variables.');
  } catch (error) {
    console.error('Error loading Google credentials:', error.message);
    throw error;
  }
}

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  try {
    const credentials = loadGoogleCredentials();
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    throw error;
  }
}

// API Routes

// Get all published quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: QUIZ_SPREADSHEET_ID,
      range: 'questions!A:O'
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.json([]);
    }

    const headers = rows[0];
    const quizData = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    // Group by quizID and filter published quizzes
    const quizMap = new Map();
    quizData.forEach(row => {
      if (row.published && row.published.toLowerCase() === 'true') {
        if (!quizMap.has(row.quizID)) {
          quizMap.set(row.quizID, {
            quizID: row.quizID,
            quizName: row.quizName,
            quizNameRU: row.quizNameRU,
            questions: []
          });
        }
        quizMap.get(row.quizID).questions.push({
          questionID: parseInt(row.questionID),
          question: row.question,
          questionRU: row.questionRU,
          answer1: row.answer1,
          answer1RU: row.answer1RU,
          answer2: row.answer2,
          answer2RU: row.answer2RU,
          answer3: row.answer3,
          answer3RU: row.answer3RU,
          correctAnswer: parseInt(row.correctAnswer)
        });
      }
    });

    // Sort questions by questionID
    const quizzes = Array.from(quizMap.values()).map(quiz => {
      quiz.questions.sort((a, b) => a.questionID - b.questionID);
      return quiz;
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get a specific quiz by ID
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: QUIZ_SPREADSHEET_ID,
      range: 'questions!A:O'
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const headers = rows[0];
    const quizData = rows.slice(1)
      .map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      })
      .filter(row => row.quizID === req.params.id && row.published && row.published.toLowerCase() === 'true');

    if (quizData.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = {
      quizID: quizData[0].quizID,
      quizName: quizData[0].quizName,
      quizNameRU: quizData[0].quizNameRU,
      questions: quizData.map(row => ({
        questionID: parseInt(row.questionID),
        question: row.question,
        questionRU: row.questionRU,
        answer1: row.answer1,
        answer1RU: row.answer1RU,
        answer2: row.answer2,
        answer2RU: row.answer2RU,
        answer3: row.answer3,
        answer3RU: row.answer3RU,
        correctAnswer: parseInt(row.correctAnswer)
      }))
    };

    quiz.questions.sort((a, b) => a.questionID - b.questionID);
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Log quiz result
app.post('/api/result', async (req, res) => {
  try {
    const { tgID, quizID, questionsAnswered } = req.body;
    
    if (!tgID || !quizID || questionsAnswered === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sheets = await getGoogleSheetsClient();
    const timestamp = new Date().toISOString();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: QUIZ_SPREADSHEET_ID,
      range: 'Results!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[tgID, quizID, questionsAnswered, timestamp]]
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging result:', error);
    res.status(500).json({ error: 'Failed to log result' });
  }
});

// Get campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CAMPAIGN_SPREADSHEET_ID,
      range: 'Campaigns!A:A'
    });

    const rows = response.data.values || [];
    const campaigns = rows.slice(1).map(row => ({ campaign_id: row[0] }));
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Generate campaign link
app.get('/api/campaign-link', (req, res) => {
  const { campaign_id } = req.query;
  
  if (!campaign_id) {
    return res.status(400).json({ error: 'campaign_id is required' });
  }

  // Use campaign_id directly in the URL without encoding
  const url = `t.me/tgquizprizebot/app?startapp=${campaign_id}`;
  
  res.json({ url });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Verify credentials are loaded on startup
  try {
    loadGoogleCredentials();
    console.log('Google credentials loaded successfully');
  } catch (error) {
    console.error('Warning: Google credentials not loaded:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});