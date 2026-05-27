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
