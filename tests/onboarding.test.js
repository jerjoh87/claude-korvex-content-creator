import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createOnboardingAssets, normalizeAnswers, wizardSteps } from '../src/onboarding.js';

describe('onboarding strategy generation', () => {
  it('contains the eight activation steps in order', () => {
    assert.deepEqual(wizardSteps.map((step) => step.title), [
      'Business Type',
      'Industry',
      'Services',
      'Target Audience',
      'Offer',
      'Brand Voice',
      'Social Platforms',
      'Content Goals'
    ]);
  });

  it('normalizes skipped answers without losing expected profile keys', () => {
    const normalized = normalizeAnswers({ businessType: 'Agency', services: [] });
    assert.equal(normalized.businessType, 'Agency');
    assert.deepEqual(normalized.services, ['Skipped']);
    assert.equal(normalized.offer, 'Skipped');
  });

  it('creates all starter assets for first-use success', () => {
    const assets = createOnboardingAssets({
      businessType: 'Service business',
      industry: 'Coaching & consulting',
      services: ['1:1 services', 'Free consultation'],
      targetAudience: 'Founders who need consistent content.',
      offer: 'A 30-day content sprint.',
      brandVoice: 'Bold expert',
      socialPlatforms: ['LinkedIn', 'Email newsletter'],
      contentGoals: ['Book calls', 'Build authority']
    });

    assert.equal(assets.businessProfile.activationStatus, 'Ready for first campaign');
    assert.equal(assets.brandKit.voice, 'Bold expert');
    assert.match(assets.aiGrowthCoachProfile.nextBestAction, /first marketing plan/i);
    assert.equal(assets.weeklyPlannerStarterStrategy.length, 5);
  });
});
