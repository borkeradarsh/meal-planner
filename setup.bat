@echo off
REM Smart Meal Planner - Development Setup Script for Windows
REM This script sets up the development environment for new contributors

echo 🍽️ Smart Meal Planner - Development Setup
echo ==========================================

REM Check prerequisites
echo Checking prerequisites...

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.10+
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python %PYTHON_VERSION% found
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
) else (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js %NODE_VERSION% found
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
) else (
    for /f %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm %NPM_VERSION% found
)

echo.
echo Setting up backend...

REM Backend setup
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Setup environment file
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your configuration
)

REM Initialize database
echo Initializing database...
python init_db.py

echo ✅ Backend setup complete!

REM Frontend setup
cd ..
echo.
echo Setting up frontend...

REM Install Node dependencies
echo Installing Node.js dependencies...
npm install

REM Setup frontend environment
if not exist .env.local (
    echo Creating frontend environment file...
    echo NEXT_PUBLIC_API_BASE=http://localhost:5000 > .env.local
)

echo ✅ Frontend setup complete!

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo To start development:
echo.
echo 1. Start Backend (Terminal 1):
echo    cd backend
echo    venv\Scripts\activate
echo    python app.py
echo.
echo 2. Start Frontend (Terminal 2):
echo    npm run dev
echo.
echo 3. Open browser:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 📚 Read COLLABORATION.md for detailed development guidelines
echo 🐛 Check troubleshooting section if you encounter issues

pause
