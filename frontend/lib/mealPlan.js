/**
 * Generate a meal plan based on pantry items
 * @param {Array} pantry - Array of pantry items with {name, quantity, unit}
 * @returns {Promise<Object>} - Response with meals and shopping list
 */
export async function generateMealPlan(pantry) {
  try {
    console.log('Generating meal plan for pantry:', pantry);
    
    const response = await fetch('/api/meal-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pantry }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Meal plan response:', result);
    return result;
    
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
}

/**
 * Validate pantry item
 * @param {Object} item - Pantry item to validate
 * @returns {boolean} - Whether the item is valid
 */
export function validatePantryItem(item) {
  return (
    item &&
    typeof item.name === 'string' &&
    item.name.trim().length > 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.unit === 'string' &&
    item.unit.trim().length > 0
  );
}

/**
 * Format pantry items for display
 * @param {Array} pantry - Array of pantry items
 * @returns {Array} - Formatted pantry items
 */
export function formatPantryItems(pantry) {
  return pantry.map(item => ({
    ...item,
    displayText: `${item.name} (${item.quantity} ${item.unit})`
  }));
}
