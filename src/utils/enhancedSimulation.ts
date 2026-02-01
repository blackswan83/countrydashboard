/**
 * Enhanced Simulation Engine
 *
 * Integrates science-grounded algorithms into the intervention simulation:
 * - Compartmental disease models (SEIR for HIV, Ross-Macdonald for malaria)
 * - Proper QALY/DALY calculations with discounting
 * - Causal inference-based intervention effects
 * - Cost-effectiveness analysis with WHO-CHOICE thresholds
 */

import { interventions } from '../data/interventionData';
import type { HealthOutcome } from '../data/interventionData';

import {
  HIVModel,
  MalariaModel,
  NCDModel,
  runIntegratedProjection,
  type IntegratedHealthProjection,
} from './epidemiologicalModels';

import {
  calculateDALY,
  getCEThreshold,
  runCEA,
  calculateQALY,
  type QALYResult,
  type CEAResult,
  type HealthState,
} from './healthEconomics';

import {
  interventionEffectEstimates,
  calculateInterventionEffect,
} from './causalInference';

// Effect result type from calculateInterventionEffect
interface InterventionEffectResult {
  expectedEffect: number;
  ci95: [number, number];
  confidenceLevel: string;
}

// Zambia-specific baseline stats (override KSA defaults)
const zambiaBaseline = {
  population: 19.61, // millions
  hivPrevalence: 11.1,
  malariaIncidence: 285,
  diabetesPrevalence: 3.5,
  lifeExpectancy: 64,
};

// CE thresholds for Zambia (GDP per capita ~$1,500)
const ZAMBIA_THRESHOLD = getCEThreshold(1500);

// Enhanced types
export interface EnhancedEconomicImpact {
  totalCost: number;
  healthcareSavings: number;
  productivityGains: number;
  qalyGained: number;
  dalyAverted: number;
  roi: number;
  netBenefit: number;
  icer: number;
  ceCategory: 'highly_cost_effective' | 'cost_effective' | 'not_cost_effective';
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface DiseaseProjection {
  year: number;
  hivPrevalence: number;
  hivCases: number;
  malariaIncidence: number;
  malariaCases: number;
  diabetesPrevalence: number;
  mortalityReduction: number;
}

export interface EnhancedSimulationResult {
  economicImpact: EnhancedEconomicImpact;
  outcomeDeltas: Record<HealthOutcome, number>;
  diseaseProjections: DiseaseProjection[];
  integratedProjection: IntegratedHealthProjection[];
  interventionEffects: Record<string, InterventionEffectResult>;
  confidenceLevels: Record<string, 'high' | 'medium' | 'low'>;
  ceaResults: CEAResult[];
  qalyDetails: QALYResult;
}

// ========== HELPER FUNCTIONS ==========

function getInterventionValue(
  values: Record<string, number>,
  key: string,
  defaultValue: number
): number {
  const keys = [key, key.toLowerCase(), key.replace(/([A-Z])/g, '_$1').toLowerCase()];
  for (const k of keys) {
    if (values[k] !== undefined) return values[k];
  }
  return defaultValue;
}

function mapInterventionToEffect(
  interventionId: string,
  value: number,
  baseline: number,
  max: number
): { effect: number; confidence: 'high' | 'medium' | 'low' } {
  const effectMap: Record<string, string> = {
    'artCoverage': 'artCoverage',
    'itnCoverage': 'itnCoverage',
    'itnDistribution': 'itnCoverage',
    'screeningPrograms': 'screeningPrograms',
    'diabetesScreening': 'screeningPrograms',
    'primaryCare': 'primaryCareExpansion',
    'phcExpansion': 'primaryCareExpansion',
    'chw': 'chwPrograms',
    'communityHealth': 'chwPrograms',
    'digitalHealth': 'mHealthInterventions',
    'mHealth': 'mHealthInterventions',
    'behavioralInterventions': 'behavioralInterventions',
    'lifestyle': 'behavioralInterventions',
  };

  const causalEffectKey = effectMap[interventionId];
  const causalEstimate = causalEffectKey
    ? interventionEffectEstimates[causalEffectKey]
    : null;

  if (!causalEstimate) {
    const normalizedChange = (value - baseline) / (max - baseline || 1);
    return {
      effect: normalizedChange * -0.05,
      confidence: 'low',
    };
  }

  const normalizedValue = (value - baseline) / (max - baseline || 1);
  const scaledEffect = causalEstimate.baseEffect * normalizedValue;

  return {
    effect: scaledEffect,
    confidence: causalEstimate.confidence,
  };
}

// ========== EPIDEMIOLOGICAL PROJECTIONS ==========

function runDiseaseModels(
  interventionValues: Record<string, number>,
  timeHorizon: number
): DiseaseProjection[] {
  const population = zambiaBaseline.population * 1000000;

  const artEffect = getInterventionValue(interventionValues, 'artCoverage', 82);
  const itnEffect = getInterventionValue(interventionValues, 'itnCoverage', 68);
  const screeningEffect = getInterventionValue(interventionValues, 'screeningPrograms', 30);

  // Initialize models with Zambia baseline stats
  const hivModel = new HIVModel(
    population,
    zambiaBaseline.hivPrevalence,
    artEffect
  );

  const malariaModel = new MalariaModel(
    population,
    zambiaBaseline.malariaIncidence
  );

  const ncdModel = new NCDModel(
    population,
    zambiaBaseline.diabetesPrevalence,
    58
  );

  // Apply intervention effects
  if (artEffect > 82) {
    hivModel.applyIntervention({
      betaReduction: (artEffect - 82) / 100 * 0.5,
      treatmentIncrease: (artEffect - 82) / 100 * 0.3,
      mortalityReduction: (artEffect - 82) / 100 * 0.3,
    });
  }

  if (itnEffect > 68) {
    malariaModel.applyIntervention({
      betaReduction: (itnEffect - 68) / 100 * 0.4,
      treatmentIncrease: 0.05,
      mortalityReduction: 0.1,
    });
  }

  if (screeningEffect > 30) {
    ncdModel.applyIntervention({
      screeningIncrease: (screeningEffect - 30) / 100 * 0.6,
      controlImprovement: 0.1,
    });
  }

  // Project forward
  const projections: DiseaseProjection[] = [];
  const currentYear = 2025;

  for (let year = 0; year <= timeHorizon; year++) {
    const hivState = hivModel.stepYear();
    const malariaState = malariaModel.stepYear();
    const ncdState = ncdModel.stepYear();

    const hivPrevalence = (hivState.I + hivState.T) / population * 100;
    const malariaIncidence = (malariaState.E + malariaState.I) / population * 1000;
    const diabetesPrevalence = (ncdState.diagnosed + ncdState.undiagnosed) / population * 100;

    const hivMortalityReduction = hivState.T / (hivState.I + hivState.T + 0.001) * 0.9;
    const malariaMortalityReduction = Math.min(0.3, (68 - malariaIncidence / 285 * 68) / 100);
    const totalMortalityReduction = hivMortalityReduction * 0.4 + malariaMortalityReduction * 0.3 + 0.3 * (screeningEffect / 100);

    projections.push({
      year: currentYear + year,
      hivPrevalence,
      hivCases: Math.round(hivState.I + hivState.T),
      malariaIncidence,
      malariaCases: Math.round(malariaState.I * 10),
      diabetesPrevalence,
      mortalityReduction: totalMortalityReduction,
    });
  }

  return projections;
}

// ========== QALY/DALY CALCULATIONS ==========

function calculateHealthMetrics(
  diseaseProjections: DiseaseProjection[],
  timeHorizon: number
): { qalyResult: QALYResult; totalDalyAverted: number } {
  // Generate health states from projections
  const healthStates: HealthState[] = diseaseProjections.map((proj, i) => {
    const baseUtility = 0.85;
    const hivPenalty = proj.hivPrevalence / 100 * 0.15;
    const malariaPenalty = proj.malariaIncidence / 1000 * 0.05;
    const diabetesPenalty = proj.diabetesPrevalence / 100 * 0.08;
    const utilityWeight = Math.max(0.4, baseUtility - hivPenalty - malariaPenalty - diabetesPenalty);

    return {
      name: `Year ${i}`,
      utility: utilityWeight,
      duration: 1,
      annualCost: 100,
      transitionProb: 0.02,
    };
  });

  const qalyResult = calculateQALY(healthStates, 0.03, true);

  // Calculate DALYs averted
  const baselineDALY = calculateDALY(
    5000, 55, 64, 15,
    zambiaBaseline.population * 1000000,
    0.1, 10, 0.03
  );

  const lastProj = diseaseProjections[timeHorizon] || diseaseProjections[diseaseProjections.length - 1];
  const interventionDALY = calculateDALY(
    5000 * (1 - (lastProj?.mortalityReduction || 0)),
    57, 64, 12,
    zambiaBaseline.population * 1000000,
    0.08, 8, 0.03
  );

  const totalDalyAverted = baselineDALY.total - interventionDALY.total;

  return { qalyResult, totalDalyAverted };
}

// ========== COST-EFFECTIVENESS ANALYSIS ==========

function runEnhancedCEA(
  interventionValues: Record<string, number>,
  qalyGained: number,
  totalCost: number
): { ceaResults: CEAResult[]; icer: number; ceCategory: 'highly_cost_effective' | 'cost_effective' | 'not_cost_effective' } {
  const ceaInterventions = interventions
    .filter(i => (interventionValues[i.id] ?? i.baseline) > i.baseline)
    .map(i => {
      const value = interventionValues[i.id] ?? i.baseline;
      const normalizedChange = (value - i.baseline) / (i.max - i.min || 1);
      const cost = normalizedChange * i.costPerUnit * 10 * 1000000;
      const effectContribution = Math.abs(i.impacts.reduce((sum, imp) => sum + imp.baseEffect, 0)) / 3;
      const qalyContribution = qalyGained * effectContribution;

      return {
        name: i.name,
        cost,
        qaly: qalyContribution,
      };
    });

  const ceaResults = runCEA(ceaInterventions, ZAMBIA_THRESHOLD.costEffective);
  const icer = qalyGained > 0 ? (totalCost * 1000000000) / qalyGained : Infinity;

  let ceCategory: 'highly_cost_effective' | 'cost_effective' | 'not_cost_effective';
  if (icer < ZAMBIA_THRESHOLD.highlyEffective) {
    ceCategory = 'highly_cost_effective';
  } else if (icer < ZAMBIA_THRESHOLD.costEffective) {
    ceCategory = 'cost_effective';
  } else {
    ceCategory = 'not_cost_effective';
  }

  return { ceaResults, icer, ceCategory };
}

// ========== MAIN ENHANCED SIMULATION ==========

export function runEnhancedSimulation(
  interventionValues: Record<string, number>,
  timeHorizon: number = 15
): EnhancedSimulationResult {
  // 1. Run epidemiological disease models
  const diseaseProjections = runDiseaseModels(interventionValues, timeHorizon);

  // 2. Run integrated projection
  const integratedProjection = runIntegratedProjection(
    zambiaBaseline.population * 1000000,
    {
      hivPrevalence: zambiaBaseline.hivPrevalence,
      hivTreatment: getInterventionValue(interventionValues, 'artCoverage', 82) / 100,
      malariaIncidence: zambiaBaseline.malariaIncidence,
      diabetesPrevalence: zambiaBaseline.diabetesPrevalence,
      diabetesUndiagnosed: 58,
      lifeExpectancy: zambiaBaseline.lifeExpectancy,
    },
    {
      hiv: {
        betaReduction: 0.1,
        treatmentIncrease: 0.2,
        mortalityReduction: 0.05,
      },
      malaria: {
        betaReduction: 0.2,
        treatmentIncrease: 0.1,
        mortalityReduction: 0.1,
      },
      ncd: {
        screeningIncrease: 0.3,
        controlImprovement: 0.15,
      },
    },
    timeHorizon
  );

  // 3. Calculate intervention effects with causal estimates
  const interventionEffects: Record<string, InterventionEffectResult> = {};
  const confidenceLevels: Record<string, 'high' | 'medium' | 'low'> = {};

  interventions.forEach(intervention => {
    const value = interventionValues[intervention.id] ?? intervention.baseline;
    if (value > intervention.baseline) {
      const { confidence } = mapInterventionToEffect(
        intervention.id,
        value,
        intervention.baseline,
        intervention.max
      );

      interventionEffects[intervention.id] = calculateInterventionEffect(
        intervention.id,
        value,
        intervention.baseline
      );
      confidenceLevels[intervention.id] = confidence;
    }
  });

  // 4. Calculate economic metrics
  let totalCost = 0;
  interventions.forEach(intervention => {
    const value = interventionValues[intervention.id] ?? intervention.baseline;
    const change = value - intervention.baseline;
    const normalizedChange = change / (intervention.max - intervention.min || 1);
    totalCost += normalizedChange * intervention.costPerUnit * 10 * (timeHorizon / 15);
  });

  // 5. Calculate QALY and DALY metrics
  const { qalyResult, totalDalyAverted } = calculateHealthMetrics(diseaseProjections, timeHorizon);
  const populationQaly = qalyResult.discounted * zambiaBaseline.population * 0.3;

  // 6. Run cost-effectiveness analysis
  const { ceaResults, icer, ceCategory } = runEnhancedCEA(interventionValues, populationQaly, totalCost);

  // 7. Calculate healthcare savings and productivity gains
  const lastProjection = diseaseProjections[diseaseProjections.length - 1];
  const baselineProjection = diseaseProjections[0];

  const hivReduction = baselineProjection && lastProjection
    ? (baselineProjection.hivPrevalence - lastProjection.hivPrevalence) / (baselineProjection.hivPrevalence || 1)
    : 0;
  const malariaReduction = baselineProjection && lastProjection
    ? (baselineProjection.malariaIncidence - lastProjection.malariaIncidence) / (baselineProjection.malariaIncidence || 1)
    : 0;

  const annualHivCost = 0.8;
  const annualMalariaCost = 0.3;
  const annualNcdCost = 0.2;

  const healthcareSavings = (
    hivReduction * annualHivCost +
    malariaReduction * annualMalariaCost +
    0.1 * annualNcdCost
  ) * timeHorizon * 0.85;

  const productivityGains = (lastProjection?.mortalityReduction || 0) * 0.5 * timeHorizon * 0.85;

  const netBenefit = healthcareSavings + productivityGains - totalCost;
  const roi = totalCost > 0 ? (netBenefit / totalCost) * 100 : 0;

  // Determine overall confidence level
  const confidenceValues = Object.values(confidenceLevels);
  const highCount = confidenceValues.filter(c => c === 'high').length;
  const mediumCount = confidenceValues.filter(c => c === 'medium').length;
  const overallConfidence: 'high' | 'medium' | 'low' =
    highCount > confidenceValues.length / 2 ? 'high' :
    mediumCount + highCount > confidenceValues.length / 2 ? 'medium' : 'low';

  // 8. Calculate outcome deltas
  const outcomeDeltas: Record<HealthOutcome, number> = {
    diabetes: baselineProjection && lastProjection
      ? -((baselineProjection.diabetesPrevalence - lastProjection.diabetesPrevalence) / (baselineProjection.diabetesPrevalence || 1)) * 100
      : 0,
    obesity: -5,
    cvd: baselineProjection && lastProjection
      ? -((baselineProjection.hivPrevalence * 0.1 - lastProjection.hivPrevalence * 0.08)) * 10
      : 0,
    hypertension: -3,
    lifeExpectancy: (lastProjection?.mortalityReduction || 0) * 5,
    healthyLifeYears: (lastProjection?.mortalityReduction || 0) * 7,
    healthcareCosts: totalCost > 0 ? -(healthcareSavings / totalCost) * 100 : 0,
    productivity: (lastProjection?.mortalityReduction || 0) * 15,
  };

  return {
    economicImpact: {
      totalCost: Math.round(totalCost * 10) / 10,
      healthcareSavings: Math.round(healthcareSavings * 10) / 10,
      productivityGains: Math.round(productivityGains * 10) / 10,
      qalyGained: Math.round(populationQaly),
      dalyAverted: Math.round(totalDalyAverted * zambiaBaseline.population * 0.1),
      roi: Math.round(roi),
      netBenefit: Math.round(netBenefit * 10) / 10,
      icer: Math.round(icer),
      ceCategory,
      confidenceLevel: overallConfidence,
    },
    outcomeDeltas,
    diseaseProjections,
    integratedProjection,
    interventionEffects,
    confidenceLevels,
    ceaResults,
    qalyDetails: qalyResult,
  };
}

/**
 * Get human-readable evidence summary for an intervention
 */
export function getInterventionEvidenceSummary(interventionId: string): string {
  const effectMap: Record<string, string> = {
    'artCoverage': 'artCoverage',
    'itnCoverage': 'itnCoverage',
    'screeningPrograms': 'screeningPrograms',
    'primaryCare': 'primaryCareExpansion',
  };

  const key = effectMap[interventionId] || interventionId;
  const estimate = interventionEffectEstimates[key];

  if (!estimate) {
    return 'Limited evidence available for this intervention.';
  }

  const confidenceText: Record<string, string> = {
    high: 'Strong evidence from randomized trials',
    medium: 'Moderate evidence from observational studies',
    low: 'Limited evidence, estimates based on expert opinion',
  };

  return `${confidenceText[estimate.confidence] || 'Evidence level unknown'}. Source: ${estimate.source}. Expected effect: ${(estimate.baseEffect * 100).toFixed(0)}% reduction in disease burden.`;
}

/**
 * Compare interventions by cost-effectiveness
 */
export function rankInterventionsByCostEffectiveness(
  interventionValues: Record<string, number>,
  timeHorizon: number = 15
): Array<{ id: string; name: string; icer: number; rank: number; ceCategory: string }> {
  const rankings: Array<{ id: string; name: string; icer: number; rank: number; ceCategory: string }> = [];

  interventions.forEach(intervention => {
    const testValues = { ...interventionValues };
    testValues[intervention.id] = intervention.max;

    const result = runEnhancedSimulation(testValues, timeHorizon);

    rankings.push({
      id: intervention.id,
      name: intervention.name,
      icer: result.economicImpact.icer,
      rank: 0,
      ceCategory: result.economicImpact.ceCategory,
    });
  });

  rankings.sort((a, b) => a.icer - b.icer);
  rankings.forEach((r, i) => r.rank = i + 1);

  return rankings;
}
