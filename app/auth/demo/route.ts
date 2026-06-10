import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_ACCESS_COOKIE } from '@/lib/auth/demo';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.set(DEMO_ACCESS_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
  return response;
}
