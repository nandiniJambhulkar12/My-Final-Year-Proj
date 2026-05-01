@echo off
echo XAI Code Audit - Dependency Installation
echo ======================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and make sure to check "Add to PATH"
    echo.
    echo After installing Node.js:
    echo 1. Restart your computer or open a new terminal
    echo 2. Run this script again
    echo.
    pause
    exit /b 1
)

echo Node.js found!
node --version

REM Check if npm is available
echo.
echo Checking for npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    echo Please reinstall Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo npm found!
npm --version

echo.
echo Installing project dependencies...
echo This may take a few minutes...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo.
    echo Try these solutions:
    echo 1. Clear npm cache: npm cache clean --force
    echo 2. Delete node_modules folder and run npm install again
    echo 3. Check your internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo ======================================
echo SUCCESS! Dependencies installed.
echo ======================================
echo.
echo You can now run the project:
echo   npm start
echo.
echo The app will open at: http://localhost:3000
echo.

pause
