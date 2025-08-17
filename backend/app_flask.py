from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

PANTRY_FILE = "pantry.json"
RECIPES_FILE = "recipes.json"

def load_pantry():
    try:
        with open(PANTRY_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_pantry(pantry_data):
    with open(PANTRY_FILE, "w") as f:
        json.dump(pantry_data, f, indent=4)

def save_recipe(recipe, mode):
    try:
        with open(RECIPES_FILE, "r") as f:
            recipes = json.load(f)
    except FileNotFoundError:
        recipes = []

    recipes.append({"mode": mode, "recipe": recipe})
    with open(RECIPES_FILE, "w") as f:
        json.dump(recipes, f, indent=4)

def call_watsonx(prompt):
    # Mock response for now - replace with real IBM Watsonx call
    # You can integrate with the actual Watsonx client here
    return {
        "title": "Sample Nutritious Dish",
        "description": "A delicious meal using your pantry ingredients",
        "ingredientsUsed": ["ingredient1", "ingredient2"],
        "missingIngredients": ["salt", "pepper", "oil"],
        "steps": [
            "Prepare your ingredients by washing and chopping",
            "Heat oil in a large pan over medium heat",
            "Add ingredients and cook for 5-7 minutes",
            "Season with salt and pepper to taste",
            "Serve hot and enjoy"
        ],
        "cookTime": "15 minutes",
        "nutrition": {
            "calories": 300,
            "protein": "15g",
            "carbs": "30g",
            "fat": "10g"
        }
    }

# Health check endpoint
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Flask backend running"})

# Pantry endpoints
@app.route("/api/pantry", methods=["GET"])
def get_pantry():
    pantry = load_pantry()
    return jsonify({"success": True, "data": pantry})

@app.route("/api/pantry/add", methods=["POST"])
def add_pantry_item():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"success": False, "error": "name required"}), 400
    
    quantity = data.get("quantity", 1)
    unit = data.get("unit", "units")
    category = data.get("category", "other")
    
    pantry = load_pantry()
    
    # Generate simple ID
    new_id = max([item.get("id", 0) for item in pantry], default=0) + 1
    
    new_item = {
        "id": new_id,
        "name": name,
        "quantity": quantity,
        "unit": unit,
        "category": category
    }
    
    pantry.append(new_item)
    save_pantry(pantry)
    
    return jsonify({"success": True, "data": new_item})

@app.route("/api/pantry/delete/<int:item_id>", methods=["DELETE"])
def delete_pantry_item(item_id):
    pantry = load_pantry()
    pantry = [item for item in pantry if item.get("id") != item_id]
    save_pantry(pantry)
    return jsonify({"success": True})

@app.route("/api/pantry/update/<int:item_id>", methods=["PUT"])
def update_pantry_item(item_id):
    data = request.json or {}
    pantry = load_pantry()
    
    for item in pantry:
        if item.get("id") == item_id:
            if "quantity" in data:
                item["quantity"] = data["quantity"]
            if "unit" in data:
                item["unit"] = data["unit"]
            if "name" in data:
                item["name"] = data["name"]
            if "category" in data:
                item["category"] = data["category"]
            break
    
    save_pantry(pantry)
    return jsonify({"success": True})

# Recipe generation endpoint with cooking modes
@app.route("/api/generate_recipe", methods=["POST"])
def generate_recipe():
    data = request.json or {}
    mode = data.get("mode", "home")  # default to home cooked
    pantry = load_pantry()
    
    if not pantry:
        return jsonify({
            "success": False, 
            "error": "No pantry items found. Please add some ingredients first."
        }), 400
    
    # Create pantry list string
    pantry_list = ", ".join([f"{item['name']} ({item['quantity']} {item['unit']})" for item in pantry])
    
    if mode == "home":
        prompt = f"""Generate a simple, home-cooked recipe using {pantry_list}. Keep it easy, 4–6 steps max.
        
🍳 HOME COOK REQUIREMENTS:
- Simple cooking terms (boil, fry, stir)
- Everyday measurements (cups, tsp, tbsp)
- 4-6 easy steps
- Family-friendly
- Common kitchen tools"""
    else:  # professional mode
        prompt = f"""You are a Michelin-star chef. Generate a professional recipe with precise steps, temps, and techniques using {pantry_list}. Minimum 10 steps.

👨‍🍳 PROFESSIONAL REQUIREMENTS:
- Professional techniques (sauté, brunoise, deglaze)
- Exact temperatures and timing
- 10+ detailed steps
- Restaurant-quality presentation
- Advanced culinary methods"""
    
    recipe = call_watsonx(prompt)
    save_recipe(recipe, mode)
    
    return jsonify({
        "success": True,
        "data": recipe,
        "mode": mode
    })

# Meal plan endpoint (for compatibility with existing frontend)
@app.route("/api/meal-plan", methods=["POST"])
def generate_meal_plan():
    data = request.json or {}
    cooking_mode = data.get("cookingMode", "home")
    
    pantry = load_pantry()
    
    if not pantry:
        return jsonify({
            "success": False, 
            "error": "No pantry items found. Please add some ingredients first."
        }), 400
    
    # Create pantry list string
    pantry_list = ", ".join([f"{item['name']} ({item['quantity']} {item['unit']})" for item in pantry])
    
    if cooking_mode == "professional":
        prompt = f"""You are a professional chef creating restaurant-quality recipes using: {pantry_list}

👨‍🍳 PROFESSIONAL MODE:
- 8-12 detailed steps with exact temperatures
- Professional techniques (julienne, brunoise, sauté, deglaze, reduce)
- Pan sizes and precise timing
- Visual/sensory cues (golden brown, fragrant)
- Advanced plating suggestions
- Restaurant presentation"""
    else:  # home mode
        prompt = f"""Create simple home cooking recipes using: {pantry_list}

🍳 HOME COOK MODE:
- 6-7 simple steps
- Everyday measurements (cups, tsp, tbsp)
- Simple cooking terms (boil, fry, stir, mix)
- Common kitchen tools
- Family-friendly comfort food
- Easy and quick preparation"""
    
    # Generate multiple recipes (mock for now)
    recipes = []
    for i in range(3):
        recipe = call_watsonx(prompt)
        recipe["title"] = f"{recipe['title']} #{i+1}"
        recipes.append(recipe)
        save_recipe(recipe, cooking_mode)
    
    return jsonify({
        "success": True,
        "data": {
            "meals": recipes,
            "shoppingList": [
                {"item": "salt", "quantity": 1, "unit": "container"},
                {"item": "pepper", "quantity": 1, "unit": "container"},
                {"item": "cooking oil", "quantity": 1, "unit": "bottle"}
            ]
        },
        "mode": cooking_mode,
        "note": f"Generated using {cooking_mode} cooking mode"
    })

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Use port 5001 to avoid conflict with Node.js backend
