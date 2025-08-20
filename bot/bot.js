const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// API configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const BOT_USERNAME = process.env.BOT_USERNAME || 'tgquizprizebot';

// Store user states for conversation flow
const userStates = new Map();

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userLanguage = msg.from.language_code;
  
  // Determine if user locale is Russian
  const isRussian = userLanguage && userLanguage.toLowerCase().startsWith('ru');
  
  // Localized welcome messages
  const welcomeMessage = isRussian 
    ? "Привет! Добро пожаловать в Квизы с призами. Проходи квизы каждую неделю и участвуй в розыгрышах. Скорее начинай!"
    : "Hey, welcome to Quizzes with Prizes. Complete the quizzes every week and participate in the Giveaways. Open app to start";
  
  const buttonText = isRussian ? "🎮 Открыть приложение" : "🎮 Open App";
  
  bot.sendMessage(chatId, 
    welcomeMessage,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: buttonText, url: 't.me/tgquizprizebot/app' }
          ]
        ]
      }
    }
  );
});

// Command: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId,
    `📚 <b>Help & Commands</b>\n\n` +
    `<b>/createcampaign</b>\n` +
    `Create a unique campaign link for your quiz. Just provide a campaign ID and get a shareable link.\n\n` +
    `<b>/campaigns</b>\n` +
    `View all existing campaign IDs from the database.\n\n` +
    `<b>/start</b>\n` +
    `Show the welcome message and open the quiz app.\n\n` +
    `<b>How campaigns work:</b>\n` +
    `1. Create a campaign with a unique ID\n` +
    `2. Share the generated link with participants\n` +
    `3. Track results by campaign ID in your dashboard\n\n` +
    `Need more help? Contact support!`,
    { parse_mode: 'HTML' }
  );
});

// Command: /createcampaign
bot.onText(/\/createcampaign/, (msg) => {
  const chatId = msg.chat.id;
  
  // Set user state to waiting for campaign ID
  userStates.set(chatId, { command: 'createcampaign', step: 'waiting_for_id' });
  
  bot.sendMessage(chatId,
    `🎯 <b>Create Campaign Link</b>\n\n` +
    `Please enter your campaign ID (e.g., <code>summer2024</code>, <code>blackfriday</code>, etc.):\n\n` +
    `<i>The campaign ID should be unique and memorable.</i>`,
    { 
      parse_mode: 'HTML'
    }
  );
});

// Command: /campaigns
bot.onText(/\/campaigns/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Show loading message
    const loadingMsg = await bot.sendMessage(chatId, '⏳ Loading campaigns...');
    
    // Fetch campaigns from API
    const response = await axios.get(`${API_BASE_URL}/api/campaigns`, {
      timeout: 10000
    });
    
    // Delete loading message
    await bot.deleteMessage(chatId, loadingMsg.message_id);
    
    if (response.data && response.data.campaigns && response.data.campaigns.length > 0) {
      const campaignsList = response.data.campaigns
        .map((campaign, index) => `${index + 1}. <code>${campaign}</code>`)
        .join('\n');
      
      bot.sendMessage(chatId,
        `📊 <b>Existing Campaigns</b>\n\n` +
        `Found ${response.data.campaigns.length} campaign(s):\n\n` +
        campaignsList + '\n\n' +
        `<i>Use /createcampaign to create a new campaign link for any of these IDs.</i>`,
        { parse_mode: 'HTML' }
      );
    } else {
      bot.sendMessage(chatId,
        `📊 <b>No Campaigns Found</b>\n\n` +
        `There are no campaigns in the database yet.\n\n` +
        `Use /createcampaign to create your first campaign!`,
        { parse_mode: 'HTML' }
      );
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error.message);
    
    bot.sendMessage(chatId,
      `❌ <b>Error</b>\n\n` +
      `Failed to fetch campaigns. Please try again later.\n\n` +
      `<i>Error: ${error.message}</i>`,
      { parse_mode: 'HTML' }
    );
  }
});

// Handle text messages (for conversation flow)
bot.on('message', async (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);
  
  if (!userState) return;
  
  // Handle createcampaign flow
  if (userState.command === 'createcampaign' && userState.step === 'waiting_for_id') {
    const campaignId = msg.text?.trim();
    
    if (!campaignId) {
      bot.sendMessage(chatId,
        `⚠️ Please enter a valid campaign ID.\n\n` +
        `Example: <code>summer2024</code>`,
        { parse_mode: 'HTML' }
      );
      return;
    }
    
    // Validate campaign ID (alphanumeric, underscore, dash)
    if (!/^[a-zA-Z0-9_-]+$/.test(campaignId)) {
      bot.sendMessage(chatId,
        `⚠️ <b>Invalid Campaign ID</b>\n\n` +
        `Campaign ID can only contain:\n` +
        `• Letters (a-z, A-Z)\n` +
        `• Numbers (0-9)\n` +
        `• Underscore (_)\n` +
        `• Dash (-)\n\n` +
        `Please try again with a valid ID.`,
        { parse_mode: 'HTML' }
      );
      return;
    }
    
    try {
      // Show loading message
      const loadingMsg = await bot.sendMessage(chatId, '⏳ Creating campaign link...');
      
      // Call API to generate campaign link
      const response = await axios.get(`${API_BASE_URL}/api/campaign-link`, {
        params: { campaign_id: campaignId },
        timeout: 10000
      });
      
      // Delete loading message
      await bot.deleteMessage(chatId, loadingMsg.message_id);
      
      if (response.data && response.data.url) {
        // Clear user state
        userStates.delete(chatId);
        
        // Send success message with the link
        bot.sendMessage(chatId,
          `✅ <b>Campaign Link Created!</b>\n\n` +
          `<b>Campaign ID:</b> <code>${campaignId}</code>\n\n` +
          `<b>Your webapp campaign link:</b>\n` +
          `<code>${response.data.url}</code>\n\n` +
          `📋 <i>This link will directly open the quiz webapp with your campaign ID</i>\n\n` +
          `Share this link with your participants to track their quiz results under this campaign.`,
          { 
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔗 Open Quiz App', url: response.data.url }
                ],
                [
                  { text: '➕ Create Another Campaign', callback_data: 'create_another' },
                  { text: '📊 View All Campaigns', callback_data: 'view_campaigns' }
                ]
              ]
            }
          }
        );
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error creating campaign link:', error.message);
      
      // Clear user state
      userStates.delete(chatId);
      
      bot.sendMessage(chatId,
        `❌ <b>Error Creating Campaign Link</b>\n\n` +
        `Failed to create campaign link for ID: <code>${campaignId}</code>\n\n` +
        `<i>Error: ${error.message}</i>\n\n` +
        `Please try again later or contact support.`,
        { parse_mode: 'HTML' }
      );
    }
  }
});

// Handle callback queries (inline keyboard buttons)
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  // Answer callback query to remove loading state
  bot.answerCallbackQuery(callbackQuery.id);
  
  switch (data) {
    case 'create_another':
      // Trigger create campaign command
      bot.emit('text', {
        chat: { id: chatId },
        text: '/createcampaign',
        from: callbackQuery.from
      });
      break;
      
    case 'view_campaigns':
      // Trigger campaigns command
      bot.emit('text', {
        chat: { id: chatId },
        text: '/campaigns',
        from: callbackQuery.from
      });
      break;
  }
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Bot shutting down...');
  bot.stopPolling();
  process.exit(0);
});

console.log('🤖 Quiz Prize Bot is running...');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`Bot Username: @${BOT_USERNAME}`);
