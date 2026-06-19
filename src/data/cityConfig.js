export const CITIES = {
  manila: {
    id: 'manila',
    label: 'Manille',
    country: '🇵🇭',
    district: 'Malate / Baie de Manille',
    riskType: 'Typhon & Onde de tempête',
    coords: [14.5547, 120.9932],
    zoom: 13,
    asset: {
      type: 'Villa résidentielle',
      description: 'Villa R+1, baie vitrée, toiture en tuiles, quartier Malate',
      value: 850000,
      lat: 14.5655,
      lng: 120.9897,
    },
    hazard: {
      fallback: 0.08,
      threshold_kmh: 120,
      label: 'Typhon Cat. 3+ annuel',
      source: 'Open-Meteo ERA5 1984–2023',
    },
    vulnerability: {
      base: 0.30,
      mitigated: 0.05,
      curve: 'FEMA_WIND_RESIDENTIAL',
    },
    capex: 45000,
    mitigationMeasures: [
      'Renforcement charpente toiture',
      'Vitrages anti-impact (PVB laminé)',
      'Ancrage parasismique fondations',
      'Volets roulants tempête',
    ],
    storms: ['rammasun-2014', 'ketsana-2009'],
    audioClips: {
      zone: 'manila-zone',
      history: 'manila-history',
      aal: 'manila-aal',
      mitigation: 'manila-mitigation',
      roi: 'manila-roi',
    },
    boundingBox: [[14.49, 120.93], [14.63, 121.05]],
    color: '#E24B4A',
  },

  miami: {
    id: 'miami',
    label: 'Miami',
    country: '🇺🇸',
    district: 'Brickell / Downtown Miami',
    riskType: 'Ouragan & Submersion marine',
    coords: [25.7617, -80.1918],
    zoom: 13,
    asset: {
      type: 'Appartement de standing',
      description: 'Condo 3BR, 8ème étage, Brickell Avenue, vue Biscayne Bay',
      value: 1200000,
      lat: 25.7650,
      lng: -80.1938,
    },
    hazard: {
      fallback: 0.06,
      threshold_kmh: 120,
      label: 'Ouragan Cat. 3+ annuel',
      source: 'Open-Meteo ERA5 1984–2023 / NOAA',
    },
    vulnerability: {
      base: 0.25,
      mitigated: 0.06,
      curve: 'FEMA_WIND_CONDO',
    },
    capex: 60000,
    mitigationMeasures: [
      'Fenêtres impact-résistant certifiées',
      'Porte blindée anti-tempête',
      'Étanchéité dalle toiture',
      'Groupe électrogène + pompe de relevage',
    ],
    storms: ['irma-2017', 'andrew-1992'],
    audioClips: {
      zone: 'miami-zone',
      history: 'miami-history',
      aal: 'miami-aal',
      mitigation: 'miami-mitigation',
      roi: 'miami-roi',
    },
    boundingBox: [[25.70, -80.26], [25.83, -80.12]],
    color: '#EF9F27',
  },

  tokyo: {
    id: 'tokyo',
    label: 'Tokyo',
    country: '🇯🇵',
    district: 'Kōtō-ku / Ariake',
    riskType: 'Tsunami & Inondation',
    coords: [35.6372, 139.7984],
    zoom: 13,
    asset: {
      type: 'Immeuble de bureaux',
      description: 'Bureau R+4, zone inondable, Ariake, Kōtō-ku',
      value: 2000000,
      lat: 35.6305,
      lng: 139.7924,
    },
    hazard: {
      fallback: 0.04,
      threshold_kmh: 100,
      label: 'Tsunami / Tempête majeure',
      source: 'Open-Meteo ERA5 1984–2023 / JMA',
    },
    vulnerability: {
      base: 0.20,
      mitigated: 0.04,
      curve: 'WORLDBANK_FLOOD_OFFICE',
    },
    capex: 80000,
    mitigationMeasures: [
      'Batardeau anti-inondation (1,5m)',
      'Cloisons étanches rez-de-chaussée',
      'Équipements électriques en hauteur',
      'Système d\'alerte précoce JMA intégré',
    ],
    storms: ['faxai-2019', 'hagibis-2019'],
    audioClips: {
      zone: 'tokyo-zone',
      history: 'tokyo-history',
      aal: 'tokyo-aal',
      mitigation: 'tokyo-mitigation',
      roi: 'tokyo-roi',
    },
    boundingBox: [[35.58, 139.73], [35.70, 139.87]],
    color: '#60A5FA',
  },
}

export const CITY_ORDER = ['manila', 'miami', 'tokyo']

export const MODULE_ORDER = ['zone', 'history', 'portfolio', 'aal', 'mitigation', 'roi', 'sources']

export const MODULE_LABELS = {
  zone: 'Zone & Quartier',
  history: 'Événements historiques',
  portfolio: 'Portfolio Quartier',
  aal: 'Calcul AAL',
  mitigation: 'Stratégie de mitigation',
  roi: 'ROI Climatique',
  sources: 'Sources & Données',
}

export const MODULE_ICONS = {
  zone: '🗺️',
  history: '⚡',
  portfolio: '🏘️',
  aal: '📊',
  mitigation: '🛡️',
  roi: '💰',
  sources: '📚',
}
