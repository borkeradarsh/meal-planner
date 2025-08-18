# Pantry AI Meal Planner

A Next.js 14 application that uses IBM watsonx.ai to generate meal plans based on your pantry items.

## Features

- **Smart Meal Planning**: Uses IBM watsonx.ai to suggest meals based on your available ingredients
- **Pantry Management**: Add, remove, and track your pantry items
- **Shopping Lists**: Get suggestions for missing ingredients
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 14 or higher
- An IBM Cloud account with access to watsonx.ai
- A watsonx.ai project

### Setup

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and replace the placeholder values:
   ```env
   # IBM watsonx Configuration
   WATSONX_API_KEY=your_actual_api_key_here
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   WATSONX_PROJECT_ID=your_actual_project_id_here
   ```

4. **Get your IBM watsonx credentials**
   
   **API Key:**
   - Go to [IBM Cloud API Keys](https://cloud.ibm.com/iam/apikeys)
   - Create a new API key or use an existing one
   
   **Project ID:**
   - Go to [watsonx.ai](https://dataplatform.cloud.ibm.com/wx/home)
   - Open your project
   - The project ID is in the URL or project settings
   
   **Service URL:**
   - Use the appropriate region URL:
     - US South: `https://us-south.ml.cloud.ibm.com`
     - US East: `https://us-east.ml.cloud.ibm.com`
     - EU Germany: `https://eu-de.ml.cloud.ibm.com`
     - EU UK: `https://eu-gb.ml.cloud.ibm.com`
     - Japan: `https://jp-tok.ml.cloud.ibm.com`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Add Pantry Items**: Use the form to add ingredients with quantities and units
2. **Generate Meal Plan**: Click "Generate Meal Plan" to get AI-powered suggestions
3. **View Results**: See meal suggestions and shopping lists for missing ingredients
4. **Manage Items**: Remove items or clear all pantry items as needed

## Mock Mode

If watsonx.ai credentials are not configured, the app will run in mock mode with sample responses. This allows you to test the UI without setting up the API.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **AI**: IBM watsonx.ai (Granite 13B Chat model)
- **Authentication**: IBM Cloud IAM
- **Development**: Hot reload, TypeScript support

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── meal-plan/     # Meal planning API
│   ├── layout.js          # Root layout
│   └── page.js            # Main page component
├── lib/                   # Utility libraries
│   ├── watsonx.js        # watsonx.ai integration
│   └── mealPlan.js       # Meal planning utilities
├── styles/               # CSS styles
│   └── globals.css       # Global styles with Tailwind
└── public/               # Static assets
```

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `WATSONX_API_KEY` | IBM Cloud API key | `your_api_key` |
| `WATSONX_URL` | watsonx.ai service URL | `https://us-south.ml.cloud.ibm.com` |
| `WATSONX_PROJECT_ID` | Your watsonx.ai project ID | `your_project_id` |

### Model Configuration

The app uses the `ibm/granite-13b-chat-v2` model with these parameters:
- **Max tokens**: 300
- **Temperature**: 0.7
- **Stop sequences**: `['\n\n']`
- **Repetition penalty**: 1.1

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Adding New Features

1. **New AI Models**: Update `modelId` in `lib/watsonx.js`
2. **UI Components**: Add to `app/page.js` or create new components
3. **API Routes**: Add new routes in `app/api/`
4. **Styling**: Modify `styles/globals.css` or use Tailwind classes

## Troubleshooting

### Common Issues

1. **"Invalid value for AUTH_TYPE: container"**
   - Ensure your `WATSONX_API_KEY` is correctly set
   - Check that the API key has proper permissions

2. **"Module not found" errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear Next.js cache: `rm -rf .next`

3. **API connection issues**
   - Verify your `WATSONX_URL` matches your region
   - Check that your project ID exists and is accessible

### Debug Mode

Enable debug logging by checking the browser console. The app logs all API calls and responses.

## License

This project is licensed under the MIT License.

## Support

For issues with the watsonx.ai integration, refer to the [IBM watsonx.ai documentation](https://dataplatform.cloud.ibm.com/docs/content/wsj/getting-started/overview-wx.html).
