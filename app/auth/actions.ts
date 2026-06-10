'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function asString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function login(formData: FormData) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect('/auth/login?error=Supabase%20is%20not%20configured.');
  }
  const email = asString(formData, 'email');
  const password = asString(formData, 'password');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect('/auth/signup?error=Supabase%20is%20not%20configured.');
  }
  const email = asString(formData, 'email');
  const password = asString(formData, 'password');
  const fullName = asString(formData, 'full_name');

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl()}/dashboard`
    }
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/auth/login?message=Check your email to confirm your account.');
}

export async function forgotPassword(formData: FormData) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect('/auth/forgot-password?error=Supabase%20is%20not%20configured.');
  }
  const email = asString(formData, 'email');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/dashboard`
  });

  if (error) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/auth/login?message=Password reset instructions sent.');
}

export async function logout() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect('/auth/login');
  }
  await supabase.auth.signOut();
  redirect('/auth/login');
}
