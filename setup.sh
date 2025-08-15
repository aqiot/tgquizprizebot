#!/bin/bash

# Telegram Quiz App Setup Script
# This script helps you set up the application quickly

set -e

echo "========================================="
echo "   Telegram Quiz App Setup Script"
echo "========================================="
echo ""

# Check for Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed."
        echo "Please install Docker from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    echo "✅ Docker is installed"
}

# Check for Docker Compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed."
        echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    echo "✅ Docker Compose is installed"
}

# Setup Google credentials
setup_google_credentials() {
    echo ""
    echo "Setting up Google Service Account credentials..."
    echo ""
    echo "How would you like to provide Google credentials?"
    echo "1) Use existing JSON file"
    echo "2) Create from manual input"
    echo "3) Download from Google Cloud Console"
    echo "4) Skip (I'll set it up later)"
    echo ""
    read -p "Enter your choice (1-4): " cred_choice

    case $cred_choice in
        1)
            read -p "Enter path to your JSON credentials file: " json_path
            if [ -f "$json_path" ]; then
                cp "$json_path" google-credentials.json
                echo "✅ Credentials file copied to google-credentials.json"
            else
                echo "❌ File not found: $json_path"
                setup_google_credentials
            fi
            ;;
        2)
            echo ""
            echo "Please provide the following information from your Google Service Account:"
            read -p "Project ID: " project_id
            read -p "Private Key ID: " private_key_id
            read -p "Client Email: " client_email
            read -p "Client ID: " client_id
            echo "Private Key (paste the entire key including BEGIN/END lines, then press Ctrl+D):"
            private_key=$(cat)
            
            cat > google-credentials.json << EOF
{
  "type": "service_account",
  "project_id": "$project_id",
  "private_key_id": "$private_key_id",
  "private_key": "$private_key",
  "client_email": "$client_email",
  "client_id": "$client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/${client_email//@/%40}"
}
EOF
            echo "✅ google-credentials.json created successfully"
            ;;
        3)
            echo ""
            echo "To download your service account key from Google Cloud Console:"
            echo "1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
            echo "2. Select your project"
            echo "3. Click on your service account"
            echo "4. Go to 'Keys' tab"
            echo "5. Click 'Add Key' > 'Create new key' > 'JSON'"
            echo "6. Save the downloaded file as 'google-credentials.json' in this directory"
            echo ""
            read -p "Press Enter when you've placed the file in this directory..."
            if [ -f "google-credentials.json" ]; then
                echo "✅ google-credentials.json found"
            else
                echo "⚠️  google-credentials.json not found. You'll need to add it before running the app."
            fi
            ;;
        4)
            echo "⚠️  Skipping credentials setup. Remember to add google-credentials.json before running the app."
            ;;
        *)
            echo "Invalid choice. Please try again."
            setup_google_credentials
            ;;
    esac
}

# Create .env file
setup_env() {
    if [ -f .env ]; then
        echo "⚠️  .env file already exists."
        read -p "Do you want to overwrite it? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Keeping existing .env file."
            return
        fi
    fi

    cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# Google Service Account Credentials
# Using JSON file (recommended)
GOOGLE_SERVICE_ACCOUNT_FILE=./google-credentials.json

# Alternative: You can also use environment variable with JSON string
# GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
EOF

    echo "✅ .env file created successfully"
}

# Verify Google Sheets access
verify_sheets_access() {
    if [ -f "google-credentials.json" ]; then
        echo ""
        echo "📋 Important: Share your Google Sheets with the service account email"
        echo ""
        # Try to extract and display the service account email
        if command -v jq &> /dev/null; then
            SERVICE_ACCOUNT_EMAIL=$(jq -r '.client_email' google-credentials.json 2>/dev/null)
            if [ ! -z "$SERVICE_ACCOUNT_EMAIL" ]; then
                echo "Service Account Email: $SERVICE_ACCOUNT_EMAIL"
                echo ""
                echo "Share these Google Sheets with the above email:"
                echo "1. Quiz Sheet: https://docs.google.com/spreadsheets/d/1RKK7sohIl3vYUvEoESmGNkT54u1kTE-swnGxUjWnBh0"
                echo "2. Campaign Sheet: https://docs.google.com/spreadsheets/d/1YxRImYKl_i3aeikfkIvhwwQxaTbej_j0mkLbNLqOrnc"
            fi
        else
            echo "Check your google-credentials.json for the 'client_email' field"
            echo "and share the Google Sheets with that email address."
        fi
        echo ""
        read -p "Press Enter when you've shared the sheets..."
    fi
}

# Choose deployment type
choose_deployment() {
    echo ""
    echo "How would you like to run the application?"
    echo "1) Development mode (with hot-reloading)"
    echo "2) Production mode (optimized build)"
    echo "3) Just build the images (don't start)"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice

    case $choice in
        1)
            echo ""
            echo "Starting development environment..."
            docker-compose -f docker-compose.dev.yml up --build
            ;;
        2)
            echo ""
            echo "Starting production environment..."
            docker-compose up --build
            ;;
        3)
            echo ""
            echo "Building Docker images..."
            docker-compose build
            echo "✅ Images built successfully"
            echo ""
            echo "To start the application, run:"
            echo "  Development: docker-compose -f docker-compose.dev.yml up"
            echo "  Production: docker-compose up"
            ;;
        4)
            echo "Exiting setup..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            choose_deployment
            ;;
    esac
}

# Main execution
main() {
    echo "Checking prerequisites..."
    check_docker
    check_docker_compose
    echo ""

    # Check for Google credentials
    if [ ! -f "google-credentials.json" ]; then
        echo "No Google credentials file found."
        setup_google_credentials
    else
        echo "✅ google-credentials.json found"
        read -p "Do you want to reconfigure Google credentials? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            setup_google_credentials
        fi
    fi

    # Check if .env exists
    if [ ! -f .env ]; then
        echo "No .env file found. Creating one..."
        setup_env
    else
        echo "✅ .env file found"
    fi

    # Verify Google Sheets access
    verify_sheets_access

    # Create nginx/ssl directory if it doesn't exist
    mkdir -p nginx/ssl

    choose_deployment
}

# Run main function
main