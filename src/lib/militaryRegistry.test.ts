import { identifyMilitaryFlight } from './militaryRegistry';

describe('militaryRegistry', () => {
  describe('identifyMilitaryFlight', () => {
    test('identifies military aircraft by US Air Force / Navy ICAO24 hex prefix (AE...) to be military', () => {
      const result = identifyMilitaryFlight('AE0123', 'TEST01', 'C17', 'Cargo');
      expect(result.isMilitary).toBe(true);
      expect(result.branch).toBe('US Military');
    });

    test('identifies UK Royal Air Force by ICAO24 hex prefix (43C...) to be military', () => {
      const result = identifyMilitaryFlight('43C123', 'RRR123', 'A400', 'Transport');
      expect(result.isMilitary).toBe(true);
      expect(result.branch).toBe('UK Armed Forces');
    });

    test('identifies military aircraft by tactical callsigns (e.g. RCH, RFR, CNV, ASY, SAM, VIPER)', () => {
      const resultRCH = identifyMilitaryFlight('A12345', 'RCH814', 'C17A');
      expect(resultRCH.isMilitary).toBe(true);
      expect(resultRCH.branch).toBe('Air Mobility Command');

      const resultCNV = identifyMilitaryFlight('A98765', 'CNV4421', 'C130');
      expect(resultCNV.isMilitary).toBe(true);

      const resultSAM = identifyMilitaryFlight('A55555', 'SAM91', 'B752');
      expect(resultSAM.isMilitary).toBe(true);
      expect(resultSAM.branch).toBe('Special Air Mission');
    });

    test('identifies military aircraft by known military aircraft types (F16, F35, C17, B52, EUFI, etc.)', () => {
      const result = identifyMilitaryFlight('B12345', 'GHOST1', 'F35');
      expect(result.isMilitary).toBe(true);
    });

    test('identifies military aircraft by description keywords (military, air force, navy, army, nato)', () => {
      const result = identifyMilitaryFlight('C12345', 'PAT01', 'T6', 'US Navy Trainer');
      expect(result.isMilitary).toBe(true);
    });

    test('does not misclassify civil airlines or normal flights as military', () => {
      const resultCivil = identifyMilitaryFlight('800123', 'AI101', 'A320', 'Air India Passenger');
      expect(resultCivil.isMilitary).toBe(false);

      const resultCargo = identifyMilitaryFlight('A44444', 'FDX123', 'B77W', 'Federal Express Cargo');
      expect(resultCargo.isMilitary).toBe(false);
    });

    test('identifies high-profile VIP and government transports from plane-alert-db', () => {
      const resultAF1 = identifyMilitaryFlight('ADFDF8', 'SAM28000', 'VC25');
      expect(resultAF1.isMilitary).toBe(true);
      expect(resultAF1.isGov).toBe(true);
      expect(resultAF1.operator).toContain('VC-25A Air Force One');

      const resultRAF = identifyMilitaryFlight('43C6EF', 'RRR999', 'A330');
      expect(resultRAF.isMilitary).toBe(true);
      expect(resultRAF.operator).toContain('VIP Voyager');

      const resultUN = identifyMilitaryFlight('0082C0', 'UNO101', 'H25B');
      expect(resultUN.isMilitary).toBe(true);
      expect(resultUN.operator).toContain('United Nations');
    });

    test('identifies military aircraft by additional country hex prefixes (Italy, Egypt, Turkey, Brazil)', () => {
      const resultItaly = identifyMilitaryFlight('301234', 'IAM123', 'C27J');
      expect(resultItaly.isMilitary).toBe(true);
      expect(resultItaly.branch).toBe('Italian Armed Forces');

      const resultEgypt = identifyMilitaryFlight('01007C', 'EGY01', 'C130');
      expect(resultEgypt.isMilitary).toBe(true);
      expect(resultEgypt.branch).toBe('Egyptian Air Force');

      const resultTurkey = identifyMilitaryFlight('791234', 'TURK01', 'A400');
      expect(resultTurkey.isMilitary).toBe(true);
      expect(resultTurkey.branch).toBe('Turkish Air Force');
    });

    test('identifies aircraft with tactical callsigns from plane-alert-db (SPAR, ASCOT, MADFOX, DOOM)', () => {
      const resultSPAR = identifyMilitaryFlight('A99999', 'SPAR19', 'C40');
      expect(resultSPAR.isMilitary).toBe(true);
      expect(resultSPAR.branch).toBe('US Senior Official Airlift');

      const resultASCOT = identifyMilitaryFlight('B88888', 'ASCOT421', 'A400');
      expect(resultASCOT.isMilitary).toBe(true);
      expect(resultASCOT.branch).toBe('RAF Air Transport');

      const resultMADFOX = identifyMilitaryFlight('C77777', 'MADFOX21', 'P8');
      expect(resultMADFOX.isMilitary).toBe(true);
      expect(resultMADFOX.branch).toBe('US Navy Maritime Patrol');
    });

    test('identifies expanded military airframe types (C295, A330MRTT, RAFALE, TYPHOON, E2)', () => {
      const resultC295 = identifyMilitaryFlight('D11111', 'AIR01', 'C295');
      expect(resultC295.isMilitary).toBe(true);

      const resultRafale = identifyMilitaryFlight('D22222', 'JAG01', 'RAFALE');
      expect(resultRafale.isMilitary).toBe(true);

      const resultMRTT = identifyMilitaryFlight('D33333', 'TANK01', 'A330MRTT');
      expect(resultMRTT.isMilitary).toBe(true);
    });

    test('handles empty or missing parameters gracefully', () => {
      const result = identifyMilitaryFlight(undefined, undefined, undefined, undefined);
      expect(result.isMilitary).toBe(false);
    });
  });
});
