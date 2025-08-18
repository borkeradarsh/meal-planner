import { NextResponse } from 'next/server'
import { supabase, handleSupabaseError } from '../../../lib/supabase'

// GET /api/meal-plans - Get all meal plans for the current user
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching meal plans:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/meal-plans - Save a new meal plan
export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description, ingredients, meal_plan_content } = body

    if (!title || !ingredients || !meal_plan_content) {
      return NextResponse.json(
        { success: false, error: 'Title, ingredients, and meal plan content are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .insert([
        {
          title: title.trim(),
          description: description || null,
          ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
          meal_plan_content: meal_plan_content
        }
      ])
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error saving meal plan:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/meal-plans - Delete a meal plan
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Meal plan ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)

    if (error) {
      handleSupabaseError(error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting meal plan:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
