const SOURCES = [
  {
    category: 'Trajectoires de tempêtes',
    items: [
      {
        name: 'IBTrACS v04r01',
        provider: 'NOAA / NCEI',
        provides: 'Trajectoires horaires, vent max (kt), pression centrale — bassin WP & NA, 1842–2023',
        coverage: '1484 typhons (WP Manila+Tokyo) · 592 ouragans (NA Miami)',
        url: 'https://www.ncei.noaa.gov/products/international-best-track-archive',
        badge: 'IBTrACS',
      },
    ],
  },
  {
    category: 'Taux de danger (hazard rate)',
    items: [
      {
        name: 'ERA5 Reanalysis',
        provider: 'Open-Meteo API / ECMWF',
        provides: 'Vent journalier max 10m, 1984–2023 — taux empirique de dépassement du seuil',
        coverage: 'Manille, Miami, Tokyo — 40 ans de données',
        url: 'https://open-meteo.com/en/docs/historical-weather-api',
        badge: 'ERA5',
      },
    ],
  },
  {
    category: 'Modèle de vent (par bâtiment)',
    items: [
      {
        name: 'Holland (1980)',
        provider: 'Monthly Weather Review, 108(8)',
        provides: 'Profil radial du vent en fonction de la distance au centre de la tempête',
        coverage: 'V(r) = Vmax × √[(Rmax/r)^B × exp(1 − (Rmax/r)^B)]',
        url: 'https://doi.org/10.1175/1520-0493(1980)108%3C1212:AAAMOT%3E2.0.CO;2',
        badge: 'Holland 1980',
      },
      {
        name: 'Willoughby & Darling (2004)',
        provider: 'Monthly Weather Review, 132(12)',
        provides: 'Estimation empirique du rayon de vent max (Rmax) en fonction de Vmax et latitude',
        coverage: 'Rmax = 46.4 × exp(−0.0155 × Vmax + 0.0169 × lat)',
        url: 'https://doi.org/10.1175/MWR2831.1',
        badge: 'W&D 2004',
      },
    ],
  },
  {
    category: 'Courbes de vulnérabilité',
    items: [
      {
        name: 'FEMA Hazus 5.1 — Chapitre 5',
        provider: 'Federal Emergency Management Agency',
        provides: 'Courbes dommages par type de bâtiment en fonction du vent (km/h)',
        coverage: '6 types : bois, maçonnerie, béton armé, acier, commercial, RC parasismique',
        url: 'https://www.fema.gov/flood-maps/products-tools/hazus',
        badge: 'FEMA',
      },
    ],
  },
  {
    category: 'Empreintes bâtiments',
    items: [
      {
        name: 'OpenStreetMap / Overpass API',
        provider: 'OpenStreetMap contributors, ODbL',
        provides: 'Contours et types de bâtiments — Malate, Brickell, Kōtō-ku',
        coverage: '24 bâtiments réels (8 par ville) avec coordonnées et type de structure',
        url: 'https://overpass-api.de',
        badge: 'OSM',
      },
    ],
  },
  {
    category: 'Pertes documentées (validation)',
    items: [
      {
        name: 'NDRRMC Philippines 2014',
        provider: 'National Disaster Risk Reduction Management Council',
        provides: 'Pertes Rammasun 2014 — $4.6B total Philippines, $145M Metro Manila',
        coverage: 'Manille · Rammasun',
        url: 'https://www.ndrrmc.gov.ph',
        badge: 'NDRRMC',
      },
      {
        name: 'World Bank PDNA Ondoy 2009',
        provider: 'World Bank / Philippines Gov.',
        provides: 'Post-Disaster Needs Assessment Ketsana — $1B Philippines, $280M Metro Manila',
        coverage: 'Manille · Ketsana',
        url: 'https://documents.worldbank.org/en/publication/documents-reports',
        badge: 'WB PDNA',
      },
      {
        name: 'Swiss Re Sigma 1/2018',
        provider: 'Swiss Re Institute',
        provides: 'Pertes totales Irma 2017 — $77B US, $4.9B Miami-Dade',
        coverage: 'Miami · Irma',
        url: 'https://www.swissre.com/institute/research/sigma-research.html',
        badge: 'Swiss Re',
      },
      {
        name: 'NOAA NHC Report',
        provider: 'NOAA National Hurricane Center',
        provides: 'Andrew 1992 — $35B (2022$), 63 000 habitations détruites, Homestead FL',
        coverage: 'Miami · Andrew',
        url: 'https://www.nhc.noaa.gov/data/tcr/',
        badge: 'NOAA NHC',
      },
      {
        name: 'General Insurance Assoc. of Japan 2019',
        provider: '損害保険料率算出機構',
        provides: 'Faxai 2019 — ¥960Md pertes assurées ($9B), 40 000 bâtiments Chiba+Kōtō-ku',
        coverage: 'Tokyo · Faxai',
        url: 'https://www.giroj.or.jp',
        badge: 'GIAJ',
      },
      {
        name: 'Munich Re NatCatSERVICE 2019',
        provider: 'Munich Re',
        provides: 'Hagibis 2019 — $15B total, 70 000 bâtiments inondés Tokyo-Est',
        coverage: 'Tokyo · Hagibis',
        url: 'https://www.munichre.com/en/risks/natural-disasters-losses-are-trending-upwards.html',
        badge: 'Munich Re',
      },
    ],
  },
]

function SourceCard({ item }) {
  return (
    <div className="rounded border border-border p-2.5 space-y-1" style={{ background: '#0D1117' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-text">{item.name}</span>
          <span className="text-xs text-muted ml-2">— {item.provider}</span>
        </div>
        <span className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: '#1F2937', color: '#60A5FA', border: '1px solid #374151' }}>
          {item.badge}
        </span>
      </div>
      <p className="text-xs text-muted leading-relaxed">{item.provides}</p>
      <div className="text-xs text-muted/60 font-mono italic">{item.coverage}</div>
    </div>
  )
}

export default function SourcesModule() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="text-xs text-muted uppercase tracking-widest font-mono mb-3">
        📚 Sources & Méthodologie
      </div>

      {SOURCES.map((section) => (
        <div key={section.category} className="space-y-2">
          <div className="text-xs font-semibold text-text/70 uppercase tracking-wider font-mono border-b border-border pb-1">
            {section.category}
          </div>
          {section.items.map((item) => (
            <SourceCard key={item.name} item={item} />
          ))}
        </div>
      ))}

      <div className="rounded-lg border border-border p-3 space-y-1" style={{ background: '#0A0E17' }}>
        <div className="text-xs font-mono text-muted uppercase tracking-widest">Chaîne analytique</div>
        <div className="text-xs text-muted leading-relaxed font-mono mt-2">
          IBTrACS tracks
          <span className="text-text/50"> → </span>Holland (1980)
          <span className="text-text/50"> → </span>Vent à l'actif
          <span className="text-text/50"> → </span>FEMA Hazus curve
          <span className="text-text/50"> → </span>Damage ratio
          <span className="text-text/50"> → </span>Loss = value × DR
          <br />
          <br />
          ERA5 1984–2023
          <span className="text-text/50"> → </span>P(vent &gt; seuil/an)
          <span className="text-text/50"> → </span>Hazard rate
          <span className="text-text/50"> → </span>AAL = exposure × hazard × vuln
        </div>
      </div>
    </div>
  )
}
