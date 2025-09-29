import type { APIRoute } from 'astro'

// Create the Supabase client
const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY

export const GET: APIRoute = async ({ request, url }) => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch properties from Supabase using REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/properties?select=*&order=created_at.desc`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Supabase API error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch properties' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const properties = await response.json()

    return new Response(
      JSON.stringify({ properties }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    )
  } catch (error) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}