import { useState } from "react";

export default function RecipeForm() {
  const [mode, setMode] = useState("home");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate_recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await response.json();
      
      if (data.success) {
        setRecipe(data.data);
      } else {
        console.error("Recipe generation failed:", data.error);
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Recipe Mode Selector */}
      <div className="p-4 rounded-xl shadow-md bg-white dark:bg-gray-800 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Choose Recipe Style
        </h2>
        
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="home"
              checked={mode === "home"}
              onChange={() => setMode("home")}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              🍳 Home Cooked
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="professional"
              checked={mode === "professional"}
              onChange={() => setMode("professional")}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              👨‍🍳 Professional
            </span>
          </label>
        </div>

        <button
          onClick={generateRecipe}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate {mode === "professional" ? "Professional" : "Home Cook"} Recipe
            </>
          )}
        </button>
      </div>

      {/* Recipe Display */}
      {recipe && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">
              {mode === "professional" ? "👨‍🍳" : "🍳"}
            </span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {recipe.title}
            </h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {recipe.description}
          </p>

          {/* Ingredients Used */}
          {recipe.ingredientsUsed && recipe.ingredientsUsed.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                From Your Pantry:
              </h4>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredientsUsed.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Ingredients */}
          {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                Need to Buy:
              </h4>
              <div className="flex flex-wrap gap-2">
                {recipe.missingIngredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cooking Steps */}
          {recipe.steps && recipe.steps.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Cooking Instructions:
              </h4>
              <ol className="space-y-2">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Recipe Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 border-t pt-4">
            {recipe.cookTime && (
              <span>⏱️ Cook Time: {recipe.cookTime}</span>
            )}
            {recipe.nutrition && (
              <span>
                🔥 {recipe.nutrition.calories} cal, 
                🥩 {recipe.nutrition.protein} protein,
                🌾 {recipe.nutrition.carbs} carbs,
                🥑 {recipe.nutrition.fat} fat
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
