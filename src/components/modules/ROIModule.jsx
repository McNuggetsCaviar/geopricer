import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'
import { calcAAL, buildROITimeline, calcPaybackYear, formatEur, calcNetROI } from '../../lib/aal'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 6, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
      <div style={{ color: '#6B7280', marginBottom: 4 }}>Année {label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {formatEur(p.value)}
        </div>
      ))}
      {payload.length === 2 && (
        <div style={{ color: '#1D9E75', marginTop: 4 }}>
          Économie: {formatEur(payload[0].value - payload[1].value)}
        </div>
      )}
    </div>
  )
}

export default function ROIModule() {
  const { state } = useApp()
  const cityId = state.activeCity
  const city = CITIES[cityId]
  const hazard = state.appData.hazardRates[cityId]

  const aalBefore = calcAAL(city.asset.value, hazard, city.vulnerability.base)
  const aalAfter = calcAAL(city.asset.value, hazard, city.vulnerability.mitigated)
  const timeline = buildROITimeline(city.capex, aalBefore, aalAfter, 10)
  const payback = calcPaybackYear(city.capex, aalBefore, aalAfter)
  const roi10y = calcNetROI(city.capex, aalBefore, aalAfter, 10)

  const chartData = timeline.map((d) => ({
    year: d.year,
    'Sans mitigation': d.lossWithout,
    'Avec mitigation': d.lossWith,
  }))

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="text-xs text-muted uppercase tracking-widest font-mono mb-3">
        💰 ROI Climatique — {city.label} (10 ans)
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border p-2 text-center" style={{ background: '#0D1117' }}>
          <div className="font-mono text-base font-bold" style={{ color: '#E24B4A' }}>
            {formatEur(aalBefore * 10)}
          </div>
          <div className="text-xs text-muted">Pertes sans action</div>
        </div>
        <div className="rounded-lg border border-border p-2 text-center" style={{ background: '#0D1117' }}>
          <div className="font-mono text-base font-bold" style={{ color: '#1D9E75' }}>
            {formatEur(roi10y)}
          </div>
          <div className="text-xs text-muted">ROI net</div>
        </div>
        <div className="rounded-lg border border-border p-2 text-center" style={{ background: '#0D1117' }}>
          <div className="font-mono text-base font-bold" style={{ color: '#60A5FA' }}>
            {payback === Infinity ? '∞' : `An ${payback}`}
          </div>
          <div className="text-xs text-muted">Seuil de rentabilité</div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border p-3" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted font-mono mb-3">Pertes cumulées sur 10 ans</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E24B4A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E24B4A" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1D9E75" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `An ${v}`}
              axisLine={{ stroke: '#1F2937' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => formatEur(v)}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#6B7280' }}
            />
            {payback !== Infinity && payback <= 10 && (
              <ReferenceLine
                x={payback}
                stroke="#60A5FA"
                strokeDasharray="4 2"
                label={{ value: `ROI An ${payback}`, fill: '#60A5FA', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="Sans mitigation"
              stroke="#E24B4A"
              fill="url(#gradRed)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Avec mitigation"
              stroke="#1D9E75"
              fill="url(#gradGreen)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CAPEX breakdown */}
      <div className="rounded-lg border border-border p-3" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted uppercase tracking-widest font-mono mb-2">Bilan financier</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Investissement CAPEX</span>
            <span className="font-mono" style={{ color: '#EF9F27' }}>−{formatEur(city.capex)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Pertes évitées (10 ans)</span>
            <span className="font-mono" style={{ color: '#1D9E75' }}>+{formatEur((aalBefore - aalAfter) * 10)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
            <span className="text-text font-medium">Bénéfice net</span>
            <span className="font-mono font-bold" style={{ color: roi10y > 0 ? '#1D9E75' : '#E24B4A' }}>
              {roi10y > 0 ? '+' : ''}{formatEur(roi10y)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
