// Frontend API utilities for connecting to Flask backend
const API_URL = "http://127.0.0.1:5000/api";  // Flask backend

export async function fetchPantry() {
  const res = await fetch(`${API_URL}/pantry`);
  if (!res.ok) throw new Error("Failed to fetch pantry");
  return res.json();
}

export async function addPantryItem(item) {
  const res = await fetch(`${API_URL}/pantry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to add pantry item");
  return res.json();
}

export async function generateMealPlan(cookingMode = "home") {
  const res = await fetch(`${API_URL}/meal-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cookingMode }),
  });
  if (!res.ok) throw new Error("Failed to generate meal plan");
  return res.json();
}

export async function generateRecipe(mode = "home") {
  const res = await fetch(`${API_URL}/generate_recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error("Failed to generate recipe");
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}
