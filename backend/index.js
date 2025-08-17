const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, '../db.json'); // Use root-level db.json

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions for database operations
const readDatabase = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Create db.json if it doesn't exist
      const initialData = { pantry: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { pantry: [] };
  }
};

const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Generate unique ID
const generateId = () => Date.now().toString();

// Pantry Routes

// GET /api/pantry - Fetch all pantry items
app.get('/api/pantry', (req, res) => {
  try {
    const db = readDatabase();
    res.json({
      success: true,
      data: db.pantry
    });
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pantry items'
    });
  }
});

// POST /api/pantry/add - Add a pantry item
app.post('/api/pantry/add', (req, res) => {
  try {
    const { name, quantity, unit, category, notes } = req.body;

    // Validation
    if (!name || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Name, quantity, and unit are required'
      });
    }

    const db = readDatabase();
    const newItem = {
      id: generateId(),
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit: unit.trim(),
      category: category || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.pantry.push(newItem);
    
    if (writeDatabase(db)) {
      res.json({
        success: true,
        data: newItem
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save pantry item'
      });
    }
  } catch (error) {
    console.error('Error adding pantry item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/pantry/update/:id - Update a pantry item
app.put('/api/pantry/update/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, category, notes } = req.body;

    const db = readDatabase();
    const itemIndex = db.pantry.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Pantry item not found'
      });
    }

    // Update only provided fields
    const item = db.pantry[itemIndex];
    if (name !== undefined) item.name = name.trim();
    if (quantity !== undefined) item.quantity = parseFloat(quantity);
    if (unit !== undefined) item.unit = unit.trim();
    if (category !== undefined) item.category = category;
    if (notes !== undefined) item.notes = notes;
    item.updatedAt = new Date().toISOString();

    if (writeDatabase(db)) {
      res.json({
        success: true,
        data: item
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update pantry item'
      });
    }
  } catch (error) {
    console.error('Error updating pantry item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/pantry/delete/:id - Delete a pantry item
app.delete('/api/pantry/delete/:id', (req, res) => {
  try {
    const { id } = req.params;

    const db = readDatabase();
    const initialLength = db.pantry.length;
    db.pantry = db.pantry.filter(item => item.id !== id);

    if (db.pantry.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Pantry item not found'
      });
    }

    if (writeDatabase(db)) {
      res.json({
        success: true,
        message: 'Pantry item deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete pantry item'
      });
    }
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// IBM Watsonx Integration

// Initialize Watsonx client
let watsonxClient = null;

const initializeWatsonx = () => {
  try {
    const authenticator = new IamAuthenticator({
      apikey: process.env.WATSONX_API_KEY,
    });

    watsonxClient = new WatsonXAI({
      authenticator,
      serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
      version: '2024-05-31', // Required version parameter
    });

    console.log('Watsonx client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Watsonx client:', error);
  }
};

// Initialize Watsonx on startup
if (process.env.WATSONX_API_KEY) {
  initializeWatsonx();
} else {
  console.warn('WATSONX_API_KEY not found. Watsonx features will be disabled.');
}

// POST /api/meal-plan - Generate meal plan using Watsonx
app.post('/api/meal-plan', async (req, res) => {
  try {
    // Extract cooking mode from request body
    const { cookingMode = 'home' } = req.body;
    
    // Read pantry items from database
    const db = readDatabase();
    const pantryItems = db.pantry;

    if (pantryItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No pantry items found. Please add some ingredients first.'
      });
    }

    // Function to generate fallback responses based on cooking mode
    const generateFallbackResponse = (mode, pantryItems) => {
      if (mode === 'professional') {
        return {
          meals: [
            {
              title: `Professional Asian-Style ${pantryItems[0]?.name || 'Vegetable'} Stir-Fry`,
              description: `A restaurant-quality stir-fry featuring ${pantryItems[0]?.name} with aromatic seasonings, wok hei technique, and a glossy umami-rich sauce`,
              ingredientsUsed: pantryItems.slice(0, 3).map(item => item.name),
              missingIngredients: ['light soy sauce', 'dark soy sauce', 'fresh garlic cloves', 'fresh ginger root', 'peanut oil', 'cornstarch'],
              steps: [
                'Prep all ingredients first (mise en place): wash and cut vegetables into uniform 1-inch pieces, ensuring similar cooking times',
                'Heat a carbon steel wok or large cast-iron skillet over high heat for 3-4 minutes until smoking hot (around 450°F)',
                'Add 2 tablespoons peanut oil and swirl immediately to coat the entire wok surface, oil should shimmer and move like water',
                'Add 3 minced garlic cloves and 1 tablespoon minced fresh ginger, stir-fry for 15-20 seconds until incredibly fragrant',
                `Immediately add ${pantryItems[0]?.name || 'main vegetables'} and toss vigorously using wok spatula and ladle technique for 2-3 minutes`,
                'Push ingredients to one side of wok, add remaining pantry vegetables to empty side, allowing them to sear for 1-2 minutes',
                'Combine all ingredients and add sauce mixture (2 tbsp light soy sauce, 1 tbsp dark soy sauce, 1 tsp cornstarch slurry)',
                'Toss everything together continuously for 60-90 seconds until sauce coats ingredients and becomes glossy',
                'Perform the \'wok hei\' technique: tilt wok slightly toward flame for 10-15 seconds to create that signature smoky flavor',
                'Taste for seasoning balance, adjust salt/soy sauce as needed, and immediately transfer to heated serving platter',
                'Serve piping hot within 30 seconds to preserve the crisp texture and vibrant colors'
              ],
              cookTime: '12 minutes',
              nutrition: {
                calories: 320,
                protein: '18g',
                carbs: '38g',
                fat: '14g'
              }
            }
          ],
          shoppingList: [
            { item: 'soy sauce (light & dark)', quantity: 2, unit: 'bottles' },
            { item: 'fresh garlic', quantity: 1, unit: 'head' },
            { item: 'fresh ginger', quantity: 1, unit: 'piece' },
            { item: 'peanut oil', quantity: 1, unit: 'bottle' }
          ]
        };
      } else {
        // Home Cook Mode
        return {
          meals: [
            {
              title: `Easy ${pantryItems[0]?.name || 'Vegetable'} Stir-Fry`,
              description: `A simple and delicious stir-fry using ${pantryItems[0]?.name} - perfect for a quick family dinner`,
              ingredientsUsed: pantryItems.slice(0, 3).map(item => item.name),
              missingIngredients: ['soy sauce', 'garlic', 'cooking oil'],
              steps: [
                `Wash and chop ${pantryItems[0]?.name || 'vegetables'} into bite-sized pieces`,
                'Heat 2 tbsp oil in a large pan over medium-high heat',
                'Add chopped garlic and cook for 30 seconds until fragrant',
                `Add ${pantryItems[0]?.name || 'vegetables'} to the pan and stir-fry for 3-4 minutes`,
                'Add remaining pantry ingredients and cook for 2-3 minutes more',
                'Pour in 2-3 tbsp soy sauce and stir everything together',
                'Cook for another 1-2 minutes until heated through and serve hot'
              ],
              cookTime: '10 minutes',
              nutrition: {
                calories: 280,
                protein: '15g',
                carbs: '30g',
                fat: '12g'
              }
            },
            {
              title: `Simple ${pantryItems[1]?.name || 'Pantry'} Soup`,
              description: `A comforting homemade soup using ${pantryItems[1]?.name || 'pantry ingredients'} that\'s easy to make`,
              ingredientsUsed: pantryItems.slice(1, 4).map(item => item.name),
              missingIngredients: ['broth', 'onion', 'salt', 'pepper'],
              steps: [
                'Chop 1 onion and any vegetables into small pieces',
                'Heat a large pot over medium heat and add a little oil',
                'Add chopped onion and cook for 3-4 minutes until soft',
                `Add ${pantryItems[1]?.name || 'main ingredients'} and cook for 2 minutes`,
                'Pour in 4 cups of broth and bring to a boil',
                'Reduce heat and simmer for 15-20 minutes until vegetables are tender',
                'Season with salt and pepper to taste and serve hot'
              ],
              cookTime: '25 minutes',
              nutrition: {
                calories: 180,
                protein: '8g',
                carbs: '25g',
                fat: '5g'
              }
            }
          ],
          shoppingList: [
            { item: 'soy sauce', quantity: 1, unit: 'bottle' },
            { item: 'garlic', quantity: 1, unit: 'head' },
            { item: 'broth', quantity: 4, unit: 'cups' },
            { item: 'onion', quantity: 1, unit: 'medium' }
          ]
        };
      }
    };

    // Check if Watsonx is available
    if (!watsonxClient || !process.env.WATSONX_PROJECT_ID) {
      // Generate fallback response based on cooking mode
      const mockResponse = generateFallbackResponse(cookingMode, pantryItems);

      return res.json({
        success: true,
        data: mockResponse,
        note: `Using ${cookingMode} mode fallback - Watsonx not configured`
      });
    }

    // Build structured pantry context for Watsonx
    const pantryList = pantryItems
      .map(item => `${item.name} (${item.quantity} ${item.unit})`)
      .join(', ');

    // Function to generate mode-specific prompts
    const generateSystemPrompt = (mode, pantryList) => {
      if (mode === 'professional') {
        return `You are a professional chef and nutritionist with 20+ years of culinary experience.
Create 3 detailed, restaurant-quality recipes using PRIMARILY these pantry items: ${pantryList}.

🍳 PROFESSIONAL MODE REQUIREMENTS:
1. Each recipe MUST have 8-12 DETAILED cooking steps with exact temperatures, times, and professional techniques
2. Include precise preparation instructions (julienne, brunoise, sauté, braise, simmer, deglaze, reduce, etc.)
3. Specify exact cooking temperatures, pan sizes, and timing for each step
4. Include visual and sensory cues for doneness (golden brown, fragrant, tender-crisp, etc.)
5. Add advanced techniques and plating suggestions for restaurant presentation
6. Include professional tips for texture, flavor development, and flavor balance

EXAMPLE of DETAILED professional steps:
"Heat 2 tablespoons extra-virgin olive oil in a 12-inch heavy-bottomed skillet over medium-high heat until shimmering (about 375°F)"
"Add finely diced yellow onion (1/4-inch dice) and sauté for 4-5 minutes, stirring occasionally, until edges are golden and onion is translucent"
"Deglaze with 1/2 cup white wine, scraping up fond with wooden spoon, reduce by half (about 2 minutes)"
"Remove from heat, vigorously stir in cold butter to create a glossy emulsion (monte au beurre technique)"

Respond STRICTLY in JSON following this exact schema:

{
  "meals": [
    {
      "title": "Professional Recipe Name",
      "description": "Detailed description with advanced cooking method and flavor profile",
      "ingredientsUsed": ["ingredient1", "ingredient2"],
      "missingIngredients": ["missing1 with quantity", "missing2 with quantity"],
      "steps": [
        "Step 1: Precise preparation with measurements and technique",
        "Step 2: Exact cooking instruction with temperature and time",
        "Step 3: Visual and sensory cues with professional techniques",
        "Continue with 8-12 total detailed steps"
      ],
      "cookTime": "X minutes (realistic for complexity)",
      "nutrition": {
        "calories": 400,
        "protein": "25g",
        "carbs": "45g",
        "fat": "15g"
      }
    }
  ],
  "shoppingList": [
    {
      "item": "specific ingredient name",
      "quantity": 2,
      "unit": "cups"
    }
  ]
}

Create restaurant-quality recipes with professional culinary techniques. Focus on advanced techniques, precise timing, and professional presentation.`;
      } else {
        // Home Cook Mode
        return `You are a helpful recipe assistant for home cooking.
Create 3 simple and beginner-friendly recipes using PRIMARILY these pantry items: ${pantryList}.

🍳 HOME COOK MODE REQUIREMENTS:
1. Each recipe should have 6-7 simple, easy-to-follow steps
2. Use everyday measurements (cups, tsp, tbsp) instead of grams
3. Keep instructions short and use simple cooking terms (boil, fry, stir, mix, cook)
4. Focus on ease, speed, and common kitchen tools that home cooks have
5. Make recipes clear for someone cooking at home without professional equipment
6. Prioritize comfort food and family-friendly flavors

EXAMPLE of SIMPLE home cook steps:
"Heat 2 tbsp oil in a large pan over medium heat"
"Add chopped onion and cook for 3-4 minutes until soft"
"Stir in rice and cook for 2 minutes"
"Add 2 cups of broth and bring to a boil"
"Cover and simmer for 15 minutes until rice is tender"

Respond STRICTLY in JSON following this exact schema:

{
  "meals": [
    {
      "title": "Simple Recipe Name",
      "description": "Easy home-style dish description",
      "ingredientsUsed": ["ingredient1", "ingredient2"],
      "missingIngredients": ["missing1", "missing2"],
      "steps": [
        "Step 1: Simple preparation",
        "Step 2: Easy cooking instruction",
        "Step 3: Continue with 6-7 total simple steps"
      ],
      "cookTime": "X minutes",
      "nutrition": {
        "calories": 300,
        "protein": "15g",
        "carbs": "35g",
        "fat": "10g"
      }
    }
  ],
  "shoppingList": [
    {
      "item": "ingredient name",
      "quantity": 1,
      "unit": "piece"
    }
  ]
}

Create simple, beginner-friendly recipes perfect for home cooking. Focus on ease, speed, and using common kitchen tools.`;
      }
    };

    // Generate the appropriate system prompt based on cooking mode
    const systemPrompt = generateSystemPrompt(cookingMode, pantryList);

    console.log(`Calling Watsonx with ${cookingMode} mode prompt...`);

    console.log('Calling Watsonx with enhanced prompt...');

    // Call Watsonx with improved parameters
    const watsonxParams = {
      projectId: process.env.WATSONX_PROJECT_ID,
      modelId: 'meta-llama/llama-3-70b-instruct', // Updated to a more supported model
      input: systemPrompt,
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: 3000, // Increased for very detailed responses
        temperature: 0.1, // Very low for consistent, detailed structure
        stop_sequences: ['\n\n\n', '```', 'Human:', 'Assistant:'] // Stop at multiple newlines or code blocks
      }
    };

    const response = await watsonxClient.generateText(watsonxParams);
    
    if (response.result?.results?.[0]?.generated_text) {
      let generatedText = response.result.results[0].generated_text.trim();
      
      // Clean up the response text
      if (generatedText.includes('```json')) {
        generatedText = generatedText.split('```json')[1].split('```')[0].trim();
      }
      
      // Ensure the JSON is properly closed
      if (!generatedText.endsWith('}')) {
        // Try to fix incomplete JSON
        const openBraces = (generatedText.match(/{/g) || []).length;
        const closeBraces = (generatedText.match(/}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        for (let i = 0; i < missingBraces; i++) {
          generatedText += '}';
        }
      }

      try {
        const parsedResponse = JSON.parse(generatedText);
        
        // Validate and sanitize the response structure
        const sanitizedResponse = {
          meals: Array.isArray(parsedResponse.meals) ? parsedResponse.meals.map(meal => ({
            title: meal.title || 'Untitled Meal',
            description: meal.description || 'Delicious meal using your pantry items',
            ingredientsUsed: Array.isArray(meal.ingredientsUsed) ? meal.ingredientsUsed : [],
            missingIngredients: Array.isArray(meal.missingIngredients) ? meal.missingIngredients : [],
            steps: Array.isArray(meal.steps) ? meal.steps : ['Prepare ingredients', 'Cook according to recipe', 'Serve and enjoy'],
            cookTime: meal.cookTime || '30 minutes',
            nutrition: {
              calories: meal.nutrition?.calories || 300,
              protein: meal.nutrition?.protein || '15g',
              carbs: meal.nutrition?.carbs || '35g',
              fat: meal.nutrition?.fat || '10g'
            }
          })) : [],
          shoppingList: Array.isArray(parsedResponse.shoppingList) ? parsedResponse.shoppingList.map(item => ({
            item: item.item || 'Unknown item',
            quantity: item.quantity || 1,
            unit: item.unit || 'piece'
          })) : []
        };

        // Ensure we have at least some meals
        if (sanitizedResponse.meals.length === 0) {
          throw new Error('No meals generated');
        }

        res.json({
          success: true,
          data: sanitizedResponse
        });

      } catch (parseError) {
        console.error('Error parsing Watsonx response:', parseError);
        console.error('Raw response:', generatedText);
        
        // Return structured fallback response with detailed cooking steps
        const fallbackResponse = {
          meals: pantryItems.slice(0, 3).map((item, index) => ({
            title: `Chef's Professional ${item.name} Preparation`,
            description: `An expertly crafted dish featuring ${item.name} using classical French cooking techniques for optimal flavor development and texture`,
            ingredientsUsed: [item.name, ...(pantryItems.slice(1, 3).map(i => i.name))],
            missingIngredients: ['kosher salt', 'freshly ground black pepper', 'extra-virgin olive oil', 'fresh garlic cloves', 'unsalted butter'],
            steps: [
              `Begin mise en place: wash and thoroughly dry ${item.name}, then prep by cutting into uniform pieces (1-inch cubes for vegetables, appropriate size for proteins)`,
              'Heat a 12-inch heavy-bottomed stainless steel or cast-iron pan over medium-high heat for 2-3 minutes until a drop of water sizzles and evaporates immediately',
              'Add 2 tablespoons extra-virgin olive oil and swirl to coat evenly, heating until oil shimmers but doesn\'t smoke (about 375°F)',
              'Add 2-3 minced garlic cloves and sauté for 30-45 seconds, stirring constantly with wooden spoon until aromatic but not browned',
              `Carefully add prepared ${item.name} to the hot pan in a single layer, avoiding overcrowding (work in batches if necessary)`,
              `Allow to sear undisturbed for 2-3 minutes to develop golden caramelization, then stir gently and continue cooking for ${4 + index * 2} minutes`,
              'Season generously with kosher salt and freshly cracked black pepper, tasting frequently and adjusting seasoning as needed',
              `Add any additional pantry ingredients and cook for another ${3 + index} minutes, stirring occasionally to prevent sticking`,
              'Remove pan from heat and finish with 1 tablespoon cold unsalted butter, swirling to create a glossy emulsion',
              'Let rest for 2-3 minutes to allow residual heat to finish cooking and flavors to meld',
              'Taste one final time for seasoning balance, adjust if needed, and serve immediately on warmed plates',
              'Garnish with a drizzle of good olive oil and fresh herbs if available for restaurant-quality presentation'
            ],
            cookTime: `${18 + index * 3} minutes`,
            nutrition: {
              calories: 280 + index * 40,
              protein: `${12 + index * 4}g`,
              carbs: `${22 + index * 6}g`,
              fat: `${14 + index * 2}g`
            }
          })),
          shoppingList: [
            { item: 'kosher salt', quantity: 1, unit: 'container' },
            { item: 'black peppercorns', quantity: 1, unit: 'container' },
            { item: 'extra-virgin olive oil', quantity: 1, unit: 'bottle' },
            { item: 'fresh garlic', quantity: 1, unit: 'head' },
            { item: 'unsalted butter', quantity: 1, unit: 'stick' }
          ]
        };

        res.json({
          success: true,
          data: fallbackResponse,
          note: 'Fallback response due to parsing error',
          error: parseError.message
        });
      }
    } else {
      throw new Error('No response from Watsonx');
    }

  } catch (error) {
    console.error('Error generating meal plan:', error);
    
    // Enhanced fallback response for any errors
    const db = readDatabase();
    const pantryItems = db.pantry;
    
    const errorFallbackResponse = {
      meals: [
        {
          title: 'Chef\'s Emergency Pantry Creation',
          description: 'A expertly crafted meal using your available pantry ingredients with professional techniques',
          ingredientsUsed: pantryItems.slice(0, 2).map(item => item.name),
          missingIngredients: ['olive oil', 'salt', 'black pepper', 'garlic'],
          steps: [
            'Start by taking inventory of your ingredients and washing any fresh items thoroughly',
            'Heat 2-3 tablespoons of olive oil in your largest pan over medium heat (about 300-325°F)',
            'While oil heats, prep your ingredients: dice vegetables uniformly, measure grains or legumes',
            'Test oil temperature by dropping in a small piece - it should sizzle gently without smoking',
            `Add your main ingredient (${pantryItems[0]?.name || 'pantry item'}) and cook for 3-5 minutes until beginning to soften`,
            'Season with salt and pepper, tasting as you go to build layers of flavor',
            `Incorporate additional ingredients (${pantryItems[1]?.name || 'secondary items'}) and cook for 5-8 minutes more`,
            'Add minced garlic in the last 2 minutes to prevent burning and maintain fresh flavor',
            'Adjust heat as needed to prevent sticking, and stir regularly for even cooking',
            'Taste and adjust final seasoning, then serve immediately while hot and fresh'
          ],
          cookTime: '25 minutes',
          nutrition: {
            calories: 300,
            protein: '15g',
            carbs: '40g',
            fat: '10g'
          }
        }
      ],
      shoppingList: [
        { item: 'olive oil', quantity: 1, unit: 'bottle' },
        { item: 'salt', quantity: 1, unit: 'container' },
        { item: 'black pepper', quantity: 1, unit: 'container' },
        { item: 'fresh garlic', quantity: 1, unit: 'head' }
      ]
    };

    res.json({
      success: true,
      data: errorFallbackResponse,
      note: 'Fallback response due to API error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    pantryItems: readDatabase().pantry.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📁 Database file: ${DB_FILE}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  
  // Check if database file exists and show current data
  const db = readDatabase();
  console.log(`📊 Current pantry items: ${db.pantry.length}`);
});

module.exports = app;
