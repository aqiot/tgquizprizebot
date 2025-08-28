const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Test data
const testCampaignId = 'test_campaign_' + Date.now();
const testUserId = 'test_user_123';
const testSessionId = 'session_' + Date.now();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

async function testAnalyticsFlow() {
  log('\n🧪 Starting Analytics Flow Test...', colors.bright);
  log('================================\n', colors.cyan);

  try {
    // Test 1: Generate Campaign Link
    log('📝 Test 1: Generate Campaign Link', colors.yellow);
    const linkResponse = await axios.get(`${API_BASE_URL}/api/campaign-link`, {
      params: { campaign_id: testCampaignId }
    });
    
    if (linkResponse.data.url && linkResponse.data.encodedId) {
      log('✅ Campaign link generated successfully', colors.green);
      log(`   Campaign ID: ${testCampaignId}`, colors.reset);
      log(`   Encoded ID: ${linkResponse.data.encodedId}`, colors.reset);
      log(`   URL: ${linkResponse.data.url}\n`, colors.reset);
      
      // Verify Base64 encoding
      const decoded = Buffer.from(linkResponse.data.encodedId, 'base64').toString('utf-8');
      if (decoded === testCampaignId) {
        log('✅ Base64 encoding verified', colors.green);
      } else {
        log('❌ Base64 encoding mismatch', colors.red);
      }
    } else {
      log('❌ Failed to generate campaign link', colors.red);
      return;
    }

    // Test 2: Track Session Start
    log('\n📝 Test 2: Track Session Start', colors.yellow);
    const sessionStartResponse = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
      userId: testUserId,
      campaignId: testCampaignId,
      action: 'session_start',
      timestamp: new Date().toISOString(),
      sessionId: testSessionId,
      source: 'test',
      medium: 'automated',
      details: {
        userAgent: 'Test Script',
        language: 'en-US'
      }
    });

    if (sessionStartResponse.data.success) {
      log('✅ Session start tracked', colors.green);
    } else {
      log('❌ Failed to track session start', colors.red);
    }

    // Test 3: Track Page View
    log('\n📝 Test 3: Track Page View', colors.yellow);
    const pageViewResponse = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
      userId: testUserId,
      campaignId: testCampaignId,
      action: 'page_view',
      timestamp: new Date().toISOString(),
      sessionId: testSessionId,
      source: 'test',
      medium: 'automated',
      details: {
        page: 'home'
      }
    });

    if (pageViewResponse.data.success) {
      log('✅ Page view tracked', colors.green);
    } else {
      log('❌ Failed to track page view', colors.red);
    }

    // Test 4: Track Quiz Start
    log('\n📝 Test 4: Track Quiz Start', colors.yellow);
    const quizStartResponse = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
      userId: testUserId,
      campaignId: testCampaignId,
      action: 'quiz_start',
      timestamp: new Date().toISOString(),
      sessionId: testSessionId,
      source: 'test',
      medium: 'automated',
      details: {
        quizId: 'test_quiz_1',
        quizName: 'Test Quiz'
      }
    });

    if (quizStartResponse.data.success) {
      log('✅ Quiz start tracked', colors.green);
    } else {
      log('❌ Failed to track quiz start', colors.red);
    }

    // Test 5: Track Quiz Questions
    log('\n📝 Test 5: Track Quiz Questions', colors.yellow);
    for (let i = 1; i <= 6; i++) {
      const isCorrect = Math.random() > 0.5;
      const questionResponse = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
        userId: testUserId,
        campaignId: testCampaignId,
        action: 'quiz_question_answered',
        timestamp: new Date().toISOString(),
        sessionId: testSessionId,
        source: 'test',
        medium: 'automated',
        details: {
          quizId: 'test_quiz_1',
          questionId: i,
          answer: Math.floor(Math.random() * 3) + 1,
          isCorrect: isCorrect
        }
      });

      if (questionResponse.data.success) {
        log(`   ✅ Question ${i} tracked (${isCorrect ? 'correct' : 'incorrect'})`, colors.green);
      } else {
        log(`   ❌ Failed to track question ${i}`, colors.red);
      }
    }

    // Test 6: Track Quiz Complete
    log('\n📝 Test 6: Track Quiz Complete', colors.yellow);
    const score = Math.floor(Math.random() * 7);
    const quizCompleteResponse = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
      userId: testUserId,
      campaignId: testCampaignId,
      action: 'quiz_complete',
      timestamp: new Date().toISOString(),
      sessionId: testSessionId,
      source: 'test',
      medium: 'automated',
      details: {
        quizId: 'test_quiz_1',
        score: score,
        total: 6,
        percentage: Math.round((score / 6) * 100)
      }
    });

    if (quizCompleteResponse.data.success) {
      log(`✅ Quiz complete tracked (Score: ${score}/6)`, colors.green);
    } else {
      log('❌ Failed to track quiz complete', colors.red);
    }

    // Test 7: Track Winner/Loser
    log('\n📝 Test 7: Track Result Status', colors.yellow);
    const isWinner = score >= 4;
    const resultResponse = await axios.post(`${API_BASE_URL}/api/analytics/track`, {
      userId: testUserId,
      campaignId: testCampaignId,
      action: isWinner ? 'quiz_winner' : 'quiz_not_winner',
      timestamp: new Date().toISOString(),
      sessionId: testSessionId,
      source: 'test',
      medium: 'automated',
      details: {
        quizId: 'test_quiz_1',
        score: score,
        campaignId: testCampaignId
      }
    });

    if (resultResponse.data.success) {
      log(`✅ Result status tracked (${isWinner ? 'Winner' : 'Not Winner'})`, colors.green);
    } else {
      log('❌ Failed to track result status', colors.red);
    }

    // Test 8: Retrieve Analytics Data
    log('\n📝 Test 8: Retrieve Analytics Data', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for data to be written
    
    const analyticsResponse = await axios.get(`${API_BASE_URL}/api/analytics/campaign/${testCampaignId}`);
    
    if (analyticsResponse.data.analytics && analyticsResponse.data.analytics.length > 0) {
      const analytics = analyticsResponse.data.analytics;
      log(`✅ Analytics data retrieved: ${analytics.length} events`, colors.green);
      
      // Verify all expected events are present
      const expectedActions = [
        'session_start',
        'page_view',
        'quiz_start',
        'quiz_question_answered',
        'quiz_complete',
        isWinner ? 'quiz_winner' : 'quiz_not_winner'
      ];
      
      const trackedActions = [...new Set(analytics.map(a => a.action))];
      log('\n   Tracked actions:', colors.cyan);
      trackedActions.forEach(action => {
        log(`   - ${action}`, colors.reset);
      });
      
      const missingActions = expectedActions.filter(action => 
        !trackedActions.includes(action)
      );
      
      if (missingActions.length === 0) {
        log('\n✅ All expected actions tracked successfully!', colors.green);
      } else {
        log(`\n⚠️  Missing actions: ${missingActions.join(', ')}`, colors.yellow);
      }
    } else {
      log('❌ No analytics data retrieved', colors.red);
    }

    // Summary
    log('\n================================', colors.cyan);
    log('📊 Test Summary', colors.bright);
    log('================================', colors.cyan);
    log(`Campaign ID: ${testCampaignId}`, colors.reset);
    log(`User ID: ${testUserId}`, colors.reset);
    log(`Session ID: ${testSessionId}`, colors.reset);
    log('\n✅ Analytics flow test completed successfully!', colors.green);
    log('\n📈 View your test data in Google Sheets:', colors.cyan);
    log(`https://docs.google.com/spreadsheets/d/1RKK7sohIl3vYUvEoESmGNkT54u1kTE-swnGxUjWnBh0/edit#gid=0`, colors.blue);

  } catch (error) {
    log('\n❌ Test failed with error:', colors.red);
    log(error.message, colors.red);
    if (error.response) {
      log(`Response status: ${error.response.status}`, colors.red);
      log(`Response data: ${JSON.stringify(error.response.data)}`, colors.red);
    }
    process.exit(1);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    log('🔍 Checking server health...', colors.cyan);
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    if (response.data.status === 'healthy') {
      log('✅ Server is healthy\n', colors.green);
      return true;
    }
  } catch (error) {
    log('❌ Server is not responding. Please start the server with: npm run server', colors.red);
    process.exit(1);
  }
}

// Run tests
async function runTests() {
  await checkServerHealth();
  await testAnalyticsFlow();
}

runTests();