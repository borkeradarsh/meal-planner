import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import SessionLocal, PantryItem, Recipe
from sqlalchemy import select

load_dotenv()

app = Flask(__name__)
CORS(app)

USE_WATSONX = os.getenv("USE_WATSONX", "false").lower() == "true"

# Simple helper: session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Basic health
@app.route("/health")
def health():
    return jsonify({"status": "ok"})

# Pantry endpoints
@app.route("/pantry", methods=["GET"])
def list_pantry():
    db = next(get_db())
    items = db.query(PantryItem).all()
    return jsonify([{"id": i.id, "name": i.name, "quantity": i.quantity, "unit": i.unit} for i in items])

@app.route("/pantry", methods=["POST"])
def add_pantry():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name required"}), 400
    quantity = float(data.get("quantity", 1))
    unit = data.get("unit", "units")
    db = next(get_db())

    existing = db.query(PantryItem).filter(PantryItem.name.ilike(name)).first()
    if existing:
        existing.quantity = quantity
        existing.unit = unit
        db.add(existing)
        db.commit()
        return jsonify({"status": "updated"})
    item = PantryItem(name=name, quantity=quantity, unit=unit)
    db.add(item)
    db.commit()
    return jsonify({"id": item.id, "status": "created"})

@app.route("/pantry/<int:item_id>", methods=["DELETE"])
def delete_pantry(item_id):
    db = next(get_db())
    item = db.query(PantryItem).filter(PantryItem.id == item_id).first()
    if not item:
        return jsonify({"error": "not found"}), 404
    db.delete(item)
    db.commit()
    return jsonify({"status": "deleted"})

# Plan-meal endpoint (calls watsonx or returns mock response)
@app.route("/plan-meal", methods=["POST"])
def plan_meal():
    data = request.json or {}
    pantry = data.get("pantry")

    db = next(get_db())
    if not pantry:
        pantry = [p.name for p in db.query(PantryItem).all()]

    if USE_WATSONX:
        try:
            from watsonx_integration import generate_recipe_with_watsonx
            plan = generate_recipe_with_watsonx(pantry)
        except Exception as e:
            plan = {"title": "Fallback Recipe", "body": f"Watsonx error: {e}", "ingredients": [], "missing": []}
    else:
        plan = _mock_recipe_planner(pantry)

    # Save recipe
    r = Recipe(title=plan.get("title", "Generated Recipe"), body=plan.get("body", ""))
    db.add(r)
    db.commit()

    # Compute missing vs pantry for shopping list if AI didn't provide
    if not plan.get("missing"):
        plan["missing"] = [ing for ing in plan.get("ingredients", []) if ing.lower() not in [i.lower() for i in pantry]]

    return jsonify(plan)

# Shopping list: compute missing given a recipe ingredients[]
@app.route("/shopping-list", methods=["POST"])
def shopping_list():
    data = request.json or {}
    recipe_ingredients = [i.strip() for i in data.get("ingredients", []) if i.strip()]
    db = next(get_db())
    pantry = [p.name.lower() for p in db.query(PantryItem).all()]
    missing = [i for i in recipe_ingredients if i.lower() not in pantry]
    return jsonify({"missing": missing})

def _mock_recipe_planner(pantry_items):
    s = ", ".join(pantry_items[:6]) if pantry_items else "nothing"
    title = "Pantry Surprise"
    body = f"Use these items: {s}. Try a simple stir-fry: sauté items, add salt, serve."
    ingredients = pantry_items[:6]
    shopping = []
    return {"title": title, "body": body, "ingredients": ingredients, "missing": shopping}

if __name__ == "__main__":
    from models import Base, engine
    Base.metadata.create_all(bind=engine)
    app.run(host="0.0.0.0", port=5000, debug=True)
