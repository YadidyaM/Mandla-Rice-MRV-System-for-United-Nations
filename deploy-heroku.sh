#!/bin/bash

# Heroku Deployment Script for Mandla Rice MRV
echo "🚀 Starting Heroku deployment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    heroku login
fi

# Get app name from user
echo "📱 Enter your Heroku app name (or press Enter to create a new one):"
read app_name

if [ -z "$app_name" ]; then
    echo "🆕 Creating new Heroku app..."
    app_name=$(heroku create --json | jq -r '.name')
    echo "✅ Created app: $app_name"
else
    echo "🔍 Checking if app exists..."
    if ! heroku apps:info --app "$app_name" &> /dev/null; then
        echo "❌ App '$app_name' not found. Please create it first or check the name."
        exit 1
    fi
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building the application..."
npm run build

echo "🔧 Setting up Heroku configuration..."

# Set Node.js buildpack
heroku buildpacks:set heroku/nodejs --app "$app_name"

# Set environment variables if needed
echo "🌍 Setting environment variables..."
heroku config:set NODE_ENV=production --app "$app_name"

echo "📤 Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku - $(date)"

# Add Heroku remote if not exists
if ! git remote | grep -q heroku; then
    heroku git:remote -a "$app_name"
fi

# Push to Heroku
git push heroku main

echo "✅ Deployment completed!"
echo "🌐 Your app is available at: https://$app_name.herokuapp.com"

# Open the app
echo "🔗 Opening your app..."
heroku open --app "$app_name"

echo "🎉 Deployment successful! 🎉"
