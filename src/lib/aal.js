export const calcAAL = (exposure, hazard, vulnerability) =>
  exposure * hazard * vulnerability

export const calcAALYears = (aal, years = 10) => aal * years

export const calcAvoidedLoss = (aalBefore, aalAfter, years = 10) =>
  (aalBefore - aalAfter) * years

export const calcNetROI = (capex, aalBefore, aalAfter, years = 10) =>
  calcAvoidedLoss(aalBefore, aalAfter, years) - capex

export const calcPaybackYear = (capex, aalBefore, aalAfter) => {
  const annualSaving = aalBefore - aalAfter
  if (annualSaving <= 0) return Infinity
  return Math.ceil(capex / annualSaving)
}

export const buildROITimeline = (capex, aalBefore, aalAfter, years = 10) => {
  const timeline = []
  for (let y = 0; y <= years; y++) {
    const lossWithout = aalBefore * y
    const lossWith = aalAfter * y + capex
    timeline.push({
      year: y,
      lossWithout: Math.round(lossWithout),
      lossWith: Math.round(lossWith),
      netBenefit: Math.round(lossWithout - lossWith),
    })
  }
  return timeline
}

export const formatEur = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M€`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k€`
  return `${Math.round(value)}€`
}

export const formatPct = (value) => `${(value * 100).toFixed(1)}%`
