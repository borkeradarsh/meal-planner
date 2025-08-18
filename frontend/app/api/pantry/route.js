import { NextResponse } from 'next/server'
import { supabase, handleSupabaseError } from '../../../lib/supabase'

// GET /api/pantry - Get all pantry items for the current user
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching pantry items:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/pantry - Add a new pantry item
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, quantity = 1, unit = 'piece', category, expiry_date, notes } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .insert([
        {
          name: name.trim(),
          quantity: parseInt(quantity) || 1,
          unit: unit || 'piece',
          category: category || null,
          expiry_date: expiry_date || null,
          notes: notes || null
        }
      ])
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error adding pantry item:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/pantry - Update a pantry item
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, name, quantity, unit, category, expiry_date, notes } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (quantity !== undefined) updateData.quantity = parseInt(quantity) || 1
    if (unit !== undefined) updateData.unit = unit
    if (category !== undefined) updateData.category = category
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('pantry_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating pantry item:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/pantry - Delete a pantry item
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id)

    if (error) {
      handleSupabaseError(error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pantry item:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
