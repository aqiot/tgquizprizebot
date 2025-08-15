#!/bin/bash

# Script to push to cursor/build-telegram-quiz-web-app-817a branch

echo "========================================="
echo "   Push to GitHub Branch"
echo "   Branch: cursor/build-telegram-quiz-web-app-817a"
echo "========================================="
echo ""

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "cursor/build-telegram-quiz-web-app-817a" ]; then
    echo "Switching to cursor/build-telegram-quiz-web-app-817a branch..."
    git checkout cursor/build-telegram-quiz-web-app-817a
fi

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "Remote 'origin' already exists"
    REMOTE_URL=$(git remote get-url origin)
    echo "Current remote URL: $REMOTE_URL"
    echo ""
else
    echo "No remote 'origin' found."
    echo ""
    read -p "Enter your GitHub username: " username
    
    if [ ! -z "$username" ]; then
        echo ""
        echo "Choose connection method:"
        echo "1) HTTPS (easier, works everywhere)"
        echo "2) SSH (more secure, requires SSH key setup)"
        read -p "Enter choice (1 or 2): " choice
        
        case $choice in
            1)
                REMOTE_URL="https://github.com/$username/telegram-quiz-app.git"
                ;;
            2)
                REMOTE_URL="git@github.com:$username/telegram-quiz-app.git"
                ;;
            *)
                echo "Invalid choice. Using HTTPS."
                REMOTE_URL="https://github.com/$username/telegram-quiz-app.git"
                ;;
        esac
        
        echo "Adding remote: $REMOTE_URL"
        git remote add origin "$REMOTE_URL"
        echo "✅ Remote added successfully!"
    else
        echo "❌ Username required. Exiting."
        exit 1
    fi
fi

echo ""
echo "Ready to push to: cursor/build-telegram-quiz-web-app-817a"
echo ""
echo "This will push the following commits:"
git log --oneline -5
echo ""

read -p "Do you want to push these commits? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Pushing to cursor/build-telegram-quiz-web-app-817a..."
    
    # Push the branch
    if git push -u origin cursor/build-telegram-quiz-web-app-817a; then
        echo ""
        echo "✅ Successfully pushed to cursor/build-telegram-quiz-web-app-817a!"
        echo ""
        echo "🎉 Your code is now available at:"
        echo "   $REMOTE_URL"
        echo "   Branch: cursor/build-telegram-quiz-web-app-817a"
        echo ""
        echo "To view on GitHub:"
        if [[ $REMOTE_URL == *"github.com"* ]]; then
            # Extract username and repo from URL
            if [[ $REMOTE_URL == git@* ]]; then
                # SSH format
                GITHUB_URL=$(echo $REMOTE_URL | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
            else
                # HTTPS format
                GITHUB_URL=$(echo $REMOTE_URL | sed 's/\.git$//')
            fi
            echo "   $GITHUB_URL/tree/cursor/build-telegram-quiz-web-app-817a"
        fi
    else
        echo ""
        echo "❌ Push failed. Please check your credentials and try again."
        echo ""
        echo "If using HTTPS, you may need to:"
        echo "1. Create a Personal Access Token at: https://github.com/settings/tokens"
        echo "2. Use the token as your password when prompted"
        echo ""
        echo "If using SSH, ensure your SSH key is added to GitHub:"
        echo "1. Check if you have an SSH key: ls ~/.ssh/"
        echo "2. Add your SSH key to GitHub: https://github.com/settings/keys"
    fi
else
    echo "Push cancelled."
fi