// TypeScript types for the Enhanced Meal Plan API Response

export interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Meal {
  title: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  steps: string[];
  cookTime: string;
  nutrition: Nutrition;
}

export interface ShoppingListItem {
  item: string;
  quantity: number;
  unit: string;
}

export interface MealPlanResponse {
  meals: Meal[];
  shoppingList: ShoppingListItem[];
}

export interface MealPlanApiResponse {
  success: boolean;
  data: MealPlanResponse;
  note?: string;
  error?: string;
}

// Component props types for easier usage
export interface MealCardProps {
  meal: Meal;
  index?: number;
}

export interface ShoppingListProps {
  items: ShoppingListItem[];
}

export interface MealPlanDisplayProps {
  mealPlan: MealPlanResponse;
  isLoading?: boolean;
}
