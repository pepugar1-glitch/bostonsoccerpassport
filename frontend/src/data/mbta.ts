// Simplified MBTA subway line geometry — approximate station-to-station polylines.
// Source: MBTA system map, stations geocoded by approximation. Not authoritative for
// engineering / ops use, fine for visualizing the network for fans.

export type LatLng = [number, number];

export interface MbtaLine {
  id: 'red' | 'orange' | 'blue' | 'green';
  name: string;
  color: string;
  paths: LatLng[][];
}

export const MBTA_LINES: MbtaLine[] = [
  {
    id: 'red',
    name: 'Red Line',
    color: '#DA291C',
    paths: [
      // Main trunk: Alewife -> JFK/UMass
      [
        [42.3954, -71.1426], // Alewife
        [42.3967, -71.1218], // Davis
        [42.3884, -71.1188], // Porter
        [42.3733, -71.119],  // Harvard
        [42.3653, -71.1037], // Central
        [42.3623, -71.0862], // Kendall/MIT
        [42.3617, -71.0708], // Charles/MGH
        [42.3565, -71.0623], // Park Street
        [42.3554, -71.0603], // Downtown Crossing
        [42.3519, -71.0552], // South Station
        [42.3429, -71.057],  // Broadway
        [42.3304, -71.0571], // Andrew
        [42.321, -71.0521],  // JFK/UMass
      ],
      // Ashmont branch
      [
        [42.321, -71.0521],
        [42.311, -71.0537],  // Savin Hill
        [42.3, -71.0617],    // Fields Corner
        [42.2933, -71.0654], // Shawmut
        [42.2843, -71.0644], // Ashmont
      ],
      // Braintree branch
      [
        [42.321, -71.0521],
        [42.2756, -71.0301], // North Quincy
        [42.2666, -71.0204], // Wollaston
        [42.2515, -71.0049], // Quincy Center
        [42.2335, -71.0072], // Quincy Adams
        [42.2076, -71.0011], // Braintree
      ],
    ],
  },
  {
    id: 'orange',
    name: 'Orange Line',
    color: '#ED8B00',
    paths: [
      [
        [42.4365, -71.0708], // Oak Grove
        [42.4267, -71.0742], // Malden Center
        [42.4029, -71.0768], // Wellington
        [42.3927, -71.0776], // Assembly
        [42.3839, -71.0768], // Sullivan Square
        [42.3739, -71.0667], // Community College
        [42.3656, -71.0612], // North Station
        [42.3631, -71.0581], // Haymarket
        [42.3589, -71.0573], // State
        [42.3554, -71.0603], // Downtown Crossing
        [42.3528, -71.0626], // Chinatown
        [42.3493, -71.0639], // Tufts Medical
        [42.3473, -71.0758], // Back Bay
        [42.3416, -71.0838], // Massachusetts Ave
        [42.3361, -71.0884], // Ruggles
        [42.3315, -71.0954], // Roxbury Crossing
        [42.3232, -71.0992], // Jackson Square
        [42.3173, -71.1042], // Stony Brook
        [42.3104, -71.1071], // Green Street
        [42.3009, -71.1144], // Forest Hills
      ],
    ],
  },
  {
    id: 'blue',
    name: 'Blue Line',
    color: '#003DA5',
    paths: [
      [
        [42.4137, -70.992],  // Wonderland
        [42.4078, -70.993],  // Revere Beach
        [42.3973, -70.992],  // Beachmont
        [42.3902, -71.0024], // Suffolk Downs
        [42.3866, -71.0067], // Orient Heights
        [42.3796, -71.0227], // Wood Island
        [42.3744, -71.0303], // Airport
        [42.3691, -71.0386], // Maverick
        [42.3597, -71.051],  // Aquarium
        [42.3589, -71.0573], // State
        [42.3596, -71.0599], // Government Center
        [42.3614, -71.0626], // Bowdoin
      ],
    ],
  },
  {
    id: 'green',
    name: 'Green Line (trunk)',
    color: '#00843D',
    paths: [
      // Trunk: Medford/Tufts -> Kenmore (skipping B/C/D/E branches for clarity)
      [
        [42.4072, -71.1083], // Medford/Tufts
        [42.4007, -71.0973], // Ball Square
        [42.3961, -71.1006], // Magoun Square
        [42.391, -71.1004],  // Gilman Square
        [42.385, -71.0866],  // East Somerville
        [42.3713, -71.076],  // Lechmere
        [42.3667, -71.0689], // Science Park
        [42.3656, -71.0612], // North Station
        [42.3631, -71.0581], // Haymarket
        [42.3596, -71.0599], // Government Center
        [42.3565, -71.0623], // Park Street
        [42.3527, -71.0644], // Boylston
        [42.3517, -71.0709], // Arlington
        [42.3499, -71.0786], // Copley
        [42.3477, -71.0871], // Hynes
        [42.3489, -71.0958], // Kenmore
      ],
    ],
  },
];

export interface MbtaStation {
  name: string;
  lat: number;
  lng: number;
  lines: MbtaLine['id'][];
}

export const MBTA_STATIONS: MbtaStation[] = [
  // Red Line
  { name: 'Alewife', lat: 42.3954, lng: -71.1426, lines: ['red'] },
  { name: 'Davis', lat: 42.3967, lng: -71.1218, lines: ['red'] },
  { name: 'Porter', lat: 42.3884, lng: -71.1188, lines: ['red'] },
  { name: 'Harvard', lat: 42.3733, lng: -71.119, lines: ['red'] },
  { name: 'Central', lat: 42.3653, lng: -71.1037, lines: ['red'] },
  { name: 'Kendall/MIT', lat: 42.3623, lng: -71.0862, lines: ['red'] },
  { name: 'Charles/MGH', lat: 42.3617, lng: -71.0708, lines: ['red'] },
  { name: 'Park Street', lat: 42.3565, lng: -71.0623, lines: ['red', 'green'] },
  { name: 'Downtown Crossing', lat: 42.3554, lng: -71.0603, lines: ['red', 'orange'] },
  { name: 'South Station', lat: 42.3519, lng: -71.0552, lines: ['red'] },
  { name: 'Broadway', lat: 42.3429, lng: -71.057, lines: ['red'] },
  { name: 'Andrew', lat: 42.3304, lng: -71.0571, lines: ['red'] },
  { name: 'JFK/UMass', lat: 42.321, lng: -71.0521, lines: ['red'] },
  { name: 'Savin Hill', lat: 42.311, lng: -71.0537, lines: ['red'] },
  { name: 'Fields Corner', lat: 42.3, lng: -71.0617, lines: ['red'] },
  { name: 'Shawmut', lat: 42.2933, lng: -71.0654, lines: ['red'] },
  { name: 'Ashmont', lat: 42.2843, lng: -71.0644, lines: ['red'] },
  { name: 'North Quincy', lat: 42.2756, lng: -71.0301, lines: ['red'] },
  { name: 'Wollaston', lat: 42.2666, lng: -71.0204, lines: ['red'] },
  { name: 'Quincy Center', lat: 42.2515, lng: -71.0049, lines: ['red'] },
  { name: 'Quincy Adams', lat: 42.2335, lng: -71.0072, lines: ['red'] },
  { name: 'Braintree', lat: 42.2076, lng: -71.0011, lines: ['red'] },
  // Orange Line
  { name: 'Oak Grove', lat: 42.4365, lng: -71.0708, lines: ['orange'] },
  { name: 'Malden Center', lat: 42.4267, lng: -71.0742, lines: ['orange'] },
  { name: 'Wellington', lat: 42.4029, lng: -71.0768, lines: ['orange'] },
  { name: 'Assembly', lat: 42.3927, lng: -71.0776, lines: ['orange'] },
  { name: 'Sullivan Square', lat: 42.3839, lng: -71.0768, lines: ['orange'] },
  { name: 'Community College', lat: 42.3739, lng: -71.0667, lines: ['orange'] },
  { name: 'North Station', lat: 42.3656, lng: -71.0612, lines: ['orange', 'green'] },
  { name: 'Haymarket', lat: 42.3631, lng: -71.0581, lines: ['orange', 'green'] },
  { name: 'State', lat: 42.3589, lng: -71.0573, lines: ['orange', 'blue'] },
  { name: 'Chinatown', lat: 42.3528, lng: -71.0626, lines: ['orange'] },
  { name: 'Tufts Medical', lat: 42.3493, lng: -71.0639, lines: ['orange'] },
  { name: 'Back Bay', lat: 42.3473, lng: -71.0758, lines: ['orange'] },
  { name: 'Massachusetts Ave', lat: 42.3416, lng: -71.0838, lines: ['orange'] },
  { name: 'Ruggles', lat: 42.3361, lng: -71.0884, lines: ['orange'] },
  { name: 'Roxbury Crossing', lat: 42.3315, lng: -71.0954, lines: ['orange'] },
  { name: 'Jackson Square', lat: 42.3232, lng: -71.0992, lines: ['orange'] },
  { name: 'Stony Brook', lat: 42.3173, lng: -71.1042, lines: ['orange'] },
  { name: 'Green Street', lat: 42.3104, lng: -71.1071, lines: ['orange'] },
  { name: 'Forest Hills', lat: 42.3009, lng: -71.1144, lines: ['orange'] },
  // Blue Line
  { name: 'Wonderland', lat: 42.4137, lng: -70.992, lines: ['blue'] },
  { name: 'Revere Beach', lat: 42.4078, lng: -70.993, lines: ['blue'] },
  { name: 'Beachmont', lat: 42.3973, lng: -70.992, lines: ['blue'] },
  { name: 'Suffolk Downs', lat: 42.3902, lng: -71.0024, lines: ['blue'] },
  { name: 'Orient Heights', lat: 42.3866, lng: -71.0067, lines: ['blue'] },
  { name: 'Wood Island', lat: 42.3796, lng: -71.0227, lines: ['blue'] },
  { name: 'Airport', lat: 42.3744, lng: -71.0303, lines: ['blue'] },
  { name: 'Maverick', lat: 42.3691, lng: -71.0386, lines: ['blue'] },
  { name: 'Aquarium', lat: 42.3597, lng: -71.051, lines: ['blue'] },
  { name: 'Government Center', lat: 42.3596, lng: -71.0599, lines: ['blue', 'green'] },
  { name: 'Bowdoin', lat: 42.3614, lng: -71.0626, lines: ['blue'] },
  // Green Line (trunk only)
  { name: 'Medford/Tufts', lat: 42.4072, lng: -71.1083, lines: ['green'] },
  { name: 'Ball Square', lat: 42.4007, lng: -71.0973, lines: ['green'] },
  { name: 'Magoun Square', lat: 42.3961, lng: -71.1006, lines: ['green'] },
  { name: 'Gilman Square', lat: 42.391, lng: -71.1004, lines: ['green'] },
  { name: 'East Somerville', lat: 42.385, lng: -71.0866, lines: ['green'] },
  { name: 'Lechmere', lat: 42.3713, lng: -71.076, lines: ['green'] },
  { name: 'Science Park', lat: 42.3667, lng: -71.0689, lines: ['green'] },
  { name: 'Boylston', lat: 42.3527, lng: -71.0644, lines: ['green'] },
  { name: 'Arlington', lat: 42.3517, lng: -71.0709, lines: ['green'] },
  { name: 'Copley', lat: 42.3499, lng: -71.0786, lines: ['green'] },
  { name: 'Hynes Convention Center', lat: 42.3477, lng: -71.0871, lines: ['green'] },
  { name: 'Kenmore', lat: 42.3489, lng: -71.0958, lines: ['green'] },
];

// Gillette Stadium transit options — pickup points + ride to Gillette in Foxboro.
// Mirrors the official WC stadium services (Boston Stadium Train via South Station
// and Boston Stadium Express bus from Copley + Logan).
export interface GilletteRoute {
  id: string;
  name: string;
  mode: 'train' | 'bus';
  color: string;
  description: string;
  path: LatLng[];
}

export const GILLETTE_ROUTES: GilletteRoute[] = [
  {
    id: 'stadium-train',
    name: 'Boston Stadium Train',
    mode: 'train',
    color: '#FBBF24',
    description: 'South Station → Foxboro via Dedham. Special-event commuter rail · ~$20 one-way · ~20K capacity per match.',
    path: [
      [42.3519, -71.0552], // South Station
      [42.2412, -71.1729], // Dedham junction (approx via Readville)
      [42.1839, -71.2257], // Walpole area
      [42.0909, -71.2643], // Gillette
    ],
  },
  {
    id: 'stadium-bus',
    name: 'Boston Stadium Express',
    mode: 'bus',
    color: '#A78BFA',
    description: 'Copley Square → Gillette. Yankee Line express coach · ~$95 round-trip · runs every match.',
    path: [
      [42.3499, -71.0786], // Copley Square
      [42.3344, -71.1085], // Brookline approx
      [42.2476, -71.1731], // Dedham approx
      [42.1554, -71.226],  // Walpole approx
      [42.0909, -71.2643], // Gillette
    ],
  },
];
