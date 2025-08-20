# Telegram Quiz WebApp

A Telegram WebApp that runs 6-question quizzes with RU/EN localization, Google Sheets integration, and a $5,000 giveaway system.

## Features

- 📱 **Mobile-first responsive design** optimized for Telegram WebApp
- 🌍 **Bilingual support** (English/Russian) with automatic language detection
- 📊 **Google Sheets integration** for quiz data and results storage
- 🎯 **6-question quiz flow** with progress tracking and animations
- 💰 **Giveaway system** - users need 4+ correct answers to participate
- 📈 **Campaign tracking** via Base64-encoded start parameters
- 💾 **Progress persistence** - resume unfinished quizzes
- 🎨 **Beautiful UI** with Framer Motion animations
- 📡 **Offline detection** with graceful error handling
- 🐳 **Docker support** for easy deployment

## Tech Stack

- **Frontend**: React 18, TypeScript, Framer Motion
- **Backend**: Node.js, Express, Google Sheets API
- **Integration**: Telegram WebApp SDK
- **Styling**: CSS Modules, custom design system
- **Deployment**: Docker, Docker Compose, Nginx

## Prerequisites

1. **Google Cloud Service Account**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com)
   - Enable Google Sheets API
   - Create a service account and download the JSON key file
   - Share your Google Sheets with the service account email

2. **Telegram Bot**
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Set up WebApp for your bot

3. **Docker & Docker Compose** (for containerized deployment)
   - [Install Docker](https://docs.docker.com/get-docker/)
   - [Install Docker Compose](https://docs.docker.com/compose/install/)

4. **Node.js** version 14+ and npm (for local development without Docker)

## Quick Start with Docker

### 1. Clone and Configure

```bash
git clone <repository-url>
cd telegram-quiz-app

# Run the interactive setup script
./setup.sh
```

The setup script will:
- Check Docker installation
- Help you set up Google credentials
- Create necessary configuration files
- Launch the application

### 2. Manual Setup (Alternative)

#### Setting up Google Credentials

The application supports three methods for providing Google Service Account credentials:

**Method 1: JSON File (Recommended)**
```bash
# Download your service account key from Google Cloud Console
# Save it as google-credentials.json in the project root
cp ~/Downloads/your-service-account-key.json ./google-credentials.json

# The app will automatically detect and use this file
```

**Method 2: Environment Variable with JSON String**
```bash
# Set the entire JSON as an environment variable
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```

**Method 3: Individual Environment Variables (Legacy)**
```bash
# Not recommended, but supported for backward compatibility
export GOOGLE_PROJECT_ID=your-project-id
export GOOGLE_PRIVATE_KEY_ID=your-key-id
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
export GOOGLE_CLIENT_EMAIL=your-service@project.iam.gserviceaccount.com
export GOOGLE_CLIENT_ID=your-client-id
```

#### Create .env file
```bash
cp .env.example .env
# Edit .env to set:
# GOOGLE_SERVICE_ACCOUNT_FILE=./google-credentials.json
```

### 3. Share Google Sheets

**Important**: Share both Google Sheets with your service account email:

1. Open each Google Sheet
2. Click "Share" button
3. Add your service account email (found in google-credentials.json as `client_email`)
4. Give "Editor" or "Viewer" permissions as needed

Sheets to share:
- Quiz Sheet: https://docs.google.com/spreadsheets/d/1RKK7sohIl3vYUvEoESmGNkT54u1kTE-swnGxUjWnBh0
- Campaign Sheet: https://docs.google.com/spreadsheets/d/1YxRImYKl_i3aeikfkIvhwwQxaTbej_j0mkLbNLqOrnc

### 4. Development with Docker (Hot-Reloading)

```bash
# Start development environment
make dev

# Or without make:
docker-compose -f docker-compose.dev.yml up --build

# Access the app at:
# - React app: http://localhost:3000
# - API server: http://localhost:3001
```

### 5. Production with Docker

```bash
# Start production environment
make prod

# Or without make:
docker-compose up --build

# Access at http://localhost (nginx) or http://localhost:3001 (direct)
```

### 6. Useful Docker Commands

```bash
# Show all available commands
make help

# Stop all containers
make stop

# View logs
make logs

# Open shell in container
make shell-dev  # for development
make shell      # for production

# Clean up everything
make clean

# Check health status
make health
```

## Installation (Without Docker)

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-quiz-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google credentials:
```bash
# Copy your service account JSON key
cp ~/Downloads/your-service-account-key.json ./google-credentials.json
```

4. Create `.env` file:
```bash
cp .env.example .env
# Edit .env to set GOOGLE_SERVICE_ACCOUNT_FILE=./google-credentials.json
```

## Development (Without Docker)

1. Start both servers concurrently:
```bash
npm run dev
```

2. Or run separately:
```bash
# Terminal 1: Backend server
npm run server

# Terminal 2: React development server
npm start
```

3. Open [http://localhost:3000](http://localhost:3000)

## Production Build

### With Docker (Recommended)

```bash
# Build and run production container
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Without Docker

```bash
# Build the React app
npm run build

# Start production server
npm run prod
```

## Deployment

### Deploy with Docker to VPS/Cloud

1. **On your server:**
```bash
# Clone repository
git clone <repository-url>
cd telegram-quiz-app

# Copy your Google credentials
scp google-credentials.json user@server:/path/to/app/

# Or set as environment variable in docker-compose.yml:
# GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Start with Docker Compose
docker-compose up -d

# Set up SSL (optional but recommended)
# Edit nginx/nginx.conf to uncomment SSL configuration
# Add SSL certificates to nginx/ssl/
docker-compose restart nginx
```

2. **Using Docker Hub:**
```bash
# Build and push image
docker build -t yourusername/telegram-quiz-app .
docker push yourusername/telegram-quiz-app

# On server, use the image in docker-compose.yml:
# image: yourusername/telegram-quiz-app
```

### Deploy to Heroku

1. Install Heroku CLI and login
2. Set Google credentials as config var:
```bash
# Option 1: As JSON string
heroku config:set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Option 2: Using buildpack for files
heroku buildpacks:add https://github.com/buyersight/heroku-google-application-credentials-buildpack
heroku config:set GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
```

3. Create `heroku.yml`:
```yaml
build:
  docker:
    web: Dockerfile
```

4. Deploy:
```bash
heroku create your-app-name
heroku stack:set container
git push heroku main
```

### Deploy to Railway/Render

These platforms support Docker deployments directly from GitHub:
1. Connect your GitHub repository
2. Add Google credentials as environment variable:
   - Set `GOOGLE_SERVICE_ACCOUNT_JSON` with the full JSON content
3. Deploy automatically on push

## Docker Configuration Files

- **`Dockerfile`** - Multi-stage production build
- **`Dockerfile.dev`** - Development with hot-reloading
- **`docker-compose.yml`** - Production orchestration
- **`docker-compose.dev.yml`** - Development orchestration
- **`nginx/nginx.conf`** - Nginx reverse proxy configuration
- **`Makefile`** - Convenient Docker commands

## Environment Variables

Required environment variables for Docker deployment:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Google Service Account Credentials (choose one method)

# Method 1: File path (recommended for local/VPS)
GOOGLE_SERVICE_ACCOUNT_FILE=./google-credentials.json

# Method 2: JSON string (recommended for cloud platforms)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'

# Method 3: Individual variables (backward compatibility)
# GOOGLE_PROJECT_ID=your-project-id
# GOOGLE_PRIVATE_KEY_ID=your-private-key-id
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# GOOGLE_CLIENT_ID=your-client-id
# GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

## Google Service Account Setup

1. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google Sheets API
   - Go to IAM & Admin > Service Accounts
   - Create Service Account
   - Download JSON key

2. **Download Credentials:**
   - Click on the service account
   - Go to "Keys" tab
   - Add Key > Create new key > JSON
   - Save as `google-credentials.json`

3. **Share Sheets:**
   - Open each Google Sheet
   - Click Share
   - Add the service account email
   - Grant appropriate permissions

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status (useful for Docker health checks)

### Get Quizzes
```
GET /api/quizzes
```
Returns all published quizzes with questions

### Get Quiz by ID
```
GET /api/quizzes/:id
```
Returns a specific quiz

### Submit Result
```
POST /api/result
```
Body:
```json
{
  "tgID": "123456",
  "quizID": "quiz1",
  "questionsAnswered": 6
}
```

### Get Campaigns
```
GET /api/campaigns
```
Returns list of campaign IDs

### Generate Campaign Link
```
GET /api/campaign-link?campaign_id=xxx
```
Returns Telegram bot link with encoded campaign ID

## Google Sheets Structure

### Quizzes Sheet
| Column | Description |
|--------|-------------|
| quizID | Unique quiz identifier |
| quizName | Quiz name in English |
| quizNameRU | Quiz name in Russian |
| questionID | Question number (1-6) |
| question | Question text in English |
| questionRU | Question text in Russian |
| answer1-3 | Answer options in English |
| answer1RU-3RU | Answer options in Russian |
| correctAnswer | Correct answer number (1-3) |
| published | true/false to show/hide quiz |

### Participants Sheet
| Column | Description |
|--------|-------------|
| tgID | Telegram user ID |
| quizID | Quiz identifier |
| questionsAnswered | Number of questions answered |
| campaignId | Campaign identifier (if available) |

### Campaigns Sheet
| Column | Description |
|--------|-------------|
| campaign_id | Unique campaign identifier |

## Telegram Bot Integration

1. Set your WebApp URL in BotFather:
```
/setmenubutton
Select your bot
Enter URL: https://your-domain.com
Enter button text: Play Quiz
```

2. Generate campaign links:
```
GET /api/campaign-link?campaign_id=summer2024
Returns: t.me/yourbot/app?startapp=c3VtbWVyMjAyNA==
```

3. The WebApp receives data via:
```javascript
window.Telegram.WebApp.initDataUnsafe.start_param // Base64 campaign ID
window.Telegram.WebApp.initDataUnsafe.user // User data
```

4. Send results back to bot:
```javascript
window.Telegram.WebApp.sendData(JSON.stringify({
  tgId: "123456",
  quizId: "quiz1",
  correct: 5,
  total: 6,
  campaignId: "summer2024"
}));
```

## Bot Commands

To complete the marketing flow, implement these bot commands:

```python
# Bot command to handle quiz results
@bot.on_message(filters.web_app_data)
async def handle_quiz_result(client, message):
    data = json.loads(message.web_app_data.data)
    user_id = data['tgId']
    correct = data['correct']
    
    if correct >= 4:
        # Add user to giveaway
        await message.reply("🎉 Congratulations! You're entered in the $5,000 giveaway!")
    else:
        await message.reply("Try again! You need 4+ correct answers to enter.")

# Command to check campaign performance
/campaign_stats <campaign_id>
# Returns: participants, average score, completion rate
```

## Testing

### With Docker
```bash
# Run tests in container
make test

# Or manually:
docker-compose -f docker-compose.dev.yml run --rm app-dev npm test
```

### Without Docker
```bash
npm test
```

### Test with ngrok (for Telegram integration)
```bash
# Install ngrok
npm install -g ngrok

# For Docker setup
ngrok http 80  # If using nginx
ngrok http 3001  # If using app directly

# For local setup
ngrok http 3000
```

## Performance Optimization

- Lighthouse score target: >90 on mobile
- Bundle size: <200KB gzipped
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Docker image size: ~150MB (Alpine Linux)

## Security Notes

- Never commit `google-credentials.json` to version control
- Use environment variables for sensitive data in production
- Validate all data on the backend
- Use HTTPS in production (configure in nginx/nginx.conf)
- Implement rate limiting (configured in Nginx)
- Sanitize user inputs
- Run containers as non-root user (configured in Dockerfile)

## Troubleshooting

### Google Credentials Issues

#### Credentials file not found
```bash
# Check if file exists
ls -la google-credentials.json

# Check environment variable
echo $GOOGLE_SERVICE_ACCOUNT_FILE

# In Docker, check if mounted correctly
docker-compose exec app ls -la /app/google-credentials.json
```

#### Invalid credentials error
- Verify JSON file is valid: `cat google-credentials.json | jq .`
- Check service account has correct permissions
- Ensure sheets are shared with service account email

#### Docker can't read credentials
```bash
# Check file permissions
chmod 644 google-credentials.json

# Verify volume mount in docker-compose.yml
volumes:
  - ./google-credentials.json:/app/google-credentials.json:ro
```

### Docker Issues

#### Container won't start
```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose config

# Rebuild without cache
docker-compose build --no-cache
```

#### Permission errors
```bash
# Fix ownership
sudo chown -R $USER:$USER .
```

#### Port already in use
```bash
# Change ports in docker-compose.yml or .env
PORT=3002
```

### Quiz data not loading
- Check Google Sheets permissions
- Verify service account email has access
- Check credentials are loaded correctly
- Verify Docker container can access Google APIs

### Telegram WebApp not initializing
- Ensure script is loaded: `<script src="https://telegram.org/js/telegram-web-app.js">`
- Check if running in Telegram context
- Verify bot WebApp settings
- Check HTTPS in production

### Campaign tracking not working
- Check Base64 encoding/decoding
- Verify start_param is passed correctly
- Test with direct bot link

## Monitoring

### Docker Health Checks
```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:3001/api/health
```

### Logs
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f nginx

# Check credentials loading
docker-compose logs app | grep "Google credentials"
```

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the development team.
