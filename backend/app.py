import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import SessionLocal, PantryItem, Recipe

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

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
    name = data.get("name")
    quantity = float(data.get("quantity", 1))
    unit = data.get("unit", "units")
    db = next(get_db())
    # upsert by name
    existing = db.query(PantryItem).filter(PantryItem.name == name).first()
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
    # If frontend sends a list of pantry items, use that. Otherwise read DB.
    pantry = data.get("pantry")

    db = next(get_db())
    if not pantry:
        pantry = [p.name for p in db.query(PantryItem).all()]

    if USE_WATSONX:
        # Placeholder: call watsonx with prompt
        try:
            from watsonx_integration import generate_recipe_with_watsonx
            plan = generate_recipe_with_watsonx(pantry)
        except ImportError:
            plan = {"title": "Fallback Recipe", "body": "WatsonX integration is unavailable. Using mock planner instead.", "missing": []}
    else:
        # Mock LLM behaviour: simple rule-based planner
        plan = _mock_recipe_planner(pantry)

    # Optionally save generated recipe to DB
    r = Recipe(title=plan.get("title", "Generated Recipe"), body=plan.get("body", ""))
    db.add(r)
    db.commit()

    return jsonify(plan)


def _mock_recipe_planner(pantry_items):
    # very small heuristic for demo
    s = ", ".join(pantry_items[:6]) if pantry_items else "nothing"
    title = "Pantry Surprise"
    body = f"Use these items: {s}. Suggest a simple stir-fry: saute items, add salt, serve. Missing: none (demo)."
    shopping = []
    return {"title": title, "body": body, "missing": shopping}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
