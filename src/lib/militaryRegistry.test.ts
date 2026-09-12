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

    test('handles empty or missing parameters gracefully', () => {
      const result = identifyMilitaryFlight(undefined, undefined, undefined, undefined);
      expect(result.isMilitary).toBe(false);
    });
  });
});
