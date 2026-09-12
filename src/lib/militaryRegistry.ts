/**
 * Military Aircraft Registry & Classification Engine
 * Adapted and optimized from spatial intelligence OSINT patterns
 */

export interface MilitaryIdentification {
  isMilitary: boolean;
  branch?: string;
  category?: 'military';
}

// ICAO 24-bit hex prefixes allocated to military organizations
const MILITARY_HEX_PREFIXES: Array<{ prefix: string; branch: string }> = [
  { prefix: 'AE', branch: 'US Military' },       // US DoD block (Air Force, Navy, Army, Marine Corps)
  { prefix: 'AF', branch: 'US Military' },       // US DoD block
  { prefix: '43C', branch: 'UK Armed Forces' },   // UK Royal Air Force / Navy / Army
  { prefix: '38', branch: 'French Armed Forces' },// France Armée de l'Air
  { prefix: '3E', branch: 'German Air Force' },   // Germany Luftwaffe
  { prefix: '3F', branch: 'German Air Force' },   // Germany Luftwaffe
  { prefix: '480', branch: 'Netherlands Air Force' },
  { prefix: '700', branch: 'Royal Saudi Air Force' },
  { prefix: '7CF', branch: 'Australian Defence Force' },
  { prefix: 'C2', branch: 'Canadian Armed Forces' },
];

// Tactical and operational callsign prefixes
const MILITARY_CALLSIGN_PREFIXES: Array<{ prefix: string; branch: string }> = [
  { prefix: 'RCH', branch: 'Air Mobility Command' },   // Reach
  { prefix: 'RFR', branch: 'Royal Air Force' },         // RAF
  { prefix: 'CNV', branch: 'US Navy Reserve' },        // Convoy
  { prefix: 'ASY', branch: 'Australian Air Force' },   // Aussie
  { prefix: 'SAM', branch: 'Special Air Mission' },     // Presidential / VIP
  { prefix: 'PAT', branch: 'US Army Priority Air' },    // Pat
  { prefix: 'VIPER', branch: 'Tactical Fighter' },
  { prefix: 'COBRA', branch: 'Tactical Strike' },
  { prefix: 'GHOST', branch: 'Tactical Operation' },
  { prefix: 'HAWK', branch: 'Tactical Recon' },
  { prefix: 'REAPER', branch: 'Unmanned Aerial' },
  { prefix: 'FORTE', branch: 'High Altitude Recon' },  // RQ-4 Global Hawk
  { prefix: 'JAKE', branch: 'Electronic Warfare' },    // RC-135
  { prefix: 'HOMER', branch: 'Electronic Recon' },
  { prefix: 'LAGR', branch: 'Air Refueling' },         // KC-135 / KC-46
  { prefix: 'NCHO', branch: 'Air Refueling' },
  { prefix: 'PEACH', branch: 'Joint STARS' },
];

// Specific military airframe types (ICAO type codes)
const MILITARY_AIRCRAFT_TYPES = new Set([
  'F16', 'F15', 'F18', 'F22', 'F35', 'FA18',
  'C17', 'C17A', 'C130', 'C30J', 'A400', 'KC10', 'K35R', 'KC46', 'KC35',
  'B52', 'B1', 'B2', 'B21',
  'EUFI', 'TOR', 'HAWK', 'T38', 'T6', 'M346',
  'E3TF', 'E3CF', 'E737', 'P8', 'P3', 'RC13',
  'MQ9', 'RQ4', 'U2', 'V22',
  'AH64', 'UH60', 'CH47', 'CH53', 'SH60', 'NH90', 'A129', 'T129', 'MI24', 'KA52',
  'SU27', 'SU30', 'SU34', 'SU35', 'SU57', 'MIG29', 'MIG31', 'MIG35', 'IL76', 'TU95', 'TU160'
]);

const MILITARY_DESC_REGEX = /military|air force|navy|army|coast guard|armed forces|luftwaffe|marines|special ops|dod|nato/i;

/**
 * Evaluates whether an aircraft is of military origin based on multi-source intelligence.
 */
export function identifyMilitaryFlight(
  icao24?: string,
  callsign?: string,
  type?: string,
  desc?: string
): MilitaryIdentification {
  const cleanIcao = (icao24 || '').toUpperCase().trim();
  const cleanCallsign = (callsign || '').toUpperCase().trim();
  const cleanType = (type || '').toUpperCase().trim();
  const cleanDesc = (desc || '').trim();

  // 1. Check ICAO24 hex prefix match
  if (cleanIcao) {
    for (const entry of MILITARY_HEX_PREFIXES) {
      if (cleanIcao.startsWith(entry.prefix)) {
        return { isMilitary: true, branch: entry.branch, category: 'military' };
      }
    }
  }

  // 2. Check military callsign prefix match
  if (cleanCallsign && cleanCallsign !== '?') {
    for (const entry of MILITARY_CALLSIGN_PREFIXES) {
      if (cleanCallsign.startsWith(entry.prefix)) {
        return { isMilitary: true, branch: entry.branch, category: 'military' };
      }
    }
  }

  // 3. Check aircraft type designator
  if (cleanType && cleanType !== '—') {
    if (MILITARY_AIRCRAFT_TYPES.has(cleanType)) {
      return { isMilitary: true, branch: 'Military Aircraft', category: 'military' };
    }
  }

  // 4. Check description keywords
  if (cleanDesc && MILITARY_DESC_REGEX.test(cleanDesc)) {
    return { isMilitary: true, branch: 'Military Aircraft', category: 'military' };
  }

  return { isMilitary: false };
}
