#!/bin/bash

# Smart Meal Planner - Development Setup Script
# This script sets up the development environment for new contributors

echo "🍽️ Smart Meal Planner - Development Setup"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
    echo "✅ Python $PYTHON_VERSION found"
else
    echo "❌ Python not found. Please install Python 3.10+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION found"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm $NPM_VERSION found"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo ""
echo "Setting up backend..."

# Backend setup
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Setup environment file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

# Initialize database
echo "Initializing database..."
python init_db.py

echo "✅ Backend setup complete!"

# Frontend setup
cd ..
echo ""
echo "Setting up frontend..."

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

# Setup frontend environment
if [ ! -f .env.local ]; then
    echo "Creating frontend environment file..."
    echo "NEXT_PUBLIC_API_BASE=http://localhost:5000" > .env.local
fi

echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start development:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "   venv\\Scripts\\activate"
else
    echo "   source venv/bin/activate"
fi
echo "   python app.py"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📚 Read COLLABORATION.md for detailed development guidelines"
echo "🐛 Check troubleshooting section if you encounter issues"
