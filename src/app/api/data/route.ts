import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// Fallback in-memory store for instant testing before Supabase is connected
let fallbackStore: Array<{ id: string; title: string; content: string; createdAt: string }> = [
  {
    id: '1',
    title: 'First Data Item',
    content: 'This item was served from your Next.js backend server!',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return NextResponse.json({ source: 'Supabase PostgreSQL', data });
    }
  }

  // Fallback to in-memory mock store if Supabase credentials are not set up yet
  return NextResponse.json({
    source: 'Server Memory (Connect Supabase to persist permanently)',
    data: fallbackStore,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ title, content }])
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ source: 'Supabase PostgreSQL', data }, { status: 201 });
    }

    // Fallback store
    const newItem = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    fallbackStore.unshift(newItem);

    return NextResponse.json(
      {
        source: 'Server Memory (Configure Supabase in .env.local to persist permanently)',
        data: newItem,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
