/**
 * Causal Inference Module for Agentic Health Twin
 *
 * Based on science-grounded algorithms from:
 * - DoWhy (py-why) - Causal inference framework
 * - CausalImpact - Bayesian structural time-series
 * - econml - Heterogeneous treatment effects
 *
 * Implements:
 * - Average Treatment Effect (ATE) estimation
 * - Conditional Average Treatment Effect (CATE)
 * - Instrumental variable estimation
 * - Difference-in-differences
 * - Synthetic control method
 */

// ============ TYPE DEFINITIONS ============

export interface CausalGraph {
  treatment: string;
  outcome: string;
  confounders: string[];
  instruments: string[];
  mediators: string[];
}

export interface TreatmentEffect {
  ate: number;           // Average Treatment Effect
  ateStdError: number;
  ci95: [number, number];
  pValue: number;
  sampleSize: number;
}

export interface HeterogeneousTreatmentEffect {
  subgroup: string;
  cate: number;          // Conditional ATE
  cateStdError: number;
  ci95: [number, number];
  sampleSize: number;
}

export interface CausalEstimate {
  method: string;
  effect: TreatmentEffect;
  refutationTests: RefutationResult[];
  robustnessScore: number;
}

export interface RefutationResult {
  test: string;
  passed: boolean;
  newEffect?: number;
  pValue?: number;
}

// ============ CAUSAL GRAPH SPECIFICATION ============

/**
 * Define causal graph for health interventions in Zambia
 * Following DoWhy's causal model specification
 */
export const zambiaHealthCausalGraph: Record<string, CausalGraph> = {
  // HIV interventions
  artCoverage: {
    treatment: 'art_coverage',
    outcome: 'hiv_mortality',
    confounders: ['age', 'gender', 'province', 'urbanRural', 'socioeconomicStatus'],
    instruments: ['distance_to_clinic', 'policy_year'],
    mediators: ['viral_suppression', 'cd4_count'],
  },

  // Malaria interventions
  itnDistribution: {
    treatment: 'itn_coverage',
    outcome: 'malaria_incidence',
    confounders: ['province', 'rainfall', 'housing_quality', 'education'],
    instruments: ['campaign_timing', 'ngo_presence'],
    mediators: ['mosquito_exposure', 'bite_prevention'],
  },

  // NCD interventions
  ncdScreening: {
    treatment: 'screening_coverage',
    outcome: 'diabetes_complications',
    confounders: ['age', 'bmi', 'family_history', 'socioeconomicStatus'],
    instruments: ['clinic_density', 'health_worker_ratio'],
    mediators: ['early_detection', 'treatment_initiation'],
  },

  // Infrastructure interventions
  primaryCareExpansion: {
    treatment: 'phc_density',
    outcome: 'life_expectancy',
    confounders: ['urbanRural', 'province', 'baseline_mortality'],
    instruments: ['government_health_budget', 'election_year'],
    mediators: ['healthcare_access', 'referral_rate'],
  },
};

// ============ TREATMENT EFFECT ESTIMATION ============

/**
 * Estimate Average Treatment Effect using inverse probability weighting
 * Implements propensity score methodology from DoWhy
 */
export function estimateATE(
  treatmentGroup: number[],    // Outcomes for treated
  controlGroup: number[],       // Outcomes for control
  treatmentPropensity?: number[] // Propensity scores (optional)
): TreatmentEffect {
  const n1 = treatmentGroup.length;
  const n0 = controlGroup.length;
  const n = n1 + n0;

  // Calculate means
  const mean1 = treatmentGroup.reduce((s, v) => s + v, 0) / n1;
  const mean0 = controlGroup.reduce((s, v) => s + v, 0) / n0;

  // Naive ATE
  let ate = mean1 - mean0;

  // If propensity scores provided, use IPW
  if (treatmentPropensity && treatmentPropensity.length === n1) {
    // Inverse probability weighted estimator
    let ipwNumerator = 0;
    let ipwDenominator = 0;

    treatmentGroup.forEach((y, i) => {
      const p = treatmentPropensity[i];
      ipwNumerator += y / p;
      ipwDenominator += 1 / p;
    });

    const ipwMean1 = ipwNumerator / ipwDenominator;

    // Adjust ATE
    ate = ipwMean1 - mean0;
  }

  // Calculate variance (pooled)
  const var1 = treatmentGroup.reduce((s, v) => s + Math.pow(v - mean1, 2), 0) / (n1 - 1);
  const var0 = controlGroup.reduce((s, v) => s + Math.pow(v - mean0, 2), 0) / (n0 - 1);

  const pooledSE = Math.sqrt(var1 / n1 + var0 / n0);

  // 95% CI
  const ci95: [number, number] = [
    ate - 1.96 * pooledSE,
    ate + 1.96 * pooledSE,
  ];

  // P-value (two-tailed t-test approximation)
  const tStat = ate / pooledSE;
  const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));

  return {
    ate,
    ateStdError: pooledSE,
    ci95,
    pValue,
    sampleSize: n,
  };
}

/**
 * Estimate Conditional Average Treatment Effect for subgroups
 * Implements heterogeneous treatment effect methodology
 */
export function estimateCATE(
  data: Array<{
    outcome: number;
    treatment: boolean;
    subgroup: string;
    covariates: Record<string, number>;
  }>
): HeterogeneousTreatmentEffect[] {
  // Group by subgroup
  const subgroups = new Map<string, typeof data>();

  data.forEach(d => {
    const group = subgroups.get(d.subgroup) || [];
    group.push(d);
    subgroups.set(d.subgroup, group);
  });

  const results: HeterogeneousTreatmentEffect[] = [];

  subgroups.forEach((groupData, subgroup) => {
    const treated = groupData.filter(d => d.treatment).map(d => d.outcome);
    const control = groupData.filter(d => !d.treatment).map(d => d.outcome);

    if (treated.length < 2 || control.length < 2) {
      return; // Skip small subgroups
    }

    const effect = estimateATE(treated, control);

    results.push({
      subgroup,
      cate: effect.ate,
      cateStdError: effect.ateStdError,
      ci95: effect.ci95,
      sampleSize: effect.sampleSize,
    });
  });

  return results;
}

// ============ INSTRUMENTAL VARIABLE ESTIMATION ============

/**
 * Two-Stage Least Squares (2SLS) IV estimation
 * Used when treatment is endogenous
 */
export function estimateIV(
  outcome: number[],
  treatment: number[],
  instrument: number[]
): TreatmentEffect {
  const n = outcome.length;

  // First stage: regress treatment on instrument
  const { beta: gamma, residuals: _v } = simpleRegression(treatment, instrument);

  // Predicted treatment
  const treatmentPred = instrument.map(z => gamma * z + mean(treatment) - gamma * mean(instrument));

  // Second stage: regress outcome on predicted treatment
  const { beta, stdError } = simpleRegression(outcome, treatmentPred);

  // Standard errors need adjustment for 2SLS
  const adjustedSE = stdError * Math.sqrt(variance(treatment) / variance(treatmentPred));

  const ci95: [number, number] = [
    beta - 1.96 * adjustedSE,
    beta + 1.96 * adjustedSE,
  ];

  const tStat = beta / adjustedSE;
  const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));

  return {
    ate: beta,
    ateStdError: adjustedSE,
    ci95,
    pValue,
    sampleSize: n,
  };
}

// ============ DIFFERENCE-IN-DIFFERENCES ============

export interface DiDData {
  outcome: number;
  treated: boolean;
  post: boolean;
  time: number;
}

/**
 * Difference-in-Differences estimator
 * For panel data with pre/post intervention periods
 */
export function estimateDiD(data: DiDData[]): TreatmentEffect {
  // Calculate group means
  const treatedPre = data.filter(d => d.treated && !d.post).map(d => d.outcome);
  const treatedPost = data.filter(d => d.treated && d.post).map(d => d.outcome);
  const controlPre = data.filter(d => !d.treated && !d.post).map(d => d.outcome);
  const controlPost = data.filter(d => !d.treated && d.post).map(d => d.outcome);

  const meanTreatedPre = mean(treatedPre);
  const meanTreatedPost = mean(treatedPost);
  const meanControlPre = mean(controlPre);
  const meanControlPost = mean(controlPost);

  // DiD estimator
  const ate = (meanTreatedPost - meanTreatedPre) - (meanControlPost - meanControlPre);

  // Clustered standard error (simplified)
  const varTreated = variance([...treatedPre, ...treatedPost]);
  const varControl = variance([...controlPre, ...controlPost]);
  const nTreated = treatedPre.length + treatedPost.length;
  const nControl = controlPre.length + controlPost.length;

  const se = Math.sqrt(varTreated / nTreated + varControl / nControl);

  const ci95: [number, number] = [ate - 1.96 * se, ate + 1.96 * se];
  const pValue = 2 * (1 - normalCDF(Math.abs(ate / se)));

  return {
    ate,
    ateStdError: se,
    ci95,
    pValue,
    sampleSize: data.length,
  };
}

// ============ SYNTHETIC CONTROL ============

/**
 * Synthetic Control Method
 * Creates weighted combination of control units to match treated unit
 */
export function syntheticControl(
  treatedOutcomes: number[],      // Pre/post outcomes for treated unit
  controlOutcomes: number[][],    // Pre/post outcomes for each control unit
  preperiods: number              // Number of pre-intervention periods
): {
  weights: number[];
  syntheticOutcome: number[];
  treatmentEffect: number[];
  ate: number;
} {
  const nControls = controlOutcomes.length;
  const nPeriods = treatedOutcomes.length;

  // Optimize weights to minimize pre-treatment MSE
  // Simplified: use inverse MSE weighting
  const weights: number[] = [];
  let totalWeight = 0;

  for (let j = 0; j < nControls; j++) {
    let mse = 0;
    for (let t = 0; t < preperiods; t++) {
      mse += Math.pow(treatedOutcomes[t] - controlOutcomes[j][t], 2);
    }
    const weight = 1 / (mse + 0.001); // Add small constant to avoid division by zero
    weights.push(weight);
    totalWeight += weight;
  }

  // Normalize weights
  weights.forEach((w, i) => weights[i] = w / totalWeight);

  // Create synthetic control
  const syntheticOutcome: number[] = [];
  for (let t = 0; t < nPeriods; t++) {
    let synth = 0;
    for (let j = 0; j < nControls; j++) {
      synth += weights[j] * controlOutcomes[j][t];
    }
    syntheticOutcome.push(synth);
  }

  // Calculate treatment effect (post-intervention gap)
  const treatmentEffect = treatedOutcomes.map((y, t) => y - syntheticOutcome[t]);

  // Average treatment effect (post-intervention only)
  const postEffects = treatmentEffect.slice(preperiods);
  const ate = mean(postEffects);

  return {
    weights,
    syntheticOutcome,
    treatmentEffect,
    ate,
  };
}

// ============ REFUTATION TESTS ============
// Following DoWhy's refutation methodology

/**
 * Run refutation tests to validate causal estimates
 */
export function runRefutationTests(
  estimate: TreatmentEffect,
  treatmentGroup: number[],
  controlGroup: number[],
  nSimulations: number = 100
): RefutationResult[] {
  const results: RefutationResult[] = [];

  // 1. Placebo Treatment Test
  // Randomly shuffle treatment assignment
  const allOutcomes = [...treatmentGroup, ...controlGroup];
  let placeboEffects: number[] = [];

  for (let i = 0; i < nSimulations; i++) {
    const shuffled = shuffle([...allOutcomes]);
    const placeboTreated = shuffled.slice(0, treatmentGroup.length);
    const placeboControl = shuffled.slice(treatmentGroup.length);
    const placeboATE = mean(placeboTreated) - mean(placeboControl);
    placeboEffects.push(placeboATE);
  }

  // Effect should be significantly different from placebo
  const placeboMean = mean(placeboEffects);
  const placeboSD = Math.sqrt(variance(placeboEffects));
  const zScore = (estimate.ate - placeboMean) / placeboSD;
  const placeboP = 2 * (1 - normalCDF(Math.abs(zScore)));

  results.push({
    test: 'Placebo Treatment',
    passed: placeboP < 0.05,
    newEffect: placeboMean,
    pValue: placeboP,
  });

  // 2. Random Common Cause Test
  // Add random confounder and check if estimate changes
  let randomConfoundEffects: number[] = [];

  for (let i = 0; i < nSimulations; i++) {
    // Add random noise (simulating unobserved confounder)
    const noise = Array(allOutcomes.length).fill(0).map(() => normalRandom() * placeboSD);
    const adjustedTreated = treatmentGroup.map((y, j) => y + noise[j]);
    const adjustedControl = controlGroup.map((y, j) => y + noise[treatmentGroup.length + j]);
    const adjustedATE = mean(adjustedTreated) - mean(adjustedControl);
    randomConfoundEffects.push(adjustedATE);
  }

  const robustMean = mean(randomConfoundEffects);
  const changePercent = Math.abs(robustMean - estimate.ate) / Math.abs(estimate.ate);

  results.push({
    test: 'Random Common Cause',
    passed: changePercent < 0.15, // Effect should not change by more than 15%
    newEffect: robustMean,
  });

  // 3. Subset Data Test
  // Use only half the data and check consistency
  const halfTreated = treatmentGroup.slice(0, Math.floor(treatmentGroup.length / 2));
  const halfControl = controlGroup.slice(0, Math.floor(controlGroup.length / 2));
  const subsetEffect = estimateATE(halfTreated, halfControl);

  const withinCI = subsetEffect.ate >= estimate.ci95[0] && subsetEffect.ate <= estimate.ci95[1];

  results.push({
    test: 'Subset Data',
    passed: withinCI,
    newEffect: subsetEffect.ate,
  });

  return results;
}

/**
 * Calculate robustness score from refutation tests
 */
export function calculateRobustnessScore(refutations: RefutationResult[]): number {
  const passed = refutations.filter(r => r.passed).length;
  return passed / refutations.length;
}

// ============ HELPER FUNCTIONS ============

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function variance(arr: number[]): number {
  const m = mean(arr);
  return arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (arr.length - 1);
}

function simpleRegression(y: number[], x: number[]): { beta: number; stdError: number; residuals: number[] } {
  const n = y.length;
  const xMean = mean(x);
  const yMean = mean(y);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }

  const beta = numerator / denominator;
  const intercept = yMean - beta * xMean;

  const residuals = y.map((yi, i) => yi - (beta * x[i] + intercept));
  const mse = residuals.reduce((s, r) => s + r * r, 0) / (n - 2);
  const stdError = Math.sqrt(mse / denominator);

  return { beta, stdError, residuals };
}

function normalCDF(x: number): number {
  // Approximation of standard normal CDF
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

function normalRandom(): number {
  // Box-Muller transform
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ============ INTERVENTION EFFECT MAPPING ============

/**
 * Map slider interventions to causal effect estimates
 * Based on literature review and meta-analyses
 */
export const interventionEffectEstimates: Record<string, {
  baseEffect: number;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  doseResponse: 'linear' | 'logarithmic' | 'threshold';
}> = {
  // HIV interventions
  artCoverage: {
    baseEffect: -0.9,  // 90% reduction in mortality with full coverage
    confidence: 'high',
    source: 'UNAIDS 90-90-90 evidence',
    doseResponse: 'logarithmic',
  },

  // Malaria interventions
  itnCoverage: {
    baseEffect: -0.55, // 55% reduction in malaria incidence
    confidence: 'high',
    source: 'Cochrane Review 2018',
    doseResponse: 'logarithmic',
  },
  irsCoverage: {
    baseEffect: -0.4,  // 40% reduction
    confidence: 'medium',
    source: 'WHO malaria report',
    doseResponse: 'linear',
  },

  // NCD interventions
  ncdScreening: {
    baseEffect: -0.15, // 15% reduction in complications
    confidence: 'medium',
    source: 'NHS Health Check evaluation',
    doseResponse: 'logarithmic',
  },
  sugarTax: {
    baseEffect: -0.08, // 8% reduction in SSB consumption per 10% tax
    confidence: 'high',
    source: 'Mexico SSB tax evaluation',
    doseResponse: 'linear',
  },

  // Infrastructure
  primaryCareExpansion: {
    baseEffect: 0.02,  // 2% improvement in outcomes per unit
    confidence: 'medium',
    source: 'Starfield PHC effectiveness',
    doseResponse: 'logarithmic',
  },
};

/**
 * Calculate expected effect with uncertainty bounds
 */
export function calculateInterventionEffect(
  interventionId: string,
  coverageLevel: number, // 0-100
  baselineLevel: number  // 0-100
): {
  expectedEffect: number;
  ci95: [number, number];
  confidenceLevel: string;
} {
  const estimate = interventionEffectEstimates[interventionId];

  if (!estimate) {
    return {
      expectedEffect: 0,
      ci95: [0, 0],
      confidenceLevel: 'unknown',
    };
  }

  const coverageChange = (coverageLevel - baselineLevel) / 100;

  let effect: number;
  switch (estimate.doseResponse) {
    case 'logarithmic':
      // Diminishing returns
      effect = estimate.baseEffect * Math.log(1 + coverageChange * 2) / Math.log(3);
      break;
    case 'threshold':
      // Effect only kicks in above threshold
      effect = coverageLevel > 50 ? estimate.baseEffect * coverageChange : 0;
      break;
    default:
      // Linear
      effect = estimate.baseEffect * coverageChange;
  }

  // Confidence interval based on confidence level
  const uncertaintyMultiplier = estimate.confidence === 'high' ? 0.2 :
                                estimate.confidence === 'medium' ? 0.35 : 0.5;

  const ci95: [number, number] = [
    effect * (1 - uncertaintyMultiplier),
    effect * (1 + uncertaintyMultiplier),
  ];

  return {
    expectedEffect: effect,
    ci95,
    confidenceLevel: estimate.confidence,
  };
}
