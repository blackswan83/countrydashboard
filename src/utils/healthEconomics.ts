/**
 * Health Economics Module for Agentic Health Twin
 *
 * Based on science-grounded algorithms from:
 * - hesim (R package for health economic simulation)
 * - QALY (R package for quality-adjusted life year calculations)
 * - WHO-CHOICE methodology
 *
 * Implements:
 * - QALY calculations with proper discounting
 * - Cost-effectiveness analysis (CEA)
 * - Incremental cost-effectiveness ratios (ICER)
 * - Disability-Adjusted Life Years (DALY)
 * - Probabilistic sensitivity analysis (PSA)
 */

// ============ TYPE DEFINITIONS ============

export interface HealthState {
  name: string;
  utility: number;        // 0-1 scale (1 = perfect health)
  duration: number;       // years in this state
  annualCost: number;     // USD
  transitionProb: number; // probability of transitioning to worse state
}

export interface QALYResult {
  undiscounted: number;
  discounted: number;
  lifeYears: number;
  qualityAdjustment: number;
}

export interface CostResult {
  undiscounted: number;
  discounted: number;
  direct: number;       // Medical costs
  indirect: number;     // Productivity losses
  intangible: number;   // Quality of life
}

export interface CEAResult {
  intervention: string;
  totalCost: number;
  totalQALY: number;
  icer: number;            // Incremental cost per QALY
  netMonetaryBenefit: number;
  dominated: boolean;
  extendedDominated: boolean;
}

export interface PSAResult {
  mean: CEAResult;
  ci95Lower: CEAResult;
  ci95Upper: CEAResult;
  iterations: number;
  acceptabilityCurve: { wtp: number; probability: number }[];
}

// ============ DISCOUNT FUNCTIONS ============

/**
 * Calculate discount factor for a given year
 * Standard 3% discount rate recommended by WHO-CHOICE
 */
export function discountFactor(year: number, rate: number = 0.03): number {
  return Math.pow(1 + rate, -year);
}

/**
 * Calculate present value of future costs/QALYs
 */
export function presentValue(
  values: number[],
  discountRate: number = 0.03
): number {
  return values.reduce((sum, value, year) => {
    return sum + value * discountFactor(year, discountRate);
  }, 0);
}

// ============ QALY CALCULATIONS ============
// Based on QALY R package methodology

/**
 * Disease-specific utility weights
 * Based on EQ-5D and other validated instruments
 * Source: Global Burden of Disease disability weights
 */
export const utilityWeights: Record<string, number> = {
  // Perfect health
  healthy: 1.0,

  // HIV/AIDS states
  hiv_on_art: 0.947,
  hiv_symptomatic: 0.582,
  aids_without_art: 0.453,

  // Malaria states
  malaria_uncomplicated: 0.949,
  malaria_severe: 0.633,

  // Diabetes states
  diabetes_controlled: 0.985,
  diabetes_uncontrolled: 0.951,
  diabetes_complications: 0.7,
  diabetic_neuropathy: 0.624,
  diabetic_foot: 0.149,

  // CVD states
  angina_stable: 0.906,
  heart_failure_mild: 0.842,
  heart_failure_severe: 0.532,
  post_stroke: 0.677,

  // Hypertension
  hypertension_controlled: 0.99,
  hypertension_uncontrolled: 0.95,
};

/**
 * Calculate QALYs for a patient trajectory
 * Implements proper half-cycle correction
 */
export function calculateQALY(
  states: HealthState[],
  discountRate: number = 0.03,
  halfCycleCorrection: boolean = true
): QALYResult {
  let undiscounted = 0;
  let discounted = 0;
  let totalYears = 0;
  let currentYear = 0;

  for (const state of states) {
    const years = state.duration;
    totalYears += years;

    for (let y = 0; y < years; y++) {
      const yearQALY = state.utility;

      // Half-cycle correction for first and last period
      let adjustedQALY = yearQALY;
      if (halfCycleCorrection) {
        if (y === 0 || y === years - 1) {
          adjustedQALY *= 0.5;
        }
      }

      undiscounted += adjustedQALY;
      discounted += adjustedQALY * discountFactor(currentYear + y, discountRate);
    }

    currentYear += years;
  }

  return {
    undiscounted,
    discounted,
    lifeYears: totalYears,
    qualityAdjustment: undiscounted / Math.max(1, totalYears),
  };
}

/**
 * Calculate QALYs gained from intervention
 */
export function calculateQALYGained(
  baselineStates: HealthState[],
  interventionStates: HealthState[],
  discountRate: number = 0.03
): number {
  const baselineQALY = calculateQALY(baselineStates, discountRate);
  const interventionQALY = calculateQALY(interventionStates, discountRate);

  return interventionQALY.discounted - baselineQALY.discounted;
}

// ============ DALY CALCULATIONS ============

export interface DALYComponents {
  yll: number;  // Years of Life Lost
  yld: number;  // Years Lived with Disability
  total: number;
}

/**
 * Calculate DALYs for a disease state
 * DALY = YLL + YLD
 */
export function calculateDALY(
  deaths: number,
  avgAgeAtDeath: number,
  _lifeExpectancy: number,
  prevalence: number,
  population: number,
  disabilityWeight: number,
  avgDuration: number,
  discountRate: number = 0.03
): DALYComponents {
  // Years of Life Lost (YLL)
  // Standard life expectancy from GBD reference
  const standardLE = 86.6; // GBD 2019 reference
  const yearsLost = Math.max(0, standardLE - avgAgeAtDeath);

  // Discounted YLL
  let yll = 0;
  for (let y = 0; y < yearsLost; y++) {
    yll += discountFactor(y, discountRate);
  }
  yll *= deaths;

  // Years Lived with Disability (YLD)
  const casesWithDisability = prevalence * population;
  let yld = 0;
  for (let y = 0; y < avgDuration; y++) {
    yld += disabilityWeight * discountFactor(y, discountRate);
  }
  yld *= casesWithDisability;

  return {
    yll,
    yld,
    total: yll + yld,
  };
}

// ============ COST CALCULATIONS ============

/**
 * Country-specific healthcare costs (USD)
 * Based on WHO-CHOICE unit costs for Sub-Saharan Africa
 */
export const zambiaUnitCosts = {
  // Outpatient visits
  phc_visit: 8,
  specialist_visit: 25,
  emergency_visit: 45,

  // Inpatient
  hospital_day: 35,
  icu_day: 150,

  // Diagnostics
  hiv_test: 5,
  malaria_rdt: 1.5,
  blood_glucose: 2,
  hba1c: 15,
  ecg: 10,

  // Medications (annual)
  art_annual: 180,           // First-line ART
  act_treatment: 3,          // Artemisinin combination therapy
  metformin_annual: 25,
  insulin_annual: 200,
  antihypertensive_annual: 40,
  statin_annual: 30,

  // Interventions
  itn_bednet: 2,
  irs_household: 5,
  community_health_worker_visit: 3,
};

/**
 * Calculate total cost of disease management
 */
export function calculateDiseaseCost(
  disease: 'hiv' | 'malaria' | 'diabetes' | 'cvd',
  state: string,
  years: number,
  discountRate: number = 0.03
): CostResult {
  const costs = zambiaUnitCosts;
  let annualDirect = 0;
  let annualIndirect = 0;

  switch (disease) {
    case 'hiv':
      if (state === 'on_treatment') {
        annualDirect = costs.art_annual + costs.phc_visit * 4 + costs.specialist_visit * 2;
        annualIndirect = 200; // Reduced productivity loss
      } else {
        annualDirect = costs.specialist_visit * 4 + costs.hospital_day * 10;
        annualIndirect = 800; // High productivity loss
      }
      break;

    case 'malaria':
      if (state === 'uncomplicated') {
        annualDirect = costs.malaria_rdt + costs.act_treatment + costs.phc_visit;
        annualIndirect = 50;
      } else {
        annualDirect = costs.hospital_day * 5 + costs.emergency_visit;
        annualIndirect = 200;
      }
      break;

    case 'diabetes':
      if (state === 'controlled') {
        annualDirect = costs.metformin_annual + costs.phc_visit * 4 + costs.hba1c * 2;
        annualIndirect = 100;
      } else if (state === 'uncontrolled') {
        annualDirect = costs.insulin_annual + costs.specialist_visit * 4 + costs.hba1c * 4;
        annualIndirect = 300;
      } else { // complications
        annualDirect = costs.insulin_annual + costs.specialist_visit * 12 +
                       costs.hospital_day * 10 + costs.hba1c * 4;
        annualIndirect = 1000;
      }
      break;

    case 'cvd':
      if (state === 'stable') {
        annualDirect = costs.antihypertensive_annual + costs.statin_annual +
                       costs.phc_visit * 4 + costs.ecg * 2;
        annualIndirect = 150;
      } else {
        annualDirect = costs.hospital_day * 14 + costs.icu_day * 3 +
                       costs.specialist_visit * 6;
        annualIndirect = 2000;
      }
      break;
  }

  const yearlyDirect: number[] = Array(years).fill(annualDirect);
  const yearlyIndirect: number[] = Array(years).fill(annualIndirect);

  return {
    undiscounted: (annualDirect + annualIndirect) * years,
    discounted: presentValue(yearlyDirect, discountRate) +
                presentValue(yearlyIndirect, discountRate),
    direct: presentValue(yearlyDirect, discountRate),
    indirect: presentValue(yearlyIndirect, discountRate),
    intangible: 0, // Could add if WTP data available
  };
}

// ============ COST-EFFECTIVENESS ANALYSIS ============

/**
 * WHO-CHOICE cost-effectiveness thresholds
 * Based on GDP per capita
 */
export function getCEThreshold(gdpPerCapita: number): {
  highlyEffective: number;
  costEffective: number;
  notCostEffective: number;
} {
  return {
    highlyEffective: gdpPerCapita,        // < 1x GDP per capita
    costEffective: gdpPerCapita * 3,      // 1-3x GDP per capita
    notCostEffective: gdpPerCapita * 3,   // > 3x GDP per capita
  };
}

// Zambia GDP per capita ~$1,500 USD (2023)
export const ZAMBIA_CE_THRESHOLD = getCEThreshold(1500);

/**
 * Calculate incremental cost-effectiveness ratio (ICER)
 */
export function calculateICER(
  interventionCost: number,
  comparatorCost: number,
  interventionQALY: number,
  comparatorQALY: number
): number {
  const incrementalCost = interventionCost - comparatorCost;
  const incrementalQALY = interventionQALY - comparatorQALY;

  if (incrementalQALY === 0) {
    return incrementalCost > 0 ? Infinity : -Infinity;
  }

  return incrementalCost / incrementalQALY;
}

/**
 * Calculate Net Monetary Benefit
 * NMB = (QALY gained × WTP) - Cost
 */
export function calculateNMB(
  qalyGained: number,
  cost: number,
  wtp: number = ZAMBIA_CE_THRESHOLD.costEffective
): number {
  return (qalyGained * wtp) - cost;
}

/**
 * Run cost-effectiveness analysis for multiple interventions
 * Implements dominance checking and efficiency frontier
 */
export function runCEA(
  interventions: Array<{
    name: string;
    cost: number;
    qaly: number;
  }>,
  wtp: number = ZAMBIA_CE_THRESHOLD.costEffective
): CEAResult[] {
  // Sort by cost
  const sorted = [...interventions].sort((a, b) => a.cost - b.cost);

  const results: CEAResult[] = [];
  let previousCost = 0;
  let previousQALY = 0;

  for (let i = 0; i < sorted.length; i++) {
    const intervention = sorted[i];
    const icer = i === 0
      ? intervention.cost / intervention.qaly
      : calculateICER(
          intervention.cost,
          previousCost,
          intervention.qaly,
          previousQALY
        );

    const nmb = calculateNMB(intervention.qaly, intervention.cost, wtp);

    // Check dominance
    let dominated = false;
    let extendedDominated = false;

    // Strong dominance: higher cost AND lower QALY
    for (let j = 0; j < i; j++) {
      if (sorted[j].cost <= intervention.cost &&
          sorted[j].qaly >= intervention.qaly) {
        dominated = true;
        break;
      }
    }

    // Extended dominance: check if ICER is worse than interpolated alternatives
    if (!dominated && i > 0 && i < sorted.length - 1) {
      const prevResult = results[i - 1];
      if (prevResult && !prevResult.dominated) {
        const nextQALY = sorted[i + 1]?.qaly || intervention.qaly;
        const nextCost = sorted[i + 1]?.cost || intervention.cost;
        const interpolatedICER = (nextCost - prevResult.totalCost) /
                                 (nextQALY - prevResult.totalQALY);
        if (icer > interpolatedICER) {
          extendedDominated = true;
        }
      }
    }

    results.push({
      intervention: intervention.name,
      totalCost: intervention.cost,
      totalQALY: intervention.qaly,
      icer: isFinite(icer) ? Math.round(icer) : icer,
      netMonetaryBenefit: Math.round(nmb),
      dominated,
      extendedDominated,
    });

    if (!dominated) {
      previousCost = intervention.cost;
      previousQALY = intervention.qaly;
    }
  }

  return results;
}

// ============ PROBABILISTIC SENSITIVITY ANALYSIS ============

/**
 * Generate random sample from beta distribution
 * Used for utility weights and probabilities
 */
function betaSample(mean: number, sd: number): number {
  // Simple approximation using normal and constraining to [0,1]
  // Note: For proper beta distribution, could use alpha/beta params derived from mean/variance
  const sample = mean + sd * (Math.random() + Math.random() + Math.random() - 1.5);
  return Math.max(0.01, Math.min(0.99, sample));
}

/**
 * Generate random sample from gamma distribution
 * Used for costs
 */
function gammaSample(mean: number, sd: number): number {
  // Simple approximation for gamma-like distribution
  // Note: For proper gamma, shape = mean^2/var, scale = var/mean
  const sample = mean + sd * (Math.random() + Math.random() - 1);
  return Math.max(0, sample);
}

/**
 * Run probabilistic sensitivity analysis
 */
export function runPSA(
  baseCase: { cost: number; qaly: number },
  uncertainty: { costSD: number; qalySD: number },
  comparator: { cost: number; qaly: number },
  iterations: number = 1000,
  wtpRange: number[] = [0, 1500, 3000, 4500, 6000, 7500, 9000]
): PSAResult {
  const results: CEAResult[] = [];

  for (let i = 0; i < iterations; i++) {
    const sampledCost = gammaSample(baseCase.cost, uncertainty.costSD);
    const sampledQALY = betaSample(
      baseCase.qaly / 20, // Normalize to 0-1 range
      uncertainty.qalySD / 20
    ) * 20;

    const icer = calculateICER(sampledCost, comparator.cost, sampledQALY, comparator.qaly);
    const nmb = calculateNMB(sampledQALY - comparator.qaly, sampledCost - comparator.cost);

    results.push({
      intervention: 'intervention',
      totalCost: sampledCost,
      totalQALY: sampledQALY,
      icer,
      netMonetaryBenefit: nmb,
      dominated: false,
      extendedDominated: false,
    });
  }

  // Calculate statistics
  const sortedByCost = [...results].sort((a, b) => a.totalCost - b.totalCost);
  const sortedByQALY = [...results].sort((a, b) => a.totalQALY - b.totalQALY);
  const sortedByICER = [...results].sort((a, b) => a.icer - b.icer);

  const mean: CEAResult = {
    intervention: 'mean',
    totalCost: results.reduce((s, r) => s + r.totalCost, 0) / iterations,
    totalQALY: results.reduce((s, r) => s + r.totalQALY, 0) / iterations,
    icer: sortedByICER[Math.floor(iterations / 2)].icer,
    netMonetaryBenefit: results.reduce((s, r) => s + r.netMonetaryBenefit, 0) / iterations,
    dominated: false,
    extendedDominated: false,
  };

  // 95% confidence intervals
  const ci95Lower: CEAResult = {
    intervention: 'ci95_lower',
    totalCost: sortedByCost[Math.floor(iterations * 0.025)].totalCost,
    totalQALY: sortedByQALY[Math.floor(iterations * 0.025)].totalQALY,
    icer: sortedByICER[Math.floor(iterations * 0.025)].icer,
    netMonetaryBenefit: 0,
    dominated: false,
    extendedDominated: false,
  };

  const ci95Upper: CEAResult = {
    intervention: 'ci95_upper',
    totalCost: sortedByCost[Math.floor(iterations * 0.975)].totalCost,
    totalQALY: sortedByQALY[Math.floor(iterations * 0.975)].totalQALY,
    icer: sortedByICER[Math.floor(iterations * 0.975)].icer,
    netMonetaryBenefit: 0,
    dominated: false,
    extendedDominated: false,
  };

  // Cost-effectiveness acceptability curve
  const acceptabilityCurve = wtpRange.map(wtp => {
    const costEffective = results.filter(r =>
      calculateNMB(r.totalQALY - comparator.qaly, r.totalCost - comparator.cost, wtp) > 0
    ).length;
    return {
      wtp,
      probability: costEffective / iterations,
    };
  });

  return {
    mean,
    ci95Lower,
    ci95Upper,
    iterations,
    acceptabilityCurve,
  };
}

// ============ INTERVENTION RANKING ============

export interface InterventionRanking {
  id: string;
  name: string;
  costPerDALYAverted: number;
  costPerQALYGained: number;
  rank: number;
  ceCategory: 'highly_cost_effective' | 'cost_effective' | 'not_cost_effective';
}

/**
 * Rank interventions by cost-effectiveness
 * Following WHO-CHOICE methodology
 */
export function rankInterventions(
  interventions: Array<{
    id: string;
    name: string;
    annualCost: number;
    dalyAverted: number;
    qalyGained: number;
  }>,
  gdpPerCapita: number = 1500
): InterventionRanking[] {
  const thresholds = getCEThreshold(gdpPerCapita);

  const ranked = interventions
    .map(i => {
      const costPerDALY = i.dalyAverted > 0 ? i.annualCost / i.dalyAverted : Infinity;
      const costPerQALY = i.qalyGained > 0 ? i.annualCost / i.qalyGained : Infinity;

      let ceCategory: InterventionRanking['ceCategory'];
      if (costPerDALY < thresholds.highlyEffective) {
        ceCategory = 'highly_cost_effective';
      } else if (costPerDALY < thresholds.costEffective) {
        ceCategory = 'cost_effective';
      } else {
        ceCategory = 'not_cost_effective';
      }

      return {
        id: i.id,
        name: i.name,
        costPerDALYAverted: Math.round(costPerDALY),
        costPerQALYGained: Math.round(costPerQALY),
        rank: 0,
        ceCategory,
      };
    })
    .sort((a, b) => a.costPerDALYAverted - b.costPerDALYAverted);

  // Assign ranks
  ranked.forEach((r, i) => {
    r.rank = i + 1;
  });

  return ranked;
}
