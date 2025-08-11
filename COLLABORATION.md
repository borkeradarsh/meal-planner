# 🤝 Collaboration Guide - Smart Meal Planner

Welcome to the Smart Meal Planner project! This guide will help team members get started with the project and collaborate effectively.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Project Structure](#project-structure)
5. [API Documentation](#api-documentation)
6. [Contributing Guidelines](#contributing-guidelines)
7. [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

Smart Meal Planner is a full-stack web application that helps users plan meals based on available pantry items using AI. The application consists of:

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Python Flask API with SQLAlchemy and SQLite
- **AI Integration**: IBM watsonx AI for intelligent meal planning
- **Database**: SQLite for development, easily upgradeable to PostgreSQL

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **Git** (for version control)
- **VSCode** (recommended editor)

### 1. Clone the Repository

```bash
git clone https://github.com/borkeradarsh/meal-planner.git
cd meal-planner
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env file with your configuration

# Initialize database
python init_db.py

# Start backend server
python app.py
```

Backend will run on: `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to project root (from backend directory)
cd ..

# Install dependencies
npm install

# Setup environment variables
# Create .env.local file
echo "NEXT_PUBLIC_API_BASE=http://localhost:5000" > .env.local

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🔄 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual feature branches
- `hotfix/issue-description` - Critical bug fixes

### Workflow Steps

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Write tests for new features
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create Pull Request on GitHub
   - Request review from team members

5. **Code Review**
   - Address review comments
   - Ensure all tests pass

6. **Merge to Main**
   - Squash and merge approved PRs
   - Delete feature branch after merge

### Commit Message Convention

Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 📁 Project Structure

```
meal-planner/
├── backend/                    # Python Flask Backend
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── init_db.py             # Database initialization
│   ├── watsonx_integration.py # IBM watsonx AI integration
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment template
│   └── .env                  # Environment variables (ignored)
├── app/                       # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main meal planner page
│   └── globals.css           # Global styles
├── public/                    # Static assets
├── package.json              # Node.js dependencies
├── .env.local                # Frontend environment (ignored)
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

## 📚 API Documentation

### Base URL
`http://localhost:5000`

### Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/health` | Health check | - |
| GET | `/pantry` | Get all pantry items | - |
| POST | `/pantry` | Add/update pantry item | `{name, quantity, unit}` |
| DELETE | `/pantry/<id>` | Delete pantry item | - |
| POST | `/plan-meal` | Generate meal plan | `{pantry?: string[]}` |

### Example Requests

**Add Pantry Item:**
```bash
curl -X POST http://localhost:5000/pantry \
  -H "Content-Type: application/json" \
  -d '{"name": "chicken", "quantity": 2, "unit": "lbs"}'
```

**Generate Meal Plan:**
```bash
curl -X POST http://localhost:5000/plan-meal \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🤝 Contributing Guidelines

### Code Style

**Python (Backend):**
- Follow PEP 8 guidelines
- Use type hints where possible
- Document functions with docstrings
- Maximum line length: 100 characters

**TypeScript (Frontend):**
- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Prefer named exports

### Testing

**Backend Tests:**
```bash
# Run backend tests
cd backend
python -m pytest tests/
```

**Frontend Tests:**
```bash
# Run frontend tests
npm test
```

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console.log statements in production code
- [ ] Environment variables properly configured
- [ ] Error handling implemented
- [ ] Performance considerations addressed

## 🔧 IBM watsonx Integration

### Setup Instructions

1. **Get IBM Cloud Credentials:**
   - Create IBM Cloud account
   - Set up watsonx project
   - Get API key and project ID

2. **Configure Environment:**
   ```bash
   # In backend/.env
   WATSONX_API_KEY=your_actual_api_key
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   WATSONX_PROJECT_ID=your_project_id
   USE_WATSONX=true
   ```

3. **Test Integration:**
   ```bash
   cd backend
   python watsonx_integration.py
   ```

## 🐛 Troubleshooting

### Common Issues

**Backend Issues:**
- **Port 5000 in use**: Change port in `app.py`
- **Import errors**: Ensure virtual environment is activated
- **Database issues**: Run `python init_db.py` to reset

**Frontend Issues:**
- **Module not found**: Run `npm install`
- **CORS errors**: Ensure backend CORS is configured
- **Build errors**: Check TypeScript types

**Git Issues:**
- **Push rejected**: Pull latest changes first
- **Merge conflicts**: Resolve conflicts manually

### Getting Help

1. Check existing issues on GitHub
2. Search documentation and troubleshooting
3. Ask in team chat/discussion
4. Create detailed issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages
   - Environment details

## 📞 Contact & Support

- **Repository**: https://github.com/borkeradarsh/meal-planner
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

---

Happy coding! 🚀
