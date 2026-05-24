export const MATERIALS = {
    'Mild Steel (S235)': { yieldStrength: 235, warningThreshold: 200 },
    'Cast Iron (Grade 200)': { yieldStrength: 200, warningThreshold: 160 },
    'Stainless Steel (SS 304)': { yieldStrength: 310, warningThreshold: 260 },
    'Aluminium Alloy (6061-T6)': { yieldStrength: 276, warningThreshold: 230 },
  };
  
  export function calculateStress(mass, area) {
    const force = mass * 9.81;
    const stressPa = force / area;
    const stressMPa = stressPa / 1_000_000;
    return { force, stressMPa };
  }
  
  export function classifyStress(stressMPa, material) {
    const { yieldStrength, warningThreshold } = MATERIALS[material];
    if (stressMPa < warningThreshold) {
      return { status: 'SAFE', color: '#4CAF50' };
    } else if (stressMPa < yieldStrength) {
      return { status: 'WARNING', color: '#FF9800' };
    } else {
      return { status: 'CRITICAL', color: '#F44336' };
    }
  }