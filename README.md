# 🍽️ Pantry AI - Smart Meal Planning App - IBM Hackathon Project

An intelligent meal planning application that uses IBM Watsonx AI to generate personalized recipes based on your pantry ingredients. Choose between home cook mode for simple recipes or professional mode for detailed culinary instructions.

![Pantry AI Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Pantry+AI+Meal+Planner)

## ✨ Features

- 🤖 **AI-Powered Recipe Generation** - IBM Watsonx integration for intelligent meal suggestions
- 🏠 **Dual Cooking Modes** - Home cook (6-8 simple steps) and Professional (12-15 detailed steps)
- 📱 **Modern UI/UX** - Responsive design with dark/light mode support
- 🛒 **Smart Shopping Lists** - Auto-generated shopping lists for missing ingredients
- 📦 **Pantry Management** - Easy ingredient tracking with quantity management
- 🎨 **Beautiful Animations** - Smooth transitions powered by Framer Motion

## 🚀 Tech Stack

### Backend
- **Flask** - Python web framework
- **IBM Watsonx AI** - Advanced recipe generation
- **JSON Database** - Simple data storage for pantry items

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons

## 🛠️ Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 18+
- IBM Cloud account with Watsonx access

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd pantry-ai-app
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment setup
cp .env.example .env
# Edit .env with your IBM Watsonx credentials
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Configure your API endpoints
```

### 4. Get IBM Watsonx Credentials
1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create a Watson Machine Learning service
3. Get your API key from [IAM settings](https://cloud.ibm.com/iam/apikeys)
4. Create a project in Watson Studio and get the project ID
5. Update your backend `.env` file:

```env
WATSONX_API_KEY=your_ibm_cloud_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
```

### 5. Run the Application
```bash
# Start backend (from backend directory)
python main.py

# Start frontend (from frontend directory - new terminal)
npm run dev
```

Visit `http://localhost:3000` to see the application! 🎉

## 📁 Project Structure

```
pantry-ai-app/
├── backend/
│   ├── main.py              # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   ├── db.json             # Pantry data storage
│   ├── .env.example        # Environment template
│   └── README.md           # Backend documentation
├── frontend/
│   ├── app/                # Next.js App Router
│   │   ├── layout.js       # Root layout
│   │   ├── page.js         # Main application
│   │   └── api/            # API routes
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utility libraries
│   ├── styles/             # CSS styles
│   └── package.json        # Frontend dependencies
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🍳 Cooking Modes

### 🏠 Home Cook Mode
- **6-8 simple steps** per recipe
- **Basic techniques** and common ingredients
- **Time-efficient** cooking methods
- Perfect for **everyday meals**

### 👨‍🍳 Professional Mode
- **12-15 detailed steps** with precise techniques
- **Advanced culinary methods** and terminology
- **Restaurant-quality** plating instructions
- **Detailed timing** and temperature guidance

## 🔧 Configuration

### Backend Environment Variables
```env
# Flask Configuration
PORT=5000
FLASK_ENV=development
FLASK_DEBUG=True

# IBM Watsonx Configuration
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Security
SECRET_KEY=your_secret_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

## 🚀 Deployment

### Backend Deployment
1. **Heroku/Railway/DigitalOcean**: Use `main.py` as entry point
2. **Environment**: Set production environment variables
3. **Database**: Consider upgrading to PostgreSQL for production

### Frontend Deployment
1. **Vercel** (Recommended): Connect your GitHub repo
2. **Netlify**: Build command: `npm run build`
3. **Environment**: Configure `NEXT_PUBLIC_API_BASE` to your backend URL

## 📚 API Documentation

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/pantry` - Get all pantry items
- `POST /api/pantry` - Add new pantry item
- `PUT /api/pantry/{id}` - Update pantry item
- `DELETE /api/pantry/{id}` - Remove pantry item
- `POST /api/meal-plan` - Generate AI meal plan

### Request Examples
```javascript
// Generate meal plan
POST /api/meal-plan
{
  "cookingMode": "professional" // or "home"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/pantry-ai-app/issues)
- 📖 Docs: [GitHub Documentation](https://github.com/your-username/pantry-ai-app/wiki)

## 🙏 Acknowledgments

- [IBM Watsonx](https://www.ibm.com/watsonx) for AI capabilities
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

---

Made with ❤️ by [Your Name](https://github.com/your-username)
