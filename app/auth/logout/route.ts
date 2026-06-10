import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_ACCESS_COOKIE } from '@/lib/auth/demo';
import { createClient } from '@/lib/supabase/server';

async function signOut(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase may be unavailable while temporary demo access is enabled.
  }
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  response.cookies.delete(DEMO_ACCESS_COOKIE);
  return response;
}

export async function POST(request: NextRequest) {
  return signOut(request);
}

export async function GET(request: NextRequest) {
  return signOut(request);
}
