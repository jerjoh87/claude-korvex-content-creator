import assert from 'node:assert/strict';
import { DEMO_STORAGE_KEY, REAL_USER_STORAGE_KEY, createDemoState, demoBusinesses } from '../src/demoData.js';

const requiredIndustries = [
  'Barber Shop',
  'Realtor',
  'Restaurant',
  'Credit Repair Company',
  'Pest Control Company',
  'HVAC Company'
];

assert.equal(demoBusinesses.length, requiredIndustries.length, 'all requested demo businesses should be present');
assert.deepEqual(demoBusinesses.map((business) => business.industry), requiredIndustries);
assert.notEqual(DEMO_STORAGE_KEY, REAL_USER_STORAGE_KEY, 'demo state must be isolated from real user workspace state');

for (const business of demoBusinesses) {
  assert.equal(Boolean(business.demoBadge), true, `${business.industry} should include a demo badge`);
  assert.equal(Boolean(business.brandKit), true, `${business.industry} should include a brand kit`);
  assert.ok(business.weeklyPlanner.length >= 5, `${business.industry} should include a weekly planner`);
  assert.ok(business.campaignVault.length >= 3, `${business.industry} should include campaign vault examples`);
  assert.ok(business.contentCalendar.length >= 3, `${business.industry} should include content calendar examples`);
  assert.ok(business.scheduledPosts.length >= 2, `${business.industry} should include scheduled posts`);
  assert.ok(business.growthCoach.length >= 3, `${business.industry} should include AI Growth Coach recommendations`);
  assert.equal(Boolean(business.analytics.topChannel), true, `${business.industry} should include analytics examples`);
  assert.ok(business.opportunities.length >= 2, `${business.industry} should include opportunity feed examples`);
  assert.equal(business.scheduledPosts.every((post) => post.demo === true), true, `${business.industry} scheduled posts should be demo-marked`);
}

const state = createDemoState('restaurant');
assert.equal(state.mode, 'demo');
assert.equal(state.industryId, 'restaurant');
assert.match(state.note, /separately from authenticated customer workspaces/);

console.log('Demo data contract passed');
