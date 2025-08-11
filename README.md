# Smart Meal Planner - IBM Hackathon Project

A full-stack AI-powered meal planning application that suggests recipes based on your pantry items. Built with Next.js frontend and Python Flask backend, designed to integrate with IBM watsonx AI.

## 🏗️ Project Structure

```
ibmmeal/
├── backend/                    # Python Flask API
│   ├── app.py                 # Main Flask application
│   ├── models.py              # SQLAlchemy database models
│   ├── init_db.py             # Database initialization script
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── db.sqlite3            # SQLite database (created after setup)
├── app/                       # Next.js frontend (App Router)
│   ├── page.tsx              # Main meal planner interface
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## 🚀 Features

- **Pantry Management**: Add, update, and delete pantry items with quantities and units
- **AI Meal Planning**: Generate meal suggestions based on available ingredients
- **Smart Shopping Lists**: Get recommendations for missing ingredients
- **Modern UI**: Responsive design with Tailwind CSS and dark mode support
- **IBM watsonx Integration**: Ready for AI-powered recipe generation

## 🛠️ Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **npm or yarn**

## 📦 Setup Instructions

### 1. Backend Setup (Python Flask)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Setup environment variables:**
   ```bash
   copy .env.example .env
   # Edit .env file and set USE_WATSONX=false for initial testing
   ```

6. **Initialize database:**
   ```bash
   python init_db.py
   ```

7. **Start the Flask server:**
   ```bash
   python app.py
   ```

   Backend will run at `http://localhost:5000`

### 2. Frontend Setup (Next.js)

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set API base URL (optional):**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_BASE=http://localhost:5000" > .env.local
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:3000`

## 🧪 Testing the Application

1. **Open browser:** Go to `http://localhost:3000`
2. **Add pantry items:** Use the form to add ingredients with quantities
3. **Generate meal plan:** Click "Plan My Meal" to get AI-generated suggestions
4. **View results:** See the recipe and any missing ingredients

## 🤖 IBM watsonx Integration

The application is designed to integrate with IBM watsonx AI for intelligent meal planning:

### Environment Variables for watsonx

Update your `backend/.env` file with your IBM credentials:

```env
WATSONX_API_KEY=your_actual_api_key_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=your_project_id_here
USE_WATSONX=true
```

### Implementation Steps

1. **Get IBM Cloud credentials** from your IBM Cloud account
2. **Create watsonx project** and note the project ID
3. **Update environment variables** in `backend/.env`
4. **Implement watsonx integration** in `backend/watsonx_integration.py`
5. **Set USE_WATSONX=true** to enable AI features

### Mock Mode

For development and testing, the app runs in mock mode (`USE_WATSONX=false`) which provides simple rule-based meal suggestions.

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/pantry` | List all pantry items |
| POST | `/pantry` | Add/update pantry item |
| DELETE | `/pantry/<id>` | Delete pantry item |
| POST | `/plan-meal` | Generate meal plan |

## 🎨 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Responsive design** with dark mode

### Backend
- **Flask** web framework
- **SQLAlchemy** ORM with SQLite
- **Flask-CORS** for cross-origin requests
- **IBM watsonx AI** integration ready

## 🔧 Development

### Frontend Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Backend Development
```bash
# With virtual environment activated
python app.py              # Start Flask server
python init_db.py          # Reset database
pip freeze > requirements.txt  # Update dependencies
```

## 🚀 Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or IBM Cloud
- Set environment variables for production
- Use PostgreSQL or other production database

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar platforms
- Set `NEXT_PUBLIC_API_BASE` to your backend URL
- Configure build settings for Next.js

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📝 License

This project is part of the IBM Hackathon and is for educational/demonstration purposes.

## 🆘 Troubleshooting

### Common Issues

1. **CORS errors:** Ensure Flask-CORS is installed and configured
2. **Database errors:** Run `python init_db.py` to reset database
3. **API connection failed:** Check that backend is running on port 5000
4. **Node modules issues:** Delete `node_modules` and run `npm install`

### Getting Help

- Check the console for error messages
- Verify both frontend and backend are running
- Ensure environment variables are set correctly
