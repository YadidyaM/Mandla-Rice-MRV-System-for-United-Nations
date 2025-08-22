@echo off
echo 🚀 Starting Heroku deployment...

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Heroku CLI is not installed. Please install it first:
    echo    https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

REM Check if user is logged in to Heroku
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Heroku first:
    heroku login
)

REM Get app name from user
set /p app_name="📱 Enter your Heroku app name (or press Enter to create a new one): "

if "%app_name%"=="" (
    echo 🆕 Creating new Heroku app...
    for /f "tokens=*" %%i in ('heroku create --json ^| jq -r ".name"') do set app_name=%%i
    echo ✅ Created app: %app_name%
) else (
    echo 🔍 Checking if app exists...
    heroku apps:info --app "%app_name%" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ App '%app_name%' not found. Please create it first or check the name.
        pause
        exit /b 1
    )
)

echo 📦 Installing dependencies...
npm install

echo 🏗️ Building the application...
npm run build

echo 🔧 Setting up Heroku configuration...

REM Set Node.js buildpack
heroku buildpacks:set heroku/nodejs --app "%app_name%"

REM Set environment variables if needed
echo 🌍 Setting environment variables...
heroku config:set NODE_ENV=production --app "%app_name%"

echo 📤 Deploying to Heroku...
git add .
git commit -m "Deploy to Heroku - %date% %time%"

REM Add Heroku remote if not exists
git remote | findstr heroku >nul 2>&1
if %errorlevel% neq 0 (
    heroku git:remote -a "%app_name%"
)

REM Push to Heroku
git push heroku main

echo ✅ Deployment completed!
echo 🌐 Your app is available at: https://%app_name%.herokuapp.com

REM Open the app
echo 🔗 Opening your app...
heroku open --app "%app_name%"

echo 🎉 Deployment successful! 🎉
pause
