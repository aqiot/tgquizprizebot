#!/bin/bash

echo "========================================="
echo "   Push to GitHub Instructions"
echo "========================================="
echo ""
echo "1. First, create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name it: telegram-quiz-app"
echo "   - Make it public or private as you prefer"
echo "   - DON'T initialize with README, .gitignore, or license"
echo ""
echo "2. After creating the repository, run these commands:"
echo ""
echo "   # Replace YOUR_GITHUB_USERNAME with your actual GitHub username"
echo "   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/telegram-quiz-app.git"
echo ""
echo "   # Or if using SSH:"
echo "   # git remote add origin git@github.com:YOUR_GITHUB_USERNAME/telegram-quiz-app.git"
echo ""
echo "   # Push the code"
echo "   git push -u origin main"
echo ""
echo "3. Optional: If you want to use GitHub Pages for deployment:"
echo "   - Go to Settings > Pages in your repository"
echo "   - Select 'GitHub Actions' as the source"
echo ""
echo "========================================="
echo ""
read -p "Enter your GitHub username: " username

if [ ! -z "$username" ]; then
    echo ""
    echo "Run these commands to push your code:"
    echo ""
    echo "git remote add origin https://github.com/$username/telegram-quiz-app.git"
    echo "git push -u origin main"
    echo ""
    read -p "Do you want to add the remote now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote add origin "https://github.com/$username/telegram-quiz-app.git"
        echo "✅ Remote added successfully!"
        echo ""
        echo "Now run: git push -u origin main"
        echo ""
        read -p "Do you want to push now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push -u origin main
            echo ""
            echo "✅ Code pushed successfully!"
            echo "🎉 Your repository is now available at: https://github.com/$username/telegram-quiz-app"
        fi
    fi
fi