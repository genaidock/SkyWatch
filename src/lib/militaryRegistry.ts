/**
 * Military Aircraft Registry & Classification Engine
 * Adapted and optimized from spatial intelligence OSINT patterns
 */

export interface MilitaryIdentification {
  isMilitary: boolean;
  branch?: string;
  category?: 'military';
  isGov?: boolean;
  operator?: string;
}

// ICAO 24-bit hex prefixes allocated to military and state organizations (adapted from plane-alert-db)
const MILITARY_HEX_PREFIXES: Array<{ prefix: string; branch: string }> = [
  { prefix: 'AE', branch: 'US Military' },       // US DoD block (Air Force, Navy, Army, Marine Corps)
  { prefix: 'AF', branch: 'US Military' },       // US DoD block
  { prefix: '43C', branch: 'UK Armed Forces' },   // UK Royal Air Force / Navy / Army
  { prefix: '38', branch: 'French Armed Forces' },// France Armée de l'Air
  { prefix: '3E', branch: 'German Air Force' },   // Germany Luftwaffe
  { prefix: '3F', branch: 'German Air Force' },   // Germany Luftwaffe
  { prefix: '30', branch: 'Italian Armed Forces' },// Aeronautica Militare
  { prefix: '33', branch: 'Italian Armed Forces' },
  { prefix: '480', branch: 'Netherlands Air Force' },
  { prefix: '700', branch: 'Royal Saudi Air Force' },
  { prefix: '7CF', branch: 'Australian Defence Force' },
  { prefix: 'C2', branch: 'Canadian Armed Forces' },
  { prefix: '79', branch: 'Turkish Air Force' },
  { prefix: 'E4', branch: 'Brazilian Air Force' },
  { prefix: '0000', branch: 'Colombian Military' },
  { prefix: '0011', branch: 'Colombian Military' },
  { prefix: '0085', branch: 'South African Air Force' },
  { prefix: '00A2', branch: 'South African Air Force' },
  { prefix: '00B8', branch: 'South African Air Force' },
  { prefix: '00CB', branch: 'South African Air Force' },
  { prefix: '00EA', branch: 'South African Air Force' },
  { prefix: '0100', branch: 'Egyptian Air Force' },
  { prefix: '0200', branch: 'Royal Moroccan Air Force' },
];

// Curated high-profile military and VIP/government aircraft by specific ICAO24 hex code
const PLANE_ALERT_HEXES: Record<string, { branch: string; operator: string; isGov?: boolean }> = {
  // US Presidential / Executive Airlift
  'ADFDF8': { branch: 'USAF 89th Airlift Wing', operator: 'US Air Force (VC-25A Air Force One)', isGov: true },
  'ADFDF9': { branch: 'USAF 89th Airlift Wing', operator: 'US Air Force (VC-25A Air Force One)', isGov: true },
  'ADFE42': { branch: 'USAF 89th Airlift Wing', operator: 'US Air Force (C-32A Air Force Two)', isGov: true },
  'ADFE43': { branch: 'USAF 89th Airlift Wing', operator: 'US Air Force (C-32A Air Force Two)', isGov: true },
  'ADFDF5': { branch: 'USAF 89th Airlift Wing', operator: 'US Air Force (C-32A Executive)', isGov: true },
  'ADFEB7': { branch: 'USAF 89th Airlift Wing', operator: 'US Air Force (C-40B Executive)', isGov: true },
  // International Heads of State & Royal Squadrons
  '43C6EF': { branch: 'UK Royal Air Force', operator: 'RAF No. 32 (The Royal) Squadron VIP Voyager', isGov: true },
  '43C70C': { branch: 'UK Royal Air Force', operator: 'RAF VIP Envoy IV (Dassault Falcon 900LX)', isGov: true },
  '3B77C4': { branch: 'French Air and Space Force', operator: 'ET60 Presidential A330 (Cotam Un)', isGov: true },
  '3EA42E': { branch: 'German Air Force', operator: 'Luftwaffe Special Air Mission A350 (Konrad Adenauer)', isGov: true },
  '3EA42F': { branch: 'German Air Force', operator: 'Luftwaffe Special Air Mission A350 (Theodor Heuss)', isGov: true },
  '76BA01': { branch: 'Japan Air Self-Defense Force', operator: 'JASDF 701st Special Airlift Squadron (B777-300ER)', isGov: true },
  '76BA02': { branch: 'Japan Air Self-Defense Force', operator: 'JASDF 701st Special Airlift Squadron (B777-300ER)', isGov: true },
  '7CF824': { branch: 'Royal Australian Air Force', operator: 'RAAF No. 34 Squadron (VIP KC-30A)', isGov: true },
  '00AEC9': { branch: 'South African Air Force', operator: 'SAAF 21 Squadron Presidential BBJ (Inkwazi)', isGov: true },
  '010024': { branch: 'Egyptian Government', operator: 'Egypt Presidential Airbus A340', isGov: true },
  '0082C0': { branch: 'United Nations', operator: 'United Nations Peacekeeping Transport', isGov: true },
  '00870E': { branch: 'United Nations', operator: 'United Nations Mission Air Support', isGov: true },
};

// Tactical and operational callsign prefixes (expanded from SDR-Enthusiasts plane-alert-db)
const MILITARY_CALLSIGN_PREFIXES: Array<{ prefix: string; branch: string }> = [
  { prefix: 'RCH', branch: 'Air Mobility Command' },   // Reach
  { prefix: 'RFR', branch: 'Royal Air Force' },         // RAF
  { prefix: 'CNV', branch: 'US Navy Reserve' },        // Convoy
  { prefix: 'ASY', branch: 'Australian Air Force' },   // Aussie
  { prefix: 'SAM', branch: 'Special Air Mission' },     // Presidential / VIP
  { prefix: 'PAT', branch: 'US Army Priority Air' },    // Pat
  { prefix: 'SPAR', branch: 'US Senior Official Airlift' },
  { prefix: 'ASCOT', branch: 'RAF Air Transport' },
  { prefix: 'MADFOX', branch: 'US Navy Maritime Patrol' },
  { prefix: 'TOPCAT', branch: 'Air Refueling Wing' },
  { prefix: 'DOOM', branch: 'Air Force Global Strike' },
  { prefix: 'VALKYRIE', branch: 'Tactical Strike' },
  { prefix: 'NIGHTHAWK', branch: 'Tactical Recon' },
  { prefix: 'REDEYE', branch: 'Airborne Early Warning' },
  { prefix: 'EVAC', branch: 'Aeromedical Evacuation' },
  { prefix: 'TALON', branch: 'Special Operations' },
  { prefix: 'BART', branch: 'Tactical Training' },
  { prefix: 'COTAM', branch: 'French Air Force Transport' },
  { prefix: 'GAF', branch: 'German Air Force' },
  { prefix: 'IAM', branch: 'Italian Air Force' },
  { prefix: 'CFC', branch: 'Canadian Armed Forces' },
  { prefix: 'BAF', branch: 'Belgian Air Force' },
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

// Specific military airframe types (ICAO type codes, expanded from plane-alert-db)
const MILITARY_AIRCRAFT_TYPES = new Set([
  // Fighters & Attack
  'F16', 'F15', 'F18', 'F22', 'F35', 'FA18', 'A10', 'AV8B', 'HAR',
  'EUFI', 'TOR', 'RAFALE', 'M2000', 'GR4', 'JAS39',
  'SU24', 'SU25', 'SU27', 'SU30', 'SU34', 'SU35', 'SU57',
  'MIG29', 'MIG31', 'MIG35',
  'J10', 'J11', 'J15', 'J16', 'J20', 'JH7',
  // Transports, Tankers & Patrol
  'C17', 'C17A', 'C130', 'C30J', 'A400', 'C295', 'CN35', 'C27J', 'C2',
  'KC10', 'K35R', 'KC46', 'KC35', 'KC767', 'A330MRTT',
  'IL76', 'IL78', 'AN12', 'AN26', 'AN124', 'Y20',
  'B52', 'B1', 'B2', 'B21', 'TU95', 'TU160', 'TU22M',
  // Trainers & Light Attack
  'HAWK', 'T38', 'T6', 'T45', 'M346', 'L39', 'L159', 'T50',
  // Airborne Early Warning, Recon & Electronic Warfare
  'E3TF', 'E3CF', 'E737', 'E2', 'E2C', 'E2D', 'KJ200', 'KJ500',
  'P8', 'P8A', 'P3', 'RC13', 'EP3', 'U2',
  'MQ9', 'RQ4', 'V22', 'MV22', 'CV22',
  // Combat & Military Helicopters
  'AH64', 'UH60', 'CH47', 'CH53', 'SH60', 'NH90', 'A129', 'T129', 'MI24', 'MI28', 'KA52', 'UH1', 'AH1'
]);

const MILITARY_DESC_REGEX = /military|air force|navy|army|coast guard|armed forces|luftwaffe|marines|special ops|dod|nato|aeronautica militare|royal air force/i;

/**
 * Evaluates whether an aircraft is of military or government/VIP origin based on multi-source intelligence.
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

  // 1. Check curated high-value ICAO hex database (plane-alert-db)
  if (cleanIcao && PLANE_ALERT_HEXES[cleanIcao]) {
    const entry = PLANE_ALERT_HEXES[cleanIcao];
    return {
      isMilitary: true,
      branch: entry.branch,
      operator: entry.operator,
      isGov: entry.isGov,
      category: 'military'
    };
  }

  // 2. Check ICAO24 hex prefix match
  if (cleanIcao) {
    for (const entry of MILITARY_HEX_PREFIXES) {
      if (cleanIcao.startsWith(entry.prefix)) {
        return { isMilitary: true, branch: entry.branch, category: 'military' };
      }
    }
  }

  // 3. Check military callsign prefix match
  if (cleanCallsign && cleanCallsign !== '?') {
    for (const entry of MILITARY_CALLSIGN_PREFIXES) {
      if (cleanCallsign.startsWith(entry.prefix)) {
        return { isMilitary: true, branch: entry.branch, category: 'military' };
      }
    }
  }

  // 4. Check aircraft type designator
  if (cleanType && cleanType !== '—') {
    if (MILITARY_AIRCRAFT_TYPES.has(cleanType)) {
      return { isMilitary: true, branch: 'Military Aircraft', category: 'military' };
    }
  }

  // 5. Check description keywords
  if (cleanDesc && MILITARY_DESC_REGEX.test(cleanDesc)) {
    return { isMilitary: true, branch: 'Military Aircraft', category: 'military' };
  }

  return { isMilitary: false };
}
