"use client";

import { useState, useEffect } from "react";

interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

interface MealPlan {
  title: string;
  body: string;
  missing: string[];
}

export default function Home() {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("units");
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  useEffect(() => {
    fetch(API_BASE + "/pantry")
      .then(r => r.json())
      .then(setPantry)
      .catch(console.error);
  }, [API_BASE]);

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    fetch(API_BASE + "/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity: qty, unit })
    })
    .then(() => {
      setName(""); 
      setQty(1); 
      setUnit("units");
      return fetch(API_BASE + "/pantry").then(r => r.json()).then(setPantry);
    })
    .catch(console.error);
  }

  function deleteItem(id: number) {
    fetch(API_BASE + "/pantry/" + id, { method: "DELETE" })
      .then(() => fetch(API_BASE + "/pantry").then(r => r.json()).then(setPantry))
      .catch(console.error);
  }

  function planMeal() {
    setLoading(true);
    fetch(API_BASE + "/plan-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    })
    .then(r => r.json())
    .then(setPlan)
    .catch(console.error)
    .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🍽️ Smart Meal Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered meal planning based on your pantry items
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pantry Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              📦 My Pantry
            </h2>
            
            <form onSubmit={addItem} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  placeholder="Item name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  placeholder="unit"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pantry.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No items in pantry yet. Add some items to get started!
                </p>
              ) : (
                pantry.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <span className="text-gray-800 dark:text-white">
                      <strong>{p.name}</strong> — {p.quantity} {p.unit}
                    </span>
                    <button
                      onClick={() => deleteItem(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Meal Planning Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              🤖 AI Meal Planner
            </h2>

            <button
              onClick={planMeal}
              disabled={loading || pantry.length === 0}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium mb-6"
            >
              {loading ? "Planning your meal..." : "Plan My Meal"}
            </button>

            {plan && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                  {plan.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {plan.body}
                </p>
                {plan.missing && plan.missing.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                      🛒 Shopping List:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                      {plan.missing.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {pantry.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>Add some items to your pantry first!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
