import { NextResponse } from 'next/server';
import { askWatsonx, parseWatsonxResponse } from '@/lib/watsonx';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export async function POST(request) {
  try {
    // Parse the request body
    const { pantry, saveToHistory = false } = await request.json();
    
    if (!pantry || !Array.isArray(pantry)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pantry data. Expected an array of items.' },
        { status: 400 }
      );
    }

    // Build the pantry list string
    const pantryList = pantry
      .map(item => `${item.name} (${item.quantity} ${item.unit})`)
      .join(', ');

    // Create the prompt for Watsonx
    const prompt = `You are a helpful cooking assistant. Based on the pantry items provided, suggest meal options.

Pantry items: ${pantryList}

Task: Suggest 3 meal options I can cook using primarily these ingredients. If some common ingredients are missing (like basic seasonings, oil, etc.), list them in a shopping list.

Please respond with a JSON object in exactly this format:
{
  "meals": ["meal name 1", "meal name 2", "meal name 3"],
  "shoppingList": ["missing ingredient 1", "missing ingredient 2"]
}

If no additional ingredients are needed, return an empty shopping list array.`;

    console.log('Generated prompt for Watsonx:', prompt);

    // Call Watsonx
    const watsonxResponse = await askWatsonx(prompt);
    
    // Parse the response
    const parsedData = parseWatsonxResponse(watsonxResponse);
    
    // Validate the parsed data
    if (!parsedData.meals || !Array.isArray(parsedData.meals)) {
      parsedData.meals = ['Unable to generate meal suggestions'];
    }
    if (!parsedData.shoppingList || !Array.isArray(parsedData.shoppingList)) {
      parsedData.shoppingList = [];
    }

    // Optionally save to meal plan history
    if (saveToHistory && parsedData.meals.length > 0) {
      try {
        const mealTitle = `Meal plan for ${pantry.slice(0, 3).map(item => item.name).join(', ')}${pantry.length > 3 ? '...' : ''}`
        const ingredients = pantry.map(item => item.name)
        
        await supabase
          .from('meal_plans')
          .insert([
            {
              title: mealTitle,
              description: `Generated meal plan using ${pantry.length} pantry items`,
              ingredients: ingredients,
              meal_plan_content: JSON.stringify(parsedData)
            }
          ])
      } catch (saveError) {
        console.error('Error saving meal plan to history:', saveError)
        // Don't fail the whole request if saving fails
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Meal plan API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate meal plan'
      },
      { status: 500 }
    );
  }
}
