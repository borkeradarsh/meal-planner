from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import Model
import re
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# File paths - using db.json for consistency with your existing data
PANTRY_FILE = "../db.json"  # Your existing db.json file
RECIPES_FILE = "recipes.json"

# IBM Watsonx configuration
WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")

# Initialize IBM Watsonx credentials
credentials = None
if WATSONX_API_KEY and WATSONX_PROJECT_ID:
    try:
        credentials = Credentials(
            api_key=WATSONX_API_KEY,
            url="https://us-south.ml.cloud.ibm.com"
        )
        logger.info("✅ IBM Watsonx credentials initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Watsonx credentials: {str(e)}")
        credentials = None
else:
    logger.warning("⚠️ WATSONX_API_KEY or WATSONX_PROJECT_ID not found in environment variables")

# Model configuration
model_id = "meta-llama/llama-3-70b-instruct"  # Updated to recommended model
home_parameters = {
    "max_new_tokens": 2500,
    "temperature": 0.2,
    "top_p": 0.9,
    "decoding_method": "greedy",
    "repetition_penalty": 1.0
}

professional_parameters = {
    "max_new_tokens": 2800,
    "temperature": 0.15,
    "top_p": 0.9,
    "decoding_method": "greedy",
    "repetition_penalty": 1.0
}

def load_pantry():
    """Load pantry data from db.json file."""
    try:
        if os.path.exists(PANTRY_FILE):
            with open(PANTRY_FILE, "r", encoding='utf-8') as f:
                data = json.load(f)
                return data.get("pantry", [])
        return []
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error loading pantry data: {str(e)}")
        return []

def save_pantry(pantry_data):
    """Save pantry data to db.json file."""
    try:
        # Read existing data
        data = {"pantry": []}
        if os.path.exists(PANTRY_FILE):
            with open(PANTRY_FILE, "r", encoding='utf-8') as f:
                data = json.load(f)
        
        # Update pantry data
        data["pantry"] = pantry_data
        
        # Save back to file
        with open(PANTRY_FILE, "w", encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Pantry data saved successfully. Items count: {len(pantry_data)}")
    except Exception as e:
        logger.error(f"Error saving pantry data: {str(e)}")
        raise

def save_recipe(recipe, mode):
    """Save recipe data with error handling."""
    try:
        recipes = []
        if os.path.exists(RECIPES_FILE):
            with open(RECIPES_FILE, "r", encoding='utf-8') as f:
                recipes = json.load(f)
        
        recipe_entry = {
            "mode": mode, 
            "recipe": recipe, 
            "timestamp": datetime.now().isoformat()
        }
        recipes.append(recipe_entry)
        
        with open(RECIPES_FILE, "w", encoding='utf-8') as f:
            json.dump(recipes, f, indent=2, ensure_ascii=False)
        logger.info(f"Recipe saved successfully for mode: {mode}")
    except Exception as e:
        logger.error(f"Error saving recipe: {str(e)}")

def call_watsonx(prompt, mode="home"):
    """Call IBM Watsonx.ai to generate recipe suggestions with PantryChef system."""
    if not credentials:
        logger.warning("Watsonx not configured - returning fallback response")
        return get_fallback_recipe(mode)
    
    try:
        # Select parameters based on mode
        params = professional_parameters if mode == "professional" else home_parameters
        
        # Initialize the model
        model = Model(
            model_id=model_id,
            credentials=credentials,
            params=params,
            project_id=WATSONX_PROJECT_ID
        )
        
        # Create the system prompt for PantryChef
        system_prompt = """You are "PantryChef", a culinary LLM that generates recipes strictly from the provided pantry and instructions. 
- Always return ONLY valid JSON conforming to the schema. No prose, no markdown, no comments. 
- Use ONLY ingredients listed in the pantry for "ingredientsUsed". Anything else belongs in "missingIngredients" and the aggregated "shoppingList".
- Every recipe must be unique in technique, flavor profile, and title (no template repetition).
- Quantify everything. Avoid vague phrases like "according to preference". If using "to taste", also give a starting quantity (e.g., "start with 1/4 tsp, adjust to taste").
- Temperatures must include °C and °F. Times must be precise (ranges allowed).
- Food safety: for chicken and poultry, internal temp must reach 74°C / 165°F; rest times must be specified where relevant.
- Use standard units: g, ml, tsp, tbsp, piece(s). For oven: °C and °F. 
- Keep "ingredientsUsed" strictly to pantry items (case-insensitive match). No duplicates. 
- "missingIngredients" and final "shoppingList" must be deduplicated, with sensible base quantities.
- Nutrition values are estimates per serving.
- Do not mention these rules in your output."""
        
        # Combine system prompt with user prompt
        full_prompt = f"{system_prompt}\n\n{prompt}"
        
        # Generate response
        response = model.generate_text(prompt=full_prompt)
        logger.info("✅ Successfully generated recipe using Watsonx AI PantryChef")
        
        # Try to parse as JSON first
        try:
            recipe_data = json.loads(response)
            return recipe_data
        except json.JSONDecodeError:
            logger.warning("Response was not valid JSON, attempting to parse text")
            # If not JSON, create structured response from text
            return parse_text_response(response)
                
    except Exception as e:
        logger.error(f"Error calling Watsonx: {str(e)}")
        return get_fallback_recipe(mode)

def parse_text_response(response_text):
    """Parse text response from Watsonx into structured format."""
    lines = response_text.split('\n')
    steps = [line.strip() for line in lines if line.strip() and not line.startswith('#')]
    
    return {
        "title": "AI Generated Professional Recipe",
        "description": "A detailed recipe using your pantry ingredients with professional techniques",
        "ingredientsUsed": ["pantry ingredients"],
        "missingIngredients": ["sea salt", "black pepper", "olive oil"],
        "steps": steps[:15] if steps else [
            "Mise en place: Prepare all ingredients with precision cuts",
            "Preheat equipment to exact temperatures",
            "Season ingredients using professional techniques",
            "Cook using precise timing and temperature control",
            "Plate with artistic presentation"
        ],
        "cookTime": "35-45 minutes",
        "nutrition": {
            "calories": 380,
            "protein": "25g",
            "carbs": "28g", 
            "fat": "16g"
        }
    }

def get_fallback_recipe(mode="home"):
    """Generate fallback recipe when Watsonx is unavailable."""
    if mode == "professional":
        return {
            "recipes": [{
                "title": "Professional Pan-Seared Creation",
                "description": "A restaurant-quality dish showcasing advanced culinary techniques with precise execution",
                "cookTime": "35-45 minutes",
                "servings": 2,
                "ingredientsUsed": ["pantry selections"],
                "missingIngredients": ["flaky sea salt", "extra virgin olive oil", "fresh thyme", "garlic"],
                "nutrition": {"calories": 420, "protein": "28g", "carbs": "25g", "fat": "18g"},
                "steps": [
                    "Mise en place: Remove proteins from refrigeration 25 minutes before cooking",
                    "Preheat heavy-bottom sauté pan to 375°F using infrared thermometer",
                    "Season proteins with kosher salt, let cure for 5 minutes",
                    "Create aromatic oil with EVOO, garlic, and thyme",
                    "Sear proteins 3-4 minutes undisturbed for Maillard reaction",
                    "Flip and baste with aromatic oil for 2-3 minutes",
                    "Monitor internal temperature with instant-read thermometer",
                    "Rest proteins 5-7 minutes for juice redistribution",
                    "Deglaze pan and create pan sauce",
                    "Plate with precision and artistic presentation"
                ],
                "technique": "pan-searing with basting"
            }],
            "shoppingList": [
                {"item": "flaky sea salt", "quantity": 1, "unit": "container"},
                {"item": "extra virgin olive oil", "quantity": 1, "unit": "bottle"},
                {"item": "fresh thyme", "quantity": 1, "unit": "bunch"}
            ]
        }
    else:
        return {
            "recipes": [
                {
                    "title": "Simple Home-Style Skillet",
                    "description": "A quick and delicious one-pan meal perfect for weeknight dinners",
                    "cookTime": "20-25 minutes",
                    "servings": 2,
                    "ingredientsUsed": ["pantry staples"],
                    "missingIngredients": ["olive oil", "salt", "pepper", "onion"],
                    "nutrition": {"calories": 300, "protein": "20g", "carbs": "30g", "fat": "15g"},
                    "steps": [
                        "Heat 2 tbsp olive oil in large skillet over medium heat",
                        "Add diced onion, cook 3-4 minutes until softened",
                        "Add main ingredients and stir to combine",
                        "Cook 10-12 minutes, stirring occasionally",
                        "Season with salt and pepper to taste",
                        "Serve hot and enjoy with family"
                    ],
                    "technique": "one-pan cooking"
                },
                {
                    "title": "Easy Comfort Bowl",
                    "description": "A warming and nutritious meal using simple techniques",
                    "cookTime": "15-20 minutes",
                    "servings": 2,
                    "ingredientsUsed": ["pantry ingredients"],
                    "missingIngredients": ["broth", "herbs", "lemon"],
                    "nutrition": {"calories": 280, "protein": "15g", "carbs": "32g", "fat": "8g"},
                    "steps": [
                        "Prepare all ingredients with simple cuts",
                        "Heat pot over medium heat with oil",
                        "Add ingredients and stir to combine",
                        "Add broth and bring to gentle simmer",
                        "Cook 12-15 minutes until tender",
                        "Season with herbs and finish with lemon"
                    ],
                    "technique": "simmering"
                }
            ],
            "shoppingList": [
                {"item": "olive oil", "quantity": 1, "unit": "bottle"},
                {"item": "salt", "quantity": 1, "unit": "container"},
                {"item": "pepper", "quantity": 1, "unit": "container"},
                {"item": "onion", "quantity": 2, "unit": "pieces"}
            ]
        }

def generate_home_mode_prompt(pantry_list, servings=2, dietary="", cuisine="", budget="", appliances="", skill_level=""):
    """Generate HOME mode prompt for PantryChef."""
    pantry_json = json.dumps([{"name": item.split(" (")[0], "quantity": item} for item in pantry_list.split(", ")])
    
    prompt = f"""TASK:
Generate at least 3 unique, family-friendly, beginner-approachable recipes using the pantry below. 
Style: HOME COOKING.
- Techniques: simple and reliable (stir-fry, bake, sauté, boil, grill, sheet-pan, one-pot).
- Steps: 6–10 clear, numbered steps per recipe with exact amounts, times, and temperatures where relevant.
- Equipment: common home kitchen tools.
- Flavoring: use pantry items first; introduce minimal missing ingredients to complete the dish.
- Include helpful cues: "until onions are translucent (3–4 min)", "simmer gently (do not boil)".
- Provide plating ideas without being fussy.

USER INPUT:
- Pantry (case-insensitive names; include quantities if present):
{pantry_json}

- Servings per recipe: {servings}
- Dietary notes (optional): {dietary}
- Cuisine preference (optional): {cuisine}
- Budget level (optional): {budget}
- Available appliances (optional): {appliances}
- Skill level (optional): {skill_level}

CONSTRAINTS:
- Each recipe must select a subset of the pantry as "ingredientsUsed". Do not include anything not in pantry there.
- Anything not in pantry appears in "missingIngredients" and contributes to aggregated "shoppingList".
- Ensure titles and techniques differ across recipes (e.g., one sheet-pan, one one-pot, one skillet).
- Quantify finishes (e.g., "start with 1/4 tsp salt, adjust to taste").
- Chicken (if used) must achieve 74°C / 165°F internal.
- Return ONLY valid JSON that matches the schema (no extra text).

VALIDATION:
- Cross-check: every entry in "ingredientsUsed" MUST exist in the provided pantry (case-insensitive). 
- Reject placeholders like "main ingredients", "season according to preference". Replace with quantified items.

Expected JSON Schema:
{{
  "recipes": [
    {{
      "title": "Recipe Name",
      "description": "Brief description",
      "cookTime": "X-Y minutes",
      "servings": {servings},
      "ingredientsUsed": ["pantry item 1", "pantry item 2"],
      "missingIngredients": ["missing item 1", "missing item 2"],
      "nutrition": {{"calories": 300, "protein": "20g", "carbs": "30g", "fat": "15g"}},
      "steps": ["Step 1 with details", "Step 2 with details"],
      "technique": "cooking method used"
    }}
  ],
  "shoppingList": [
    {{"item": "missing ingredient", "quantity": 1, "unit": "piece"}}
  ]
}}"""
    
    return prompt

def generate_professional_mode_prompt(pantry_list, servings=2, dietary="", cuisine="", budget="", appliances="", skill_level=""):
    """Generate PROFESSIONAL mode prompt for PantryChef."""
    pantry_json = json.dumps([{"name": item.split(" (")[0], "quantity": item} for item in pantry_list.split(", ")])
    
    prompt = f"""TASK:
Generate at least 3 unique, chef-level recipes using the pantry below.
Style: PROFESSIONAL KITCHEN.
- Techniques: classical and modern: mise en place, sear/baste, reduction, pan sauces, emulsions, confit, sous-vide (if plausible), gastrique, beurre monté, mantecatura, deglazing, resting, carving bias, etc.
- Steps: 10–16 precise, numbered steps per recipe with exact timings, temperatures (°C/°F), pan sizes, and sensory cues (fond development, nappe consistency, shimmering oil).
- Emphasize consistent seasoning methodology (e.g., 1% salt by weight for proteins), temperature control, and plating discipline (height, negative space).
- Include finishing: mounting with butter, resting rules, internal temps (poultry 74°C/165°F), reduction ratios, pass sauces through fine mesh, wiping plate rims.
- Wine pairing guidance: optional, brief, appropriate.
- Presentations should be elegant but achievable for an advanced home cook.

USER INPUT:
- Pantry (case-insensitive names; include quantities if present):
{pantry_json}

- Servings per recipe: {servings}
- Dietary notes (optional): {dietary}
- Cuisine preference (optional): {cuisine}
- Budget level (optional): {budget}
- Available appliances (optional): {appliances}
- Skill level (optional): {skill_level}

CONSTRAINTS:
- "ingredientsUsed" strictly from pantry; all else into "missingIngredients" and aggregated "shoppingList".
- Each recipe must use a distinct technique and flavor direction (e.g., pan-sear with pan sauce, low-temp confit/sous-vide, reduction/emulsion-based plating).
- Provide pan sizes (e.g., 12-inch skillet), heat descriptors with temps (e.g., medium-high, oil shimmering ~190°C/375°F).
- Specify reduction endpoints (e.g., "reduce by 70% to nappe consistency, 3–5 min").
- Mandatory poultry safety: 74°C/165°F internal; rest times stated.
- Return ONLY valid JSON matching the schema.

VALIDATION:
- Cross-check: every entry in "ingredientsUsed" MUST exist in the provided pantry (case-insensitive). 
- Reject placeholders like "main ingredients", "season according to preference". Replace with quantified items.

Expected JSON Schema:
{{
  "recipes": [
    {{
      "title": "Professional Recipe Name",
      "description": "Restaurant-quality description",
      "cookTime": "X-Y minutes",
      "servings": {servings},
      "ingredientsUsed": ["pantry item 1", "pantry item 2"],
      "missingIngredients": ["professional ingredient 1", "professional ingredient 2"],
      "nutrition": {{"calories": 420, "protein": "28g", "carbs": "25g", "fat": "18g"}},
      "steps": ["Step 1 with precise details", "Step 2 with exact temps"],
      "technique": "professional cooking method",
      "winePariring": "optional wine suggestion"
    }}
  ],
  "shoppingList": [
    {{"item": "professional ingredient", "quantity": 1, "unit": "piece"}}
  ]
}}"""
    
    return prompt
    """Generate detailed mock recipe data when Watsonx is not available."""
    is_professional = "professional" in prompt.lower() or "michelin" in prompt.lower()
    
    if is_professional:
        return {
            "title": "Chef's Signature Pan-Seared Creation",
            "description": "A restaurant-quality dish showcasing advanced culinary techniques with precise execution and artistic presentation",
            "ingredientsUsed": ["pantry selections", "premium proteins"],
            "missingIngredients": ["flaky sea salt", "cracked tellicherry pepper", "extra virgin olive oil", "microgreens", "truffle oil"],
            "steps": [
                "Mise en place: Remove all proteins from refrigeration 25 minutes before cooking to achieve room temperature",
                "Preheat heavy-bottom sauté pan (preferably cast iron) to 375°F using infrared thermometer",
                "Season proteins with kosher salt using 1 tsp per pound, let cure for 5 minutes to draw surface moisture",
                "Create aromatic oil: combine 2 tbsp EVOO, 1 minced garlic clove, 1 tsp fresh thyme leaves",
                "Add 1 tbsp neutral oil (grapeseed or canola) to preheated pan, swirl to achieve even coating",
                "Gently place proteins in pan away from body, sear 3-4 minutes undisturbed for proper Maillard reaction",
                "Using fish spatula or tongs, flip proteins when golden crust forms, cook reverse side 2-3 minutes",
                "Baste continuously with aromatic oil using large spoon, tilting pan for oil pool",
                "Monitor internal temperature: 125°F for medium-rare, 135°F for medium doneness using instant-read thermometer",
                "Transfer to warm plate, tent with foil, rest 5-7 minutes for juice redistribution",
                "Deglaze pan with 2 tbsp white wine, reduce by half while scraping fond with wooden spoon",
                "Mount sauce with 1 tbsp cold butter using figure-8 motion for glossy emulsion",
                "Plate using offset spatula for clean lines, sauce dots around protein using squeeze bottle",
                "Garnish with microgreens placed strategically using tweezers for height and color contrast",
                "Finish with 3-4 drops truffle oil and flaky sea salt, serve on warmed plates immediately"
            ],
            "cookTime": "35-45 minutes (including prep and rest time)",
            "nutrition": {
                "calories": 420,
                "protein": "28g",
                "carbs": "12g",
                "fat": "32g"
            }
        }
    else:
        return {
            "title": "Simple Home-Style Comfort Bowl",
            "description": "A delicious and easy meal perfect for weeknight family dinner using simple techniques",
            "ingredientsUsed": ["pantry staples", "fresh ingredients"],
            "missingIngredients": ["salt", "pepper", "cooking oil", "onion"],
            "steps": [
                "Wash and prep all ingredients - chop into bite-sized pieces",
                "Heat 2 tablespoons oil in a large skillet over medium heat",
                "Add onion and cook for 3-4 minutes until softened",
                "Add main ingredients to the pan and stir to combine",
                "Cook for 10-12 minutes, stirring occasionally",
                "Season with salt and pepper to taste",
                "Serve hot in bowls and enjoy with family"
            ],
            "cookTime": "20-25 minutes",
            "nutrition": {
                "calories": 300,
                "protein": "15g",
                "carbs": "30g",
                "fat": "10g"
            }
        }

def generate_meal_plan_mock(ingredients, cooking_mode):
    """Generate mock meal plan data."""
    ingredients_list = [item.get('name', '') for item in ingredients[:3]]
    
    if cooking_mode == "professional":
        return [
            {
                "title": f"Pan-Seared {ingredients_list[0]} with Herb Oil",
                "description": "A restaurant-quality dish featuring precision cooking techniques and professional presentation",
                "cookTime": "35 minutes",
                "ingredientsUsed": ingredients_list,
                "missingIngredients": ["extra virgin olive oil", "fresh thyme", "garlic", "sea salt", "cracked black pepper"],
                "nutrition": {"calories": 420, "protein": "32g", "fat": "18g", "carbs": "28g"},
                "steps": [
                    "Mise en place: Remove protein from refrigeration 20 minutes before cooking to reach room temperature",
                    "Preheat cast iron skillet to 400°F (204°C) over medium-high heat for 3-4 minutes",
                    "Season protein generously with sea salt and cracked pepper, let rest 5 minutes",
                    "Create herb oil: Combine 2 tbsp EVOO, 1 tsp minced garlic, 1 tbsp fresh thyme in small bowl",
                    "Add 1 tbsp neutral oil to hot pan, swirl to coat evenly",
                    "Sear protein 3-4 minutes first side until golden crust forms (don't move during searing)",
                    "Flip using tongs, sear reverse side 2-3 minutes, baste with herb oil using spoon",
                    "Check internal temperature: 145°F for medium doneness, adjust timing accordingly",
                    "Rest protein on warm plate tented with foil for 5 minutes to redistribute juices",
                    "Finish with microgreens and drizzle remaining herb oil in artistic pattern",
                    "Serve immediately on warmed plates with accompaniments arranged using tweezers"
                ],
                "shoppingList": ["extra virgin olive oil", "fresh thyme", "garlic", "sea salt", "cracked black pepper"]
            },
            {
                "title": f"Confit {ingredients_list[1]} with Wine Reduction",
                "description": "Low-temperature cooking technique creating tender, flavorful results with professional precision",
                "cookTime": "45 minutes",
                "ingredientsUsed": ingredients_list[1:],
                "missingIngredients": ["duck fat", "bay leaves", "white wine", "shallots"],
                "nutrition": {"calories": 380, "protein": "24g", "fat": "22g", "carbs": "18g"},
                "steps": [
                    "Prep vegetables with precise brunoise cut (1/8 inch dice) for even cooking",
                    "Create aromatic sachet: tie bay leaves, peppercorns, thyme in cheesecloth",
                    "Heat duck fat to exactly 140°F (60°C) using instant-read thermometer",
                    "Season vegetables with coarse salt, let cure 10 minutes to draw moisture",
                    "Submerge vegetables in duck fat with aromatic sachet, maintain temperature",
                    "Cook low and slow for 25-30 minutes until fork-tender but still holding shape",
                    "Meanwhile, reduce white wine by 75% in separate pan to create gastrique",
                    "Remove vegetables with slotted spoon, drain on paper towels briefly",
                    "Plate using ring molds for uniform presentation and height",
                    "Drizzle reduced wine gastrique around plate using squeeze bottle",
                    "Finish with flaky sea salt and serve on warmed plates"
                ],
                "shoppingList": ["duck fat", "bay leaves", "white wine", "shallots"]
            },
            {
                "title": f"Deconstructed {ingredients_list[2]} Composition",
                "description": "Modern culinary presentation breaking down traditional recipes into artistic components",
                "cookTime": "50 minutes",
                "ingredientsUsed": ingredients_list,
                "missingIngredients": ["aged balsamic", "truffle oil", "edible flowers"],
                "nutrition": {"calories": 450, "protein": "28g", "fat": "24g", "carbs": "32g"},
                "steps": [
                    "Create three distinct cooking preparations from single ingredient base",
                    "Station 1: Purée component - blend with cream to velvet consistency, strain through fine mesh",
                    "Station 2: Textural element - julienne cut vegetables, quick sauté to al dente",
                    "Station 3: Protein preparation - sous vide at 131°F for 45 minutes if available",
                    "Prepare balsamic reduction: simmer aged balsamic until coat-back-of-spoon consistency",
                    "Warm plates in 200°F oven for proper service temperature",
                    "Plate using modern technique: dots of purée using squeeze bottle in line formation",
                    "Arrange julienned vegetables in geometric pattern overlapping purée",
                    "Slice protein on bias, fan across plate maintaining 1/4 inch spacing",
                    "Apply truffle oil using eyedropper for precise placement and portion control",
                    "Finish with balsamic reduction dots, use toothpick to create artistic swirls",
                    "Final garnish: place edible flowers with tweezers for color and elegance"
                ],
                "shoppingList": ["aged balsamic", "truffle oil", "edible flowers"]
            }
        ]
    else:
        # Home cooking mode
        return [
            {
                "title": f"Simple {ingredients_list[0]} Skillet",
                "description": "A quick and delicious one-pan meal perfect for busy weeknights",
                "cookTime": "25 minutes", 
                "ingredientsUsed": ingredients_list,
                "missingIngredients": ["olive oil", "salt", "pepper", "onion"],
                "nutrition": {"calories": 350, "protein": "20g", "fat": "12g", "carbs": "35g"},
                "steps": [
                    "Heat 2 tbsp olive oil in large skillet over medium heat",
                    "Add diced onion, cook 3-4 minutes until softened",
                    "Add main ingredients and stir to combine",
                    "Cook 12-15 minutes, stirring occasionally",
                    "Season with salt and pepper to taste",
                    "Serve hot with rice or bread"
                ],
                "shoppingList": ["olive oil", "salt", "pepper", "onion"]
            },
            {
                "title": f"Easy {ingredients_list[1]} Curry",
                "description": "A flavorful and comforting curry made with simple ingredients",
                "cookTime": "30 minutes",
                "ingredientsUsed": ingredients_list[1:],
                "missingIngredients": ["curry powder", "coconut milk", "ginger"],
                "nutrition": {"calories": 320, "protein": "18g", "fat": "14g", "carbs": "28g"},
                "steps": [
                    "Heat oil in pot over medium heat",
                    "Add curry powder and cook 30 seconds until fragrant",
                    "Add ingredients and coconut milk",
                    "Simmer 20 minutes until tender",
                    "Season to taste and serve over rice"
                ],
                "shoppingList": ["curry powder", "coconut milk", "ginger"]
            },
            {
                "title": f"Hearty {ingredients_list[2]} Soup",
                "description": "A warming and nutritious soup perfect for cold days",
                "cookTime": "35 minutes",
                "ingredientsUsed": ingredients_list,
                "missingIngredients": ["vegetable broth", "herbs", "lemon"],
                "nutrition": {"calories": 280, "protein": "15g", "fat": "8g", "carbs": "32g"},
                "steps": [
                    "Sauté vegetables in pot with oil",
                    "Add broth and bring to boil",
                    "Simmer 25 minutes until tender",
                    "Season with herbs and lemon juice",
                    "Serve hot with crusty bread"
                ],
                "shoppingList": ["vegetable broth", "herbs", "lemon"]
            }
        ]

# API Endpoints

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    watsonx_status = "connected" if credentials else "not configured"
    return jsonify({
        "status": "ok", 
        "message": "Flask backend running",
        "watsonx_status": watsonx_status,
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/pantry", methods=["GET"])
def get_pantry():
    """Get all pantry items."""
    try:
        pantry = load_pantry()
        return jsonify({"success": True, "pantry": pantry})
    except Exception as e:
        logger.error(f"Error fetching pantry: {str(e)}")
        return jsonify({"success": False, "error": "Failed to fetch pantry items"}), 500

@app.route("/api/pantry", methods=["POST"])
def add_pantry_item():
    """Add item to pantry."""
    try:
        data = request.json or {}
        
        # Validate required fields
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"success": False, "error": "Item name is required"}), 400
        
        # Validate and set optional fields
        try:
            quantity = float(data.get("quantity", 1))
            if quantity <= 0:
                return jsonify({"success": False, "error": "Quantity must be positive"}), 400
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Invalid quantity format"}), 400
        
        unit = (data.get("unit") or "units").strip()
        category = (data.get("category") or "").strip()
        
        pantry = load_pantry()
        
        # Generate timestamp-based ID like your existing data
        new_id = str(int(datetime.now().timestamp() * 1000))
        
        new_item = {
            "id": new_id,
            "name": name,
            "quantity": quantity,
            "unit": unit,
            "category": category,
            "notes": "",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        pantry.append(new_item)
        save_pantry(pantry)
        
        logger.info(f"Added item to pantry: {name} ({quantity} {unit})")
        return jsonify({"success": True, "message": f"{name} added successfully!", "pantry": pantry})
        
    except Exception as e:
        logger.error(f"Error adding pantry item: {str(e)}")
        return jsonify({"success": False, "error": "Failed to add item"}), 500

@app.route("/api/pantry/delete/<item_id>", methods=["DELETE"])
def delete_pantry_item(item_id):
    """Delete pantry item."""
    try:
        pantry = load_pantry()
        pantry = [item for item in pantry if item.get("id") != item_id]
        save_pantry(pantry)
        return jsonify({"success": True, "message": "Item deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting pantry item: {str(e)}")
        return jsonify({"success": False, "error": "Failed to delete item"}), 500

@app.route("/api/pantry/update/<item_id>", methods=["PUT"])
def update_pantry_item(item_id):
    """Update pantry item."""
    try:
        data = request.json or {}
        pantry = load_pantry()
        
        for item in pantry:
            if item.get("id") == item_id:
                if "quantity" in data:
                    item["quantity"] = float(data["quantity"])
                if "unit" in data:
                    item["unit"] = data["unit"]
                if "name" in data:
                    item["name"] = data["name"]
                if "category" in data:
                    item["category"] = data["category"]
                item["updatedAt"] = datetime.now().isoformat()
                break
        
        save_pantry(pantry)
        return jsonify({"success": True, "message": "Item updated successfully"})
    except Exception as e:
        logger.error(f"Error updating pantry item: {str(e)}")
        return jsonify({"success": False, "error": "Failed to update item"}), 500

@app.route("/api/generate_recipe", methods=["POST"])
def generate_recipe():
    """Generate a single recipe using PantryChef system."""
    data = request.json or {}
    mode = data.get("mode", "home")
    pantry = load_pantry()
    
    if not pantry:
        return jsonify({
            "success": False, 
            "error": "No pantry items found. Please add some ingredients first."
        }), 400
    
    try:
        # Create pantry list string
        pantry_list = ", ".join([f"{item['name']} ({item['quantity']} {item['unit']})" for item in pantry])
        
        # Generate appropriate prompt based on mode
        if mode == "professional":
            prompt = generate_professional_mode_prompt(
                pantry_list=pantry_list,
                servings=data.get("servings", 2),
                dietary=data.get("dietary", ""),
                cuisine=data.get("cuisine", ""),
                budget=data.get("budget", ""),
                appliances=data.get("appliances", ""),
                skill_level=data.get("skill_level", "")
            )
        else:
            prompt = generate_home_mode_prompt(
                pantry_list=pantry_list,
                servings=data.get("servings", 2),
                dietary=data.get("dietary", ""),
                cuisine=data.get("cuisine", ""),
                budget=data.get("budget", ""),
                appliances=data.get("appliances", ""),
                skill_level=data.get("skill_level", "")
            )
        
        # Call Watsonx with appropriate mode parameters
        recipe = call_watsonx(prompt, mode=mode)
        
        if recipe and ("recipes" in recipe or "title" in recipe):
            save_recipe(recipe, mode)
            logger.info(f"Successfully generated recipe in {mode} mode")
            return jsonify({
                "success": True,
                "data": recipe,
                "mode": mode
            })
        else:
            logger.error("No valid recipe data in response")
            return jsonify({
                "success": False,
                "error": "Failed to generate valid recipe"
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating recipe: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/meal-plan", methods=["POST"])
def generate_meal_plan():
    """Generate meal plan with multiple recipes."""
    data = request.json or {}
    cooking_mode = data.get("cookingMode", "home")
    
    pantry = load_pantry()
    
    if not pantry:
        return jsonify({
            "success": False, 
            "error": "No pantry items found. Please add some ingredients first."
        }), 400
    
    # Generate meals using mock data (which includes detailed recipes)
    meals = generate_meal_plan_mock(pantry, cooking_mode)
    
    # Extract shopping list from all meals
    shopping_list = []
    for meal in meals:
        shopping_list.extend(meal.get("shoppingList", []))
    
    # Remove duplicates from shopping list
    unique_shopping_list = list(set(shopping_list))
    shopping_list_formatted = [
        {"item": item, "quantity": 1, "unit": "unit"} 
        for item in unique_shopping_list
    ]
    
    return jsonify({
        "success": True,
        "data": {
            "meals": meals,
            "shoppingList": shopping_list_formatted
        },
        "mode": cooking_mode,
        "note": f"Generated using {cooking_mode} cooking mode with detailed recipes"
    })

if __name__ == "__main__":
    logger.info("🚀 Starting Pantry AI Flask Application...")
    
    if not WATSONX_API_KEY or not WATSONX_PROJECT_ID:
        logger.warning("⚠️ WATSONX_API_KEY or WATSONX_PROJECT_ID not found in environment variables.")
        logger.warning("The app will run with detailed mock data. Set these environment variables for full IBM Watsonx integration.")
    else:
        logger.info("✅ IBM Watsonx credentials found. Ready for AI meal generation!")
    
    logger.info("🍽️ Using db.json for pantry data storage")
    logger.info("🔥 Professional mode includes 12-15 detailed recipe steps")
    logger.info("🏠 Home mode includes 6-8 simple recipe steps")
    logger.info("🌐 Server starting at http://127.0.0.1:5000")
    
    app.run(debug=True, host="127.0.0.1", port=5000)
