# Heroku Deployment Script for Mandla Rice MRV
Write-Host "🚀 Starting Heroku deployment..." -ForegroundColor Green

# Check if Heroku CLI is installed
try {
    $herokuVersion = heroku --version
    Write-Host "✅ Heroku CLI found: $herokuVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if user is logged in to Heroku
try {
    $whoami = heroku auth:whoami
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Heroku first:" -ForegroundColor Yellow
    heroku login
}

# Get app name from user
$appName = Read-Host "📱 Enter your Heroku app name (or press Enter to create a new one)"

if ([string]::IsNullOrWhiteSpace($appName)) {
    Write-Host "🆕 Creating new Heroku app..." -ForegroundColor Blue
    try {
        $createOutput = heroku create --json
        $appName = ($createOutput | ConvertFrom-Json).name
        Write-Host "✅ Created app: $appName" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create app. Please try manually: heroku create" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "🔍 Checking if app exists..." -ForegroundColor Blue
    try {
        heroku apps:info --app $appName | Out-Null
        Write-Host "✅ App '$appName' found" -ForegroundColor Green
    } catch {
        Write-Host "❌ App '$appName' not found. Please create it first or check the name." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

Write-Host "🏗️ Building the application..." -ForegroundColor Blue
npm run build

Write-Host "🔧 Setting up Heroku configuration..." -ForegroundColor Blue

# Set Node.js buildpack
Write-Host "📦 Setting Node.js buildpack..." -ForegroundColor Blue
heroku buildpacks:set heroku/nodejs --app $appName

# Set environment variables if needed
Write-Host "🌍 Setting environment variables..." -ForegroundColor Blue
heroku config:set NODE_ENV=production --app $appName

Write-Host "📤 Deploying to Heroku..." -ForegroundColor Blue

# Add all files to git
git add .

# Commit changes
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy to Heroku - $timestamp"

# Add Heroku remote if not exists
$remotes = git remote
if ($remotes -notcontains "heroku") {
    Write-Host "🔗 Adding Heroku remote..." -ForegroundColor Blue
    heroku git:remote -a $appName
}

# Push to Heroku
Write-Host "🚀 Pushing to Heroku..." -ForegroundColor Blue
git push heroku main

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: https://$appName.herokuapp.com" -ForegroundColor Cyan

# Open the app
Write-Host "🔗 Opening your app..." -ForegroundColor Blue
heroku open --app $appName

Write-Host "🎉 Deployment successful! 🎉" -ForegroundColor Green
Read-Host "Press Enter to exit"
