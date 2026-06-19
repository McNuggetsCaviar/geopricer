/**
 * FEMA Hazus 5.1 simplified wind vulnerability curves.
 * Each curve is a piecewise-linear function: wind speed (km/h) → damage ratio [0-1].
 * Sources: FEMA Hazus 5.1 Technical Manual, Chapter 5 (Wind).
 */

const CURVES = {
  // Wood-frame residential (most common in PH informal/heritage)
  residential_wood: [
    { v: 0, d: 0 }, { v: 80, d: 0 }, { v: 119, d: 0.05 },
    { v: 154, d: 0.18 }, { v: 178, d: 0.38 }, { v: 209, d: 0.62 },
    { v: 252, d: 0.85 }, { v: 300, d: 1.0 },
  ],
  // Masonry residential (most PH modern housing, Mediterranean Europe)
  residential_masonry: [
    { v: 0, d: 0 }, { v: 100, d: 0 }, { v: 130, d: 0.03 },
    { v: 154, d: 0.09 }, { v: 178, d: 0.22 }, { v: 209, d: 0.42 },
    { v: 252, d: 0.65 }, { v: 300, d: 0.90 },
  ],
  // Concrete/RC residential (condos, towers — Miami/Manila towers)
  residential_concrete: [
    { v: 0, d: 0 }, { v: 110, d: 0 }, { v: 140, d: 0.04 },
    { v: 154, d: 0.08 }, { v: 178, d: 0.15 }, { v: 209, d: 0.30 },
    { v: 252, d: 0.52 }, { v: 300, d: 0.75 },
  ],
  // Commercial masonry (shops, small retail)
  commercial_masonry: [
    { v: 0, d: 0 }, { v: 110, d: 0 }, { v: 140, d: 0.04 },
    { v: 178, d: 0.14 }, { v: 209, d: 0.28 }, { v: 252, d: 0.50 },
    { v: 300, d: 0.75 },
  ],
  // Steel-frame office / modern high-rise (Tokyo, Miami towers)
  office_steel: [
    { v: 0, d: 0 }, { v: 130, d: 0 }, { v: 154, d: 0.02 },
    { v: 178, d: 0.07 }, { v: 209, d: 0.16 }, { v: 252, d: 0.30 },
    { v: 300, d: 0.50 },
  ],
  // RC office (Kōtō-ku style — earthquake-resistant concrete)
  office_rc: [
    { v: 0, d: 0 }, { v: 120, d: 0 }, { v: 154, d: 0.03 },
    { v: 178, d: 0.10 }, { v: 209, d: 0.22 }, { v: 252, d: 0.40 },
    { v: 300, d: 0.60 },
  ],
}

/** Linear interpolation between two curve points */
function lerp(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0
  return y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
}

/**
 * Evaluate FEMA damage ratio for a given wind speed and building type.
 * @param {number} windKmh  - peak wind at the asset (km/h)
 * @param {string} type     - one of CURVES keys
 * @returns {number}        - damage ratio [0-1]
 */
export function damageRatio(windKmh, type = 'residential_masonry') {
  const curve = CURVES[type] || CURVES.residential_masonry
  if (windKmh <= curve[0].v) return 0
  if (windKmh >= curve[curve.length - 1].v) return curve[curve.length - 1].d
  for (let i = 1; i < curve.length; i++) {
    if (windKmh <= curve[i].v) {
      return lerp(windKmh, curve[i - 1].v, curve[i].v, curve[i - 1].d, curve[i].d)
    }
  }
  return curve[curve.length - 1].d
}

export const BUILDING_TYPE_LABELS = {
  residential_wood:    'Bois / Léger',
  residential_masonry: 'Maçonnerie',
  residential_concrete:'Béton armé',
  commercial_masonry:  'Commercial maçon.',
  office_steel:        'Acier (bureau)',
  office_rc:           'RC parasismique',
}

export const CURVE_TYPES = Object.keys(CURVES)
