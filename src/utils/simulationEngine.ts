// Simulation Engine - Core calculation logic for the Intervention Lab
// Handles time dynamics, synergies, diminishing returns, and projections

import {
  interventions,
  baselineStats,
  provincialMultipliers,
  type HealthOutcome,
} from '../data/interventionData';

// Types
export interface SimulationState {
  interventions: Record<string, number>;
  provincialOverrides: Record<string, Record<string, number>>;
  timeHorizon: number;
  budget: number;
}

export interface ProjectedOutcome {
  year: number;
  baseline: number;
  intervention: number;
  superAger: number;
  lowerBound: number;
  upperBound: number;
}

export interface EconomicImpact {
  totalCost: number;
  healthcareSavings: number;
  productivityGains: number;
  qalyGained: number;
  roi: number;
  netBenefit: number;
}

export interface SimulationResult {
  trajectories: Record<HealthOutcome, ProjectedOutcome[]>;
  economicImpact: EconomicImpact;
  activeSynergies: ActiveSynergy[];
  outcomeDeltas: Record<HealthOutcome, number>;
  provincialImpacts: Record<string, Record<HealthOutcome, number>>;
}

export interface ActiveSynergy {
  interventions: string[];
  multiplier: number;
  description: string;
}

// ========== TIME DYNAMICS ==========

/**
 * S-curve adoption function - models gradual implementation and adoption
 * Returns 0-1 representing adoption level at given year
 */
export function adoptionCurve(
  year: number,
  implementationDelay: number,
  rampUpPeriod: number
): number {
  const effectiveYear = Math.max(0, year - implementationDelay);
  if (effectiveYear <= 0) return 0;

  const t = effectiveYear / rampUpPeriod;
  if (t >= 1) return 1;

  // Sigmoid function for S-curve: slow start, rapid middle, plateau
  return 1 / (1 + Math.exp(-6 * (t - 0.5)));
}

/**
 * Diminishing returns function - effect reduces above threshold
 */
export function applyDiminishingReturns(
  baseEffect: number,
  currentLevel: number,
  threshold: number
): number {
  if (currentLevel <= threshold) return baseEffect;

  const excess = currentLevel - threshold;
  // Logarithmic decay above threshold
  return baseEffect * (1 / (1 + 0.05 * excess));
}

// ========== SYNERGY DETECTION ==========

/**
 * Find all active synergies based on current intervention values
 */
export function detectActiveSynergies(
  values: Record<string, number>
): ActiveSynergy[] {
  const activeSynergies: ActiveSynergy[] = [];

  interventions.forEach(intervention => {
    const value = values[intervention.id] ?? intervention.baseline;
    const isActive = value > intervention.baseline;

    if (isActive && intervention.synergies.length > 0) {
      intervention.synergies.forEach(synergy => {
        const partnerIntervention = interventions.find(i => i.id === synergy.withIntervention);
        if (partnerIntervention) {
          const partnerValue = values[synergy.withIntervention] ?? partnerIntervention.baseline;
          const partnerActive = partnerValue > partnerIntervention.baseline;

          if (partnerActive) {
            // Check if we already added this synergy (avoid duplicates)
            const exists = activeSynergies.some(
              s => s.interventions.includes(intervention.id) &&
                   s.interventions.includes(synergy.withIntervention)
            );

            if (!exists) {
              activeSynergies.push({
                interventions: [intervention.id, synergy.withIntervention],
                multiplier: synergy.multiplier,
                description: synergy.description,
              });
            }
          }
        }
      });
    }
  });

  return activeSynergies;
}

/**
 * Calculate synergy multiplier for a specific intervention
 */
export function getSynergyMultiplier(
  interventionId: string,
  activeSynergies: ActiveSynergy[]
): number {
  let multiplier = 1.0;

  activeSynergies.forEach(synergy => {
    if (synergy.interventions.includes(interventionId)) {
      multiplier *= synergy.multiplier;
    }
  });

  return multiplier;
}

// ========== EFFECT CALCULATION ==========

/**
 * Calculate the effect of all interventions on a specific outcome
 */
export function calculateOutcomeEffect(
  outcome: HealthOutcome,
  values: Record<string, number>,
  activeSynergies: ActiveSynergy[],
  year: number
): number {
  let totalEffect = 0;

  interventions.forEach(intervention => {
    const value = values[intervention.id] ?? intervention.baseline;
    const change = value - intervention.baseline;

    if (change === 0) return;

    // Find impact on this outcome
    const impact = intervention.impacts.find(i => i.outcome === outcome);
    if (!impact) return;

    // Normalize change
    const normalizedChange = change / (intervention.max - intervention.min);

    // Apply base effect
    let effect = impact.baseEffect * normalizedChange;

    // Apply diminishing returns
    effect = applyDiminishingReturns(effect, value, impact.diminishingThreshold);

    // Apply adoption curve (time dynamics)
    const adoption = adoptionCurve(year, intervention.implementationDelay, intervention.rampUpPeriod);
    effect *= adoption;

    // Apply synergy multiplier
    const synergyMult = getSynergyMultiplier(intervention.id, activeSynergies);
    effect *= synergyMult;

    totalEffect += effect;
  });

  return totalEffect;
}

/**
 * Calculate provincial-specific effect
 */
export function calculateProvincialEffect(
  outcome: HealthOutcome,
  provinceId: string,
  values: Record<string, number>,
  provincialOverrides: Record<string, Record<string, number>>,
  activeSynergies: ActiveSynergy[],
  year: number
): number {
  // Get provincial multipliers
  const provMult = provincialMultipliers[provinceId] || { urban: 1, digital: 1, screening: 1 };

  // Use provincial overrides if available
  const effectiveValues = { ...values };
  if (provincialOverrides[provinceId]) {
    Object.assign(effectiveValues, provincialOverrides[provinceId]);
  }

  // Calculate base effect
  let effect = calculateOutcomeEffect(outcome, effectiveValues, activeSynergies, year);

  // Apply provincial multiplier based on intervention types
  // (simplified - could be more granular)
  const avgMultiplier = (provMult.urban + provMult.digital + provMult.screening) / 3;
  effect *= avgMultiplier;

  return effect;
}

// ========== TRAJECTORY GENERATION ==========

/**
 * Generate trajectory for a specific outcome over the time horizon
 */
export function generateTrajectory(
  outcome: HealthOutcome,
  values: Record<string, number>,
  activeSynergies: ActiveSynergy[],
  timeHorizon: number,
  baselineValue: number
): ProjectedOutcome[] {
  const trajectory: ProjectedOutcome[] = [];
  const currentYear = 2025;

  // Super-ager targets (optimal outcomes)
  const superAgerTargets: Record<HealthOutcome, number> = {
    diabetes: baselineValue * 0.4, // 60% reduction
    obesity: baselineValue * 0.45, // 55% reduction
    cvd: baselineValue * 0.5, // 50% reduction
    hypertension: baselineValue * 0.5,
    lifeExpectancy: baselineValue * 1.15, // 15% increase
    healthyLifeYears: baselineValue * 1.2, // 20% increase
    healthcareCosts: baselineValue * 0.7, // 30% reduction
    productivity: baselineValue * 1.3, // 30% increase
  };

  const superAgerTarget = superAgerTargets[outcome] ?? baselineValue;

  for (let year = 0; year <= timeHorizon; year++) {
    const t = year / timeHorizon;

    // Baseline trajectory: gradual worsening for disease prevalence, slight improvement for positive metrics
    const isPositiveMetric = ['lifeExpectancy', 'healthyLifeYears', 'productivity'].includes(outcome);

    // More realistic drift rates: ~5% worsening for NCDs over 15 years, ~1.5% improvement for life expectancy
    const baselineDrift = isPositiveMetric
      ? 1 + (t * 0.015) // Slight natural improvement (~1.5% over horizon)
      : 1 + (t * 0.05); // Natural worsening of disease prevalence (~5% over horizon)

    const baseline = baselineValue * baselineDrift;

    // Intervention trajectory: effect is applied to the baseline (potentially worsening) trajectory
    const effect = calculateOutcomeEffect(outcome, values, activeSynergies, year);

    // For disease metrics (negative effect = improvement): intervention reduces the baseline
    // For positive metrics: intervention improves above the already-improving baseline
    const intervention = baseline * (1 + effect);

    // Super-ager trajectory: smooth curve to optimal
    const superAger = baselineValue + (superAgerTarget - baselineValue) * Math.pow(t, 0.7);

    // Confidence bounds (uncertainty increases over time, but capped for credibility)
    const maxUncertainty = 0.12; // Cap at 12% uncertainty
    const uncertainty = Math.min(maxUncertainty, 0.08 * Math.sqrt(year + 1) / Math.sqrt(timeHorizon + 1));
    const lowerBound = intervention * (1 - uncertainty);
    const upperBound = intervention * (1 + uncertainty);

    trajectory.push({
      year: currentYear + year,
      baseline,
      intervention,
      superAger,
      lowerBound,
      upperBound,
    });
  }

  return trajectory;
}

// ========== ECONOMIC CALCULATIONS ==========

/**
 * Calculate economic impact of interventions
 */
export function calculateEconomicImpact(
  values: Record<string, number>,
  activeSynergies: ActiveSynergy[],
  timeHorizon: number
): EconomicImpact {
  // Calculate total cost of interventions
  let totalCost = 0;
  interventions.forEach(intervention => {
    const value = values[intervention.id] ?? intervention.baseline;
    const change = value - intervention.baseline;
    const normalizedChange = change / (intervention.max - intervention.min);
    totalCost += normalizedChange * intervention.costPerUnit * 10 * (timeHorizon / 15);
  });

  // Calculate outcome effects at end of horizon (effects are negative for disease reduction)
  const diabetesEffect = calculateOutcomeEffect('diabetes', values, activeSynergies, timeHorizon);
  const cvdEffect = calculateOutcomeEffect('cvd', values, activeSynergies, timeHorizon);
  const obesityEffect = calculateOutcomeEffect('obesity', values, activeSynergies, timeHorizon);
  const lifeYearsEffect = calculateOutcomeEffect('lifeExpectancy', values, activeSynergies, timeHorizon);
  const costEffect = calculateOutcomeEffect('healthcareCosts', values, activeSynergies, timeHorizon);

  // Healthcare savings from reduced disease burden
  // Annual disease costs in ZMW billions (Zambia estimates):
  // - Diabetes: ~0.8B ZMW/yr (direct medical costs)
  // - CVD: ~0.6B ZMW/yr
  // - Obesity-related: ~0.4B ZMW/yr
  // Effect is negative (e.g., -0.05 for 5% reduction), so we use Math.abs for savings
  const annualDiabetesSavings = Math.abs(diabetesEffect) * 0.8;
  const annualCvdSavings = Math.abs(cvdEffect) * 0.6;
  const annualObesitySavings = Math.abs(obesityEffect) * 0.4;
  const annualDirectSavings = Math.abs(costEffect) * baselineStats.healthcareCostsBn;

  // Cumulative savings over time horizon (with discounting - assume 3% discount rate, simplified)
  const discountFactor = 0.85; // Simplified NPV factor
  const healthcareSavings = (annualDiabetesSavings + annualCvdSavings + annualObesitySavings + annualDirectSavings)
    * timeHorizon * discountFactor;

  // Productivity gains from healthier population (more conservative)
  // Assume productivity loss is 1.5B ZMW/yr, and health improvements recover portion of this
  const productivityGains = Math.abs(lifeYearsEffect) * baselineStats.productivityLossBn * timeHorizon * 0.5 * discountFactor;

  // QALYs gained (Quality-Adjusted Life Years) - more realistic calculation
  // Life expectancy effect of 1% = 0.64 years gained per person reaching that age
  // Assume 30% of population benefits * 0.7 QALY quality weight
  const yearsGainedPerPerson = Math.abs(lifeYearsEffect) * baselineStats.lifeExpectancy;
  const affectedPopulationM = baselineStats.population * 0.3; // 30% of 19.6M
  const qalyGained = yearsGainedPerPerson * affectedPopulationM * 1000000 * 0.7;

  // ROI calculation
  const totalBenefit = healthcareSavings + productivityGains;
  const roi = totalCost > 0 ? ((totalBenefit - totalCost) / totalCost) * 100 : 0;
  const netBenefit = totalBenefit - totalCost;

  return {
    totalCost: Math.round(totalCost * 10) / 10,
    healthcareSavings: Math.round(healthcareSavings * 10) / 10,
    productivityGains: Math.round(productivityGains * 10) / 10,
    qalyGained: Math.round(qalyGained),
    roi: Math.round(roi),
    netBenefit: Math.round(netBenefit * 10) / 10,
  };
}

// ========== MAIN SIMULATION ==========

/**
 * Run full simulation and return all results
 */
export function runSimulation(state: SimulationState): SimulationResult {
  const { interventions: values, provincialOverrides, timeHorizon } = state;

  // Detect active synergies
  const activeSynergies = detectActiveSynergies(values);

  // Generate trajectories for each outcome
  const trajectories: Record<HealthOutcome, ProjectedOutcome[]> = {
    diabetes: generateTrajectory('diabetes', values, activeSynergies, timeHorizon, baselineStats.diabetesPrevalence),
    obesity: generateTrajectory('obesity', values, activeSynergies, timeHorizon, baselineStats.obesityRate),
    cvd: generateTrajectory('cvd', values, activeSynergies, timeHorizon, baselineStats.cvdPrevalence),
    hypertension: generateTrajectory('hypertension', values, activeSynergies, timeHorizon, baselineStats.hypertensionPrevalence),
    lifeExpectancy: generateTrajectory('lifeExpectancy', values, activeSynergies, timeHorizon, baselineStats.lifeExpectancy),
    healthyLifeYears: generateTrajectory('healthyLifeYears', values, activeSynergies, timeHorizon, baselineStats.healthyLifeExpectancy),
    healthcareCosts: generateTrajectory('healthcareCosts', values, activeSynergies, timeHorizon, baselineStats.healthcareCostsBn),
    productivity: generateTrajectory('productivity', values, activeSynergies, timeHorizon, baselineStats.productivityLossBn),
  };

  // Calculate economic impact
  const economicImpact = calculateEconomicImpact(values, activeSynergies, timeHorizon);

  // Calculate outcome deltas (change from baseline at end of horizon)
  const outcomeDeltas: Record<HealthOutcome, number> = {
    diabetes: calculateOutcomeEffect('diabetes', values, activeSynergies, timeHorizon) * 100,
    obesity: calculateOutcomeEffect('obesity', values, activeSynergies, timeHorizon) * 100,
    cvd: calculateOutcomeEffect('cvd', values, activeSynergies, timeHorizon) * 100,
    hypertension: calculateOutcomeEffect('hypertension', values, activeSynergies, timeHorizon) * 100,
    lifeExpectancy: calculateOutcomeEffect('lifeExpectancy', values, activeSynergies, timeHorizon) * 100,
    healthyLifeYears: calculateOutcomeEffect('healthyLifeYears', values, activeSynergies, timeHorizon) * 100,
    healthcareCosts: calculateOutcomeEffect('healthcareCosts', values, activeSynergies, timeHorizon) * 100,
    productivity: calculateOutcomeEffect('productivity', values, activeSynergies, timeHorizon) * 100,
  };

  // Calculate provincial impacts
  const provinces = Object.keys(provincialMultipliers);
  const provincialImpacts: Record<string, Record<HealthOutcome, number>> = {};

  provinces.forEach(province => {
    provincialImpacts[province] = {
      diabetes: calculateProvincialEffect('diabetes', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
      obesity: calculateProvincialEffect('obesity', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
      cvd: calculateProvincialEffect('cvd', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
      hypertension: calculateProvincialEffect('hypertension', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
      lifeExpectancy: calculateProvincialEffect('lifeExpectancy', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
      healthyLifeYears: calculateProvincialEffect('healthyLifeYears', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
      healthcareCosts: calculateProvincialEffect('healthcareCosts', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
      productivity: calculateProvincialEffect('productivity', province, values, provincialOverrides, activeSynergies, timeHorizon) * 100,
    };
  });

  return {
    trajectories,
    economicImpact,
    activeSynergies,
    outcomeDeltas,
    provincialImpacts,
  };
}

// ========== SENSITIVITY ANALYSIS ==========

/**
 * Run sensitivity analysis - vary one intervention and measure impact
 */
export function runSensitivityAnalysis(
  baseValues: Record<string, number>,
  outcome: HealthOutcome,
  timeHorizon: number
): Record<string, { min: number; max: number; range: number }> {
  const results: Record<string, { min: number; max: number; range: number }> = {};
  const activeSynergies = detectActiveSynergies(baseValues);

  interventions.forEach(intervention => {
    // Test at minimum
    const minValues = { ...baseValues, [intervention.id]: intervention.min };
    const minEffect = calculateOutcomeEffect(outcome, minValues, activeSynergies, timeHorizon);

    // Test at maximum
    const maxValues = { ...baseValues, [intervention.id]: intervention.max };
    const maxEffect = calculateOutcomeEffect(outcome, maxValues, activeSynergies, timeHorizon);

    results[intervention.id] = {
      min: minEffect * 100,
      max: maxEffect * 100,
      range: Math.abs(maxEffect - minEffect) * 100,
    };
  });

  return results;
}

/**
 * Calculate cost-effectiveness for each intervention
 */
export function calculateCostEffectiveness(
  timeHorizon: number
): Record<string, { costPerQaly: number; rank: number }> {
  const results: Record<string, { costPerQaly: number; rank: number }> = {};
  const baseValues: Record<string, number> = {};

  // Set all to baseline
  interventions.forEach(i => {
    baseValues[i.id] = i.baseline;
  });

  interventions.forEach(intervention => {
    // Calculate effect of maxing out this single intervention
    const testValues = { ...baseValues, [intervention.id]: intervention.max };
    const activeSynergies = detectActiveSynergies(testValues);
    const economicImpact = calculateEconomicImpact(testValues, activeSynergies, timeHorizon);

    // Cost per QALY
    const costPerQaly = economicImpact.qalyGained > 0
      ? (economicImpact.totalCost * 1000000000) / economicImpact.qalyGained
      : Infinity;

    results[intervention.id] = {
      costPerQaly: Math.round(costPerQaly),
      rank: 0, // Will be set after sorting
    };
  });

  // Assign ranks
  const sorted = Object.entries(results)
    .sort((a, b) => a[1].costPerQaly - b[1].costPerQaly);

  sorted.forEach(([id], index) => {
    results[id].rank = index + 1;
  });

  return results;
}
