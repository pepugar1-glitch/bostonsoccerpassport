import type { SoccerEvent, Match, Reward, QuizQuestion, TriviaQuestion, FanArchetype } from '@/types';

export const EVENTS: SoccerEvent[] = [
  {
    id: 'evt-jun13-festival-open',
    date: '2026-06-13',
    time: '11:00',
    title: 'Fan Festival Opening Day',
    venueId: 'city-hall-plaza',
    venueName: 'Boston City Hall Plaza',
    timeBucket: 'morning',
    category: 'fan-festival',
    description: 'Ribbon-cutting, youth clinics, live music, and the first big-screen match of the host-city festival.',
  },
  {
    id: 'evt-jun16-group-stage',
    date: '2026-06-16',
    time: '15:00',
    title: 'Group Stage Watch Party',
    venueId: 'high-street-place',
    venueName: 'High Street Place',
    timeBucket: 'afternoon',
    category: 'watch-party',
    description: 'Indoor multi-screen viewing for the marquee afternoon group-stage match. Reserved seating available.',
  },
  {
    id: 'evt-jun22-faialense',
    date: '2026-06-22',
    time: '19:00',
    title: 'Community Soccer Night',
    venueId: 'faialense',
    venueName: 'Faialense Sport Club',
    timeBucket: 'evening',
    category: 'culture-hub',
    description: 'Portuguese community club opens its doors for a community watch night with traditional food and family entertainment.',
  },
  {
    id: 'evt-jun25-volo',
    date: '2026-06-25',
    time: '18:30',
    title: 'Volo Pickup Soccer Night',
    venueId: 'volo-assembly',
    venueName: 'Club Volo Assembly Row',
    timeBucket: 'evening',
    category: 'amateur-league',
    description: 'Drop-in coed pickup matches. All skill levels welcome — gear provided, stay for the post-match social.',
  },
  {
    id: 'evt-jul09-quarter',
    date: '2026-07-09',
    time: '16:00',
    title: 'Quarterfinal Watch Party',
    venueId: 'city-hall-plaza',
    venueName: 'Boston City Hall Plaza',
    timeBucket: 'afternoon',
    category: 'fan-festival',
    description: 'Stadium-scale outdoor viewing for the host-city quarterfinal. Expect the biggest crowd of the summer.',
  },
  {
    id: 'evt-jul19-revs-nycfc',
    date: '2026-07-19',
    time: '19:30',
    title: 'Revolution vs NYCFC',
    venueId: 'gillette',
    venueName: 'Gillette Stadium',
    timeBucket: 'evening',
    category: 'revs-rewards',
    description: 'Revolution home match. Placeholder opponent — verify against MLS schedule. Stadium Express buses available.',
  },
  {
    id: 'evt-aug02-revs-miami',
    date: '2026-08-02',
    time: '19:30',
    title: 'Revolution vs Inter Miami CF',
    venueId: 'gillette',
    venueName: 'Gillette Stadium',
    timeBucket: 'evening',
    category: 'revs-rewards',
    description: 'Marquee home matchup. Placeholder opponent — verify against MLS schedule. Family Day activations on the concourse.',
  },
  {
    id: 'evt-aug09-supporter-night',
    date: '2026-08-09',
    time: '18:00',
    title: 'Supporter Welcome Night',
    venueId: 'patriot-place',
    venueName: 'Patriot Place',
    timeBucket: 'evening',
    category: 'revs-rewards',
    description: 'Open-tent meetup for visitors and new supporters. Tifo workshops, supporter group introductions, and matchday primer.',
  },
  {
    id: 'evt-aug23-revs-union',
    date: '2026-08-23',
    time: '19:30',
    title: 'Revolution vs Philadelphia Union',
    venueId: 'gillette',
    venueName: 'Gillette Stadium',
    timeBucket: 'evening',
    category: 'revs-rewards',
    description: 'East Conference rivalry night. Placeholder opponent — verify against MLS schedule. Premium tailgate at Patriot Place.',
  },
];

export const UPCOMING_MATCHES: Match[] = [
  {
    id: 'match-jul19',
    date: '2026-07-19',
    opponent: 'NYCFC',
    homeAway: 'home',
    competition: 'MLS Regular Season',
    note: 'Placeholder — verify against MLS schedule.',
  },
  {
    id: 'match-aug02',
    date: '2026-08-02',
    opponent: 'Inter Miami CF',
    homeAway: 'home',
    competition: 'MLS Regular Season',
    note: 'Placeholder — verify against MLS schedule.',
  },
];

export const REWARDS: Reward[] = [
  {
    id: 'rw-100',
    cost: 100,
    title: 'Revs Digital Fan Badge',
    description: 'Unlockable in-app badge for your profile. First step into the Revolution fan community.',
    category: 'badge',
    cta: 'Claim Badge',
  },
  {
    id: 'rw-250',
    cost: 250,
    title: 'Revs Merch Discount Code',
    description: 'Promo code for the Revolution team store. Valid online and at Gillette.',
    category: 'merch',
    cta: 'Get Code',
  },
  {
    id: 'rw-400',
    cost: 400,
    title: 'First Revs Match Discount',
    description: 'Discount on your first Revolution match ticket. Perfect entry to the supporter section.',
    category: 'ticket',
    cta: 'Claim Discount',
  },
  {
    id: 'rw-600',
    cost: 600,
    title: 'Partner Food & Drink Credit',
    description: 'Credit at a Revs partner venue — Cisco Brewers Seaport, High Street Place, and more.',
    category: 'food',
    cta: 'Claim Credit',
  },
  {
    id: 'rw-800',
    cost: 800,
    title: 'Supporter Section Welcome',
    description: 'Pre-match meet with a Revs supporter group + curated supporter-section experience.',
    category: 'experience',
    cta: 'Reserve Experience',
  },
  {
    id: 'rw-1000',
    cost: 1000,
    title: 'Meet-and-Greet Lottery Entry',
    description: 'Entry into the season lottery for a player meet-and-greet at Gillette.',
    category: 'lottery',
    cta: 'Enter Lottery',
  },
  {
    id: 'rw-family',
    cost: 500,
    title: 'Family Matchday Upgrade',
    description: 'Youth clinic on the pitch + family matchday upgrade. Bonus for Family Soccer Explorers.',
    category: 'family',
    cta: 'Upgrade Family Day',
  },
];

export const ARCHETYPE_LABELS: Record<FanArchetype, string> = {
  'local-loyalist': 'Local Loyalist',
  'global-matchday-fan': 'Global Matchday Fan',
  'family-soccer-explorer': 'Family Soccer Explorer',
  'player-fan': 'Player-Fan',
  'supporter-section-candidate': 'Supporter Section Candidate',
  'new-to-soccer': 'New to Soccer',
};

export const ARCHETYPE_DESCRIPTIONS: Record<FanArchetype, string> = {
  'local-loyalist':
    'You are deeply rooted in Boston. You already know the neighborhoods, the clubs, and the pubs. Your next step is the Revolution supporter section.',
  'global-matchday-fan':
    'You travel for the game. You came for the summer of soccer — stay for the New England club that plays year-round.',
  'family-soccer-explorer':
    'You are introducing soccer to the whole household. Family-friendly festivals, youth clinics, and matchday upgrades are built for you.',
  'player-fan':
    'You play as much as you watch. Adult leagues, pickup, and tournaments are your way in — Revs supporter culture is the next level.',
  'supporter-section-candidate':
    'You crave the atmosphere — drums, tifos, and ninety minutes of song. The Revs supporter section is calling your name.',
  'new-to-soccer':
    'You are new to the game and ready to learn. Start with a festival or watch party, then build your first matchday from there.',
};

export const ARCHETYPE_NEXT_ACTION: Record<FanArchetype, { label: string; to: string }> = {
  'local-loyalist': { label: 'Plan a Revs matchday', to: '/schedule' },
  'global-matchday-fan': { label: 'Find a watch party near you', to: '/map' },
  'family-soccer-explorer': { label: 'Browse family-friendly stops', to: '/map' },
  'player-fan': { label: 'See amateur leagues', to: '/map' },
  'supporter-section-candidate': { label: 'Browse Revs rewards', to: '/rewards' },
  'new-to-soccer': { label: 'Start at the Fan Festival', to: '/map' },
};

export const ARCHETYPE_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'What brings you to Boston this summer?',
    options: [
      { id: 'a', label: 'I live here — Boston is home.', weight: { 'local-loyalist': 3, 'player-fan': 1 } },
      { id: 'b', label: "Visiting for the summer's soccer.", weight: { 'global-matchday-fan': 3, 'new-to-soccer': 1 } },
      { id: 'c', label: 'On a family trip with the kids.', weight: { 'family-soccer-explorer': 3 } },
      { id: 'd', label: 'I just moved here.', weight: { 'local-loyalist': 1, 'new-to-soccer': 2 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'How do you usually consume soccer?',
    options: [
      { id: 'a', label: 'In a packed pub with strangers becoming friends.', weight: { 'supporter-section-candidate': 3, 'global-matchday-fan': 1 } },
      { id: 'b', label: 'At home with the family.', weight: { 'family-soccer-explorer': 3 } },
      { id: 'c', label: 'On the pitch — I play more than I watch.', weight: { 'player-fan': 3 } },
      { id: 'd', label: 'I am still figuring it out.', weight: { 'new-to-soccer': 3 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'What is your relationship with the Revolution today?',
    options: [
      { id: 'a', label: 'Season ticket holder or close to it.', weight: { 'local-loyalist': 3, 'supporter-section-candidate': 2 } },
      { id: 'b', label: 'I have been to a match or two.', weight: { 'local-loyalist': 2, 'family-soccer-explorer': 1 } },
      { id: 'c', label: 'I know the badge, never been to Gillette.', weight: { 'new-to-soccer': 2, 'global-matchday-fan': 1 } },
      { id: 'd', label: 'Who are the Revolution?', weight: { 'new-to-soccer': 3 } },
    ],
  },
  {
    id: 'q4',
    prompt: 'Pick the activity that sounds most like you this summer.',
    options: [
      { id: 'a', label: 'Tifo workshop + supporter section orientation.', weight: { 'supporter-section-candidate': 3 } },
      { id: 'b', label: 'Pickup match at Assembly Row.', weight: { 'player-fan': 3 } },
      { id: 'c', label: 'Youth clinic + family matchday.', weight: { 'family-soccer-explorer': 3 } },
      { id: 'd', label: 'Watch party with my country represented.', weight: { 'global-matchday-fan': 3 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'Which neighborhood pull do you feel strongest?',
    options: [
      { id: 'a', label: 'East Boston / Brazilian Allston / Portuguese Cambridge.', weight: { 'global-matchday-fan': 2, 'local-loyalist': 1 } },
      { id: 'b', label: 'Seaport / Back Bay — modern, social, after-work.', weight: { 'supporter-section-candidate': 2, 'local-loyalist': 1 } },
      { id: 'c', label: 'Suburban — youth fields and family-friendly.', weight: { 'family-soccer-explorer': 3 } },
      { id: 'd', label: "Anywhere with a screen and a pint.", weight: { 'new-to-soccer': 2, 'global-matchday-fan': 1 } },
    ],
  },
  {
    id: 'q6',
    prompt: 'What would make this summer worth the trip / time?',
    options: [
      { id: 'a', label: 'One unforgettable matchday at Gillette.', weight: { 'local-loyalist': 2, 'supporter-section-candidate': 2 } },
      { id: 'b', label: 'A weekly soccer routine that sticks.', weight: { 'player-fan': 3 } },
      { id: 'c', label: 'My kids loving the sport for life.', weight: { 'family-soccer-explorer': 3 } },
      { id: 'd', label: 'A photo-card story to take home.', weight: { 'global-matchday-fan': 2, 'new-to-soccer': 1 } },
    ],
  },
  {
    id: 'q7',
    prompt: 'How do you want to celebrate after a match?',
    options: [
      { id: 'a', label: 'Sing the song. Stay for the chants.', weight: { 'supporter-section-candidate': 3 } },
      { id: 'b', label: 'Find another match to play.', weight: { 'player-fan': 3 } },
      { id: 'c', label: 'Wind down with the family.', weight: { 'family-soccer-explorer': 3 } },
      { id: 'd', label: 'Post the photo, plan the next one.', weight: { 'global-matchday-fan': 2, 'new-to-soccer': 2 } },
    ],
  },
];

export const TRIVIA_QUIZ: TriviaQuestion[] = [
  {
    id: 't1',
    prompt: 'In what year did the New England Revolution begin play?',
    options: ['1992', '1996', '2000', '2004'],
    correctIndex: 1,
    explanation: 'The Revolution were a founding MLS club in 1996.',
  },
  {
    id: 't2',
    prompt: 'Where do the New England Revolution play their home matches?',
    options: ['Fenway Park', 'TD Garden', 'Gillette Stadium', 'Harvard Stadium'],
    correctIndex: 2,
    explanation: 'The Revolution share Gillette Stadium in Foxborough, MA.',
  },
  {
    id: 't3',
    prompt: 'Which family owns the New England Revolution?',
    options: ['Henry family', 'Kraft family', 'Pagliuca family', 'Wyc Grousbeck'],
    correctIndex: 1,
    explanation: 'Kraft Sports + Entertainment owns the Revolution.',
  },
  {
    id: 't4',
    prompt: 'What is the supporter section nickname most associated with the Revs?',
    options: ['The Cauldron', 'The Fort', 'The Brickyard', 'The Midnight Riders'],
    correctIndex: 3,
    explanation: 'The Midnight Riders are the Revolution\'s flagship supporter group.',
  },
  {
    id: 't5',
    prompt: 'Which Boston neighborhood is the historic heart of Brazilian soccer culture?',
    options: ['Beacon Hill', 'Allston / Brighton', 'South End', 'Fenway'],
    correctIndex: 1,
    explanation: 'Allston / Brighton hosts a dense Brazilian community and matchday culture.',
  },
  {
    id: 't6',
    prompt: 'A regulation MLS match is how many minutes long, not counting stoppage?',
    options: ['80 minutes', '90 minutes', '95 minutes', '100 minutes'],
    correctIndex: 1,
    explanation: 'Two halves of 45 minutes each, plus stoppage time.',
  },
  {
    id: 't7',
    prompt: 'How many players from each team are on the pitch at kickoff?',
    options: ['9', '10', '11', '12'],
    correctIndex: 2,
    explanation: 'Eleven a side — including the goalkeeper.',
  },
  {
    id: 't8',
    prompt: 'Which color combination is most associated with the Revolution badge?',
    options: ['Navy & Red', 'Green & Gold', 'Blue & Yellow', 'Black & White'],
    correctIndex: 0,
    explanation: 'Deep navy and Revolution red — the foundation of this app\'s palette.',
  },
  {
    id: 't9',
    prompt: 'What is a tifo?',
    options: [
      'A foul on the goalkeeper',
      'A large coordinated supporter banner or display',
      'A type of corner kick',
      'A pre-match warmup drill',
    ],
    correctIndex: 1,
    explanation: 'Tifos are giant choreographed visuals from supporter sections.',
  },
  {
    id: 't10',
    prompt: 'What is the most common way to reach Gillette Stadium from downtown Boston on match days?',
    options: [
      'Blue Line subway',
      'Stadium Express bus or Commuter Rail from South Station',
      'Ferry from the Harbor',
      'Green Line trolley',
    ],
    correctIndex: 1,
    explanation: 'Stadium Express coach from Copley or the Commuter Rail from South Station.',
  },
];
