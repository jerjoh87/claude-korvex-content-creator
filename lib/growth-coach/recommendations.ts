export type BusinessKitId = 'barber' | 'realtor' | 'hvac' | 'credit-repair' | 'restaurant';

type Difficulty = 'Low' | 'Medium' | 'High';

type GrowthCoachRecommendation = {
  title: string;
  description: string;
  reason: string;
  estimatedImpact: string;
  difficulty: Difficulty;
  recommendedAction: string;
  category: 'Today’s Priorities' | 'Quick Wins' | 'Recommended Campaigns' | 'Content Opportunities' | 'Revenue Opportunities' | 'AI Insights' | 'Weekly Growth Plan' | 'Missed Opportunity Alerts';
};

type BusinessKit = {
  id: BusinessKitId;
  businessType: string;
  selectedKit: string;
  kitIncludes: string[];
  performance: {
    bestChannel: string;
    engagementRate: string;
    leadTrend: string;
    topContent: string;
  };
  socialConnections: string[];
  weeklyPlanner: string[];
  campaignHistory: string[];
  generatedContent: string[];
  mediaLibrary: string[];
  templateUsage: string[];
  recommendations: GrowthCoachRecommendation[];
};

export const businessKits: BusinessKit[] = [
  {
    id: 'barber',
    businessType: 'Barber / Grooming Studio',
    selectedKit: 'Barber Growth Kit',
    kitIncludes: ['25 templates', '5 campaigns', 'Weekly planner', 'CTA library', 'Hashtag bank'],
    performance: {
      bestChannel: 'Instagram Reels',
      engagementRate: '6.8%',
      leadTrend: '+18% booking clicks this week',
      topContent: 'Before-and-after fade transformations'
    },
    socialConnections: ['Instagram connected', 'Facebook connected', 'TikTok ready for manual posting'],
    weeklyPlanner: ['Transformation reel', 'Student haircut offer', 'Client review', 'Barber chair availability', 'Weekend booking reminder'],
    campaignHistory: ['Father’s Day Clean-Up', 'Fresh Fade Fridays', 'Referral Chair Fill'],
    generatedContent: ['Back-to-school caption pack', 'Fade transformation reel script', 'Walk-in reminder SMS'],
    mediaLibrary: ['12 haircut transformations', '4 shop atmosphere clips', '6 customer testimonial images'],
    templateUsage: ['Before/After Reel Template used 8x', 'Limited Slots Story used 5x', 'Review Spotlight used 3x'],
    recommendations: [
      {
        category: 'Today’s Priorities',
        title: 'Run a Back-To-School Haircut Campaign',
        description: 'Package student cuts, parent reminders, and limited chair availability into a 7-day booking push.',
        reason: 'Your planner already has haircut transformation content and the Barber Growth Kit includes campaign and CTA assets for time-sensitive offers.',
        estimatedImpact: 'High booking lift before the school week starts',
        difficulty: 'Medium',
        recommendedAction: 'Generate a three-post sequence with urgency CTAs and school-ready visuals.'
      },
      {
        category: 'Quick Wins',
        title: 'Turn top fade photos into a same-day openings story',
        description: 'Use your highest-performing transformation media to fill open appointment slots.',
        reason: 'Before-and-after posts are your top content and Instagram is already connected.',
        estimatedImpact: '2–5 incremental bookings from warm followers',
        difficulty: 'Low',
        recommendedAction: 'Generate story copy from the CTA library and pair it with recent media.'
      },
      {
        category: 'Content Opportunities',
        title: 'Create a weekly “Cut of the Week” series',
        description: 'Convert repeated transformation templates into a consistent proof-based content series.',
        reason: 'Template usage shows strong before/after repetition, but campaign history lacks a recurring proof series.',
        estimatedImpact: 'Stronger retention and more saves/shares',
        difficulty: 'Low',
        recommendedAction: 'Generate the first four posts and save the series to the planner.'
      },
      {
        category: 'Missed Opportunity Alerts',
        title: 'Add TikTok reposts for transformation clips',
        description: 'Repurpose Instagram Reels for TikTok manual posting to reach students and young professionals.',
        reason: 'TikTok is ready but not actively used, while your media library has short-form transformation clips.',
        estimatedImpact: 'New audience reach without new production work',
        difficulty: 'Low',
        recommendedAction: 'Generate TikTok captions and hashtags from the hashtag bank.'
      }
    ]
  },
  {
    id: 'realtor',
    businessType: 'Real Estate Agent',
    selectedKit: 'Realtor Growth Kit',
    kitIncludes: ['Listing templates', 'Buyer education campaigns', 'Open house planner', 'CTA library', 'Local hashtag bank'],
    performance: { bestChannel: 'Facebook', engagementRate: '4.9%', leadTrend: '+11% showing requests', topContent: 'Neighborhood market updates' },
    socialConnections: ['Facebook connected', 'Instagram connected', 'LinkedIn connected'],
    weeklyPlanner: ['Market update', 'Buyer myth post', 'Open house reel', 'Client success story', 'Weekend showing CTA'],
    campaignHistory: ['Open House Weekend', 'Seller Valuation Push', 'Move-Up Buyer Guide'],
    generatedContent: ['Homebuyer checklist', 'Listing caption set', 'Neighborhood reel outline'],
    mediaLibrary: ['Listing photos', 'Neighborhood clips', 'Client testimonial graphics'],
    templateUsage: ['Market Update used 6x', 'Listing Spotlight used 4x', 'Open House Story used 3x'],
    recommendations: [
      {
        category: 'Recommended Campaigns',
        title: 'Create a First-Time Homebuyer Series',
        description: 'Build a 5-part education sequence that turns hesitant renters into buyer consultations.',
        reason: 'Buyer education appears in your planner and generated content, but has not been packaged as a full campaign.',
        estimatedImpact: 'More consultation leads from early-stage buyers',
        difficulty: 'Medium',
        recommendedAction: 'Generate a campaign with checklist lead magnet, carousel posts, and consultation CTA.'
      }
    ]
  },
  {
    id: 'hvac',
    businessType: 'HVAC Company',
    selectedKit: 'HVAC Growth Kit',
    kitIncludes: ['Seasonal offer templates', 'Inspection campaigns', 'Technician trust posts', 'CTA library', 'Local service hashtags'],
    performance: { bestChannel: 'Google Business Profile', engagementRate: '5.2%', leadTrend: '+22% calls during heat alerts', topContent: 'Maintenance checklists' },
    socialConnections: ['Facebook connected', 'Google Business Profile connected', 'Instagram manual posting'],
    weeklyPlanner: ['Heat wave checklist', 'Filter reel', 'Technician introduction', 'Financing FAQ', 'Emergency service reminder'],
    campaignHistory: ['Summer Tune-Up Blitz', 'Filter Club Launch', 'No-Cool Emergency Push'],
    generatedContent: ['AC checklist', 'Emergency captions', 'Filter replacement reel'],
    mediaLibrary: ['Technician photos', 'Jobsite before/after images', 'Filter demonstration clips'],
    templateUsage: ['Seasonal Urgency used 7x', 'Technician Trust used 4x', 'Financing FAQ used 2x'],
    recommendations: [
      {
        category: 'Recommended Campaigns',
        title: 'Launch Summer AC Inspection Offer',
        description: 'Promote a limited AC inspection before peak heat and route leads to phone booking.',
        reason: 'Heat-related content and Google Business Profile are already performing well, and your campaign history shows seasonal readiness.',
        estimatedImpact: 'High-intent calls and tune-up bookings',
        difficulty: 'Medium',
        recommendedAction: 'Generate the offer page copy, GBP post, Facebook post, and technician follow-up reminder.'
      }
    ]
  },
  {
    id: 'credit-repair',
    businessType: 'Credit Repair Consultant',
    selectedKit: 'Credit Repair Growth Kit',
    kitIncludes: ['Education templates', 'Lead magnet campaigns', 'Trust-building scripts', 'CTA library', 'Finance hashtags'],
    performance: { bestChannel: 'Instagram', engagementRate: '5.7%', leadTrend: '+9% free analysis requests', topContent: 'Myth-busting carousels' },
    socialConnections: ['Instagram connected', 'Facebook connected', 'LinkedIn manual posting'],
    weeklyPlanner: ['Credit myth carousel', 'Client journey', 'Score factor reel', 'FAQ post', 'Analysis CTA'],
    campaignHistory: ['Tax Refund Reset', 'Homebuyer Prep Series', 'Score Clarity Week'],
    generatedContent: ['Free analysis landing copy', 'Dispute education carousel', 'FAQ captions'],
    mediaLibrary: ['Educational graphics', 'Founder videos', 'Client milestone images'],
    templateUsage: ['Myth Carousel used 9x', 'Client Journey used 3x', 'Free Analysis CTA used 4x'],
    recommendations: [
      {
        category: 'Revenue Opportunities',
        title: 'Promote Free Credit Analysis',
        description: 'Make the free analysis offer the primary CTA across the next week of education content.',
        reason: 'Your best content builds trust, but recent generated assets need a stronger conversion path.',
        estimatedImpact: 'More qualified consult requests',
        difficulty: 'Low',
        recommendedAction: 'Generate a 5-post analysis CTA sequence with compliant language and trust proof.'
      }
    ]
  },
  {
    id: 'restaurant',
    businessType: 'Local Restaurant',
    selectedKit: 'Restaurant Growth Kit',
    kitIncludes: ['Menu templates', 'Weekend promo campaigns', 'Event planner', 'CTA library', 'Food hashtags'],
    performance: { bestChannel: 'Instagram Stories', engagementRate: '7.1%', leadTrend: '+14% reservation clicks', topContent: 'Limited-time menu videos' },
    socialConnections: ['Instagram connected', 'Facebook connected', 'TikTok manual posting'],
    weeklyPlanner: ['Chef special reel', 'Lunch offer', 'Customer review', 'Behind the scenes', 'Weekend special'],
    campaignHistory: ['Brunch Weekend Push', 'Date Night Special', 'Local Loyalty Week'],
    generatedContent: ['Weekend menu captions', 'Chef intro reel', 'Reservation CTA stories'],
    mediaLibrary: ['Dish photos', 'Kitchen prep videos', 'Customer ambiance images'],
    templateUsage: ['Menu Spotlight used 10x', 'Weekend Offer used 5x', 'Review Story used 4x'],
    recommendations: [
      {
        category: 'Recommended Campaigns',
        title: 'Launch Weekend Special Campaign',
        description: 'Bundle dish photos, reservation CTAs, and story reminders into a Friday-to-Sunday revenue push.',
        reason: 'Weekend content is already in the planner and your highest engagement comes from visual menu promotions.',
        estimatedImpact: 'More reservations and walk-ins during peak dining windows',
        difficulty: 'Low',
        recommendedAction: 'Generate the campaign posts, story reminders, and reservation CTA variants.'
      }
    ]
  }
];

export const growthCoachSections = [
  'Today’s Priorities',
  'Quick Wins',
  'Recommended Campaigns',
  'Content Opportunities',
  'Revenue Opportunities',
  'AI Insights',
  'Weekly Growth Plan',
  'Missed Opportunity Alerts'
] as const;

const genericSectionRecommendations: Record<(typeof growthCoachSections)[number], Omit<GrowthCoachRecommendation, 'category'>> = {
  'Today’s Priorities': {
    title: 'Review connected business signals before publishing',
    description: 'Check the business kit, planner, recent content, and social connection status before today’s post goes live.',
    reason: 'The strongest recommendations come from combining kit assets with performance, planner, campaign, media, and template data.',
    estimatedImpact: 'Cleaner execution and fewer missed conversion moments',
    difficulty: 'Low',
    recommendedAction: 'Refresh today’s planner item and generate a CTA-matched post.'
  },
  'Quick Wins': {
    title: 'Repurpose your highest-performing content format',
    description: 'Use the top content signal to generate a variant for the best connected channel.',
    reason: 'Recent content performance shows a proven creative angle that can be reused without starting from scratch.',
    estimatedImpact: 'Fast engagement lift with minimal production',
    difficulty: 'Low',
    recommendedAction: 'Generate one content variation using the most-used template.'
  },
  'Recommended Campaigns': {
    title: 'Package the next planner theme into a campaign',
    description: 'Turn this week’s planner into a multi-touch campaign with posts, CTAs, and follow-up reminders.',
    reason: 'Weekly planner items are more valuable when connected to campaign history and saved kit assets.',
    estimatedImpact: 'More consistent lead capture across the week',
    difficulty: 'Medium',
    recommendedAction: 'Generate a 5-touch campaign from the weekly plan.'
  },
  'Content Opportunities': {
    title: 'Fill content gaps with media you already own',
    description: 'Match unused media library assets to templates that have historically performed well.',
    reason: 'Media inventory and template usage reveal ready-to-publish opportunities.',
    estimatedImpact: 'Higher publishing consistency',
    difficulty: 'Low',
    recommendedAction: 'Generate captions for three unused media assets.'
  },
  'Revenue Opportunities': {
    title: 'Add an offer CTA to educational content',
    description: 'Pair helpful posts with a low-friction booking, quote, consultation, or reservation action.',
    reason: 'Generated content is strongest when every asset has a clear next step tied to revenue.',
    estimatedImpact: 'More measurable leads from existing traffic',
    difficulty: 'Low',
    recommendedAction: 'Generate CTA variants from the kit CTA library.'
  },
  'AI Insights': {
    title: 'Prioritize the channel with the strongest signal',
    description: 'Schedule the most conversion-focused asset on the platform currently showing the best performance.',
    reason: 'Social connections and performance data indicate where attention is already warm.',
    estimatedImpact: 'Better timing and channel fit',
    difficulty: 'Low',
    recommendedAction: 'Generate a channel-specific version of today’s content.'
  },
  'Weekly Growth Plan': {
    title: 'Lock a weekly publish-and-promote rhythm',
    description: 'Assign each planner item a content format, campaign tie-in, and conversion CTA.',
    reason: 'A structured weekly plan prevents disconnected one-off posting.',
    estimatedImpact: 'More predictable audience growth and lead flow',
    difficulty: 'Medium',
    recommendedAction: 'Generate the full weekly growth plan.'
  },
  'Missed Opportunity Alerts': {
    title: 'Reconnect underused channels and dormant campaigns',
    description: 'Identify channels, campaigns, or templates that are available but not being actively used.',
    reason: 'Dormant assets often become quick wins when refreshed with current performance context.',
    estimatedImpact: 'More reach without buying new assets',
    difficulty: 'Low',
    recommendedAction: 'Generate a recovery post for one underused campaign.'
  }
};

export function getBusinessKit(id?: string): BusinessKit {
  return businessKits.find((kit) => kit.id === id) ?? businessKits[0];
}

export function getSectionRecommendations(kit: BusinessKit) {
  return growthCoachSections.map((section) => {
    const kitRecommendation = kit.recommendations.find((recommendation) => recommendation.category === section);
    return {
      section,
      recommendation: kitRecommendation ?? { ...genericSectionRecommendations[section], category: section }
    };
  });
}
