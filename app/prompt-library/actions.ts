'use server';

import {
  saveGeneratedContent,
  trackContentGeneratorEvent,
  type SaveGeneratedContentInput,
  type TrackContentGeneratorEventInput
} from '@/lib/prompt-library/supabase';

export async function saveGeneratedContentAction(input: SaveGeneratedContentInput) {
  return saveGeneratedContent(input);
}

export async function trackContentGeneratorEventAction(input: TrackContentGeneratorEventInput) {
  await trackContentGeneratorEvent(input);
}
