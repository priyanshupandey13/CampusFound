import { supabase } from './supabase'
import type { Item } from './types'

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching items:', error.message)
    throw error
  }

  return (data || []).map((row): Item => ({
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    location: row.location,
    date: new Date(row.item_date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    description: row.description,
    image: row.image_url || '',
    reporter: row.reporter_name || 'Campus member',
    createdAt: new Date(row.created_at).getTime(),
    state: row.returned ? 'Resolved' : 'Open'
  }))
}

export async function createItem(item: Item): Promise<void> {
  const { error } = await supabase
    .from('items')
    .insert({
      title: item.title,
      category: item.category,
      status: item.status,
      description: item.description,
      location: item.location,
      item_date: new Date(item.date).toISOString().slice(0, 10),
      image_url: item.image || null,
      reporter_name: item.reporter,
      user_id: null,
      approval_status: 'pending'
    })

  if (error) {
    console.error('Error creating report:', error.message)
    throw error
  }
}