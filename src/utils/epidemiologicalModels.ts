/**
 * Epidemiological Models for Agentic Health Twin
 *
 * Based on science-grounded algorithms from:
 * - Covasim (Institute for Disease Modeling)
 * - pyepidemics (compartmental models)
 * - FRED (agent-based modeling concepts)
 *
 * Implements compartmental disease models for:
 * - HIV/AIDS progression (SEIR with treatment states)
 * - Malaria transmission (Ross-Macdonald inspired)
 * - NCDs (multi-state Markov models)
 */

// ============ TYPE DEFINITIONS ============

export interface CompartmentState {
  S: number;  // Susceptible
  E: number;  // Exposed
  I: number;  // Infected
  R: number;  // Recovered
  T: number;  // On Treatment (for HIV)
  D: number;  // Deaths
}

export interface DiseaseParameters {
  beta: number;        // Transmission rate
  sigma: number;       // Incubation rate (1/latent period)
  gamma: number;       // Recovery rate
  mu: number;          // Disease mortality rate
  treatmentRate: number;
  treatmentEfficacy: number;
}

export interface InterventionEffect {
  betaReduction: number;      // Reduction in transmission
  treatmentIncrease: number;  // Increase in treatment coverage
  mortalityReduction: number; // Reduction in mortality
}

export interface EpidemiologicalProjection {
  year: number;
  prevalence: number;
  incidence: number;
  deaths: number;
  onTreatment: number;
  daly: number;  // Disability-Adjusted Life Years
}

// ============ HIV/AIDS MODEL ============
// Extended SEIR model with treatment compartment

export class HIVModel {
  private state: CompartmentState;
  private params: DiseaseParameters;
  private population: number;

  constructor(
    population: number,
    initialPrevalence: number,
    treatmentCoverage: number
  ) {
    this.population = population;
    const infected = population * (initialPrevalence / 100);
    const onTreatment = infected * (treatmentCoverage / 100);

    this.state = {
      S: population - infected,
      E: 0,  // HIV has minimal latent period for modeling
      I: infected - onTreatment,
      R: 0,  // HIV has no natural recovery
      T: onTreatment,
      D: 0,
    };

    // HIV-specific parameters (annual rates)
    // Based on UNAIDS estimates and Lancet HIV modeling
    this.params = {
      beta: 0.03,         // Annual incidence rate without intervention
      sigma: 12,          // Quick progression from exposure
      gamma: 0,           // No natural recovery
      mu: 0.02,           // ~2% annual AIDS mortality without treatment
      treatmentRate: 0.15, // Rate of starting treatment
      treatmentEfficacy: 0.95, // Viral suppression reduces transmission by 95%
    };
  }

  /**
   * Apply intervention effects to model parameters
   */
  applyIntervention(effect: InterventionEffect): void {
    this.params.beta *= (1 - effect.betaReduction);
    this.params.treatmentRate *= (1 + effect.treatmentIncrease);
    this.params.mu *= (1 - effect.mortalityReduction);
  }

  /**
   * Simulate one year forward using differential equations
   * Simplified Euler method for discrete time steps
   */
  stepYear(): CompartmentState {
    const { S, I, T } = this.state;
    const { beta, mu, treatmentRate, treatmentEfficacy } = this.params;
    const N = this.population;

    // Effective transmission (treatment reduces infectivity)
    const effectiveBeta = beta * (1 - treatmentEfficacy * (T / (I + T + 0.001)));

    // New infections
    const newInfections = effectiveBeta * S * (I / N);

    // Treatment initiation
    const newTreatment = treatmentRate * I;

    // Deaths (higher for untreated)
    const untreatedDeaths = mu * I;
    const treatedDeaths = mu * 0.1 * T;  // 90% mortality reduction with treatment

    // Update compartments
    this.state.S -= newInfections;
    this.state.I += newInfections - newTreatment - untreatedDeaths;
    this.state.T += newTreatment - treatedDeaths;
    this.state.D += untreatedDeaths + treatedDeaths;

    // Ensure non-negative
    Object.keys(this.state).forEach(key => {
      this.state[key as keyof CompartmentState] = Math.max(0, this.state[key as keyof CompartmentState]);
    });

    return { ...this.state };
  }

  /**
   * Project over multiple years
   */
  project(years: number): EpidemiologicalProjection[] {
    const projections: EpidemiologicalProjection[] = [];
    const currentYear = 2025;

    for (let y = 0; y <= years; y++) {
      const totalInfected = this.state.I + this.state.T;
      const prevalence = (totalInfected / this.population) * 100;
      const incidence = this.params.beta * this.state.S * (this.state.I / this.population);

      // DALY calculation: YLL + YLD
      // HIV disability weight: 0.053 (on ART) to 0.547 (AIDS)
      const yld = this.state.I * 0.4 + this.state.T * 0.053;
      const yll = (this.state.D / years) * 30; // Avg 30 years lost per death

      projections.push({
        year: currentYear + y,
        prevalence,
        incidence: (incidence / this.population) * 1000, // per 1000
        deaths: this.state.D,
        onTreatment: (this.state.T / totalInfected) * 100,
        daly: yld + yll,
      });

      if (y < years) {
        this.stepYear();
      }
    }

    return projections;
  }

  getState(): CompartmentState {
    return { ...this.state };
  }
}

// ============ MALARIA MODEL ============
// Ross-Macdonald inspired SEIR with seasonal dynamics

export class MalariaModel {
  private state: CompartmentState;
  private params: DiseaseParameters;
  private population: number;
  private seasonalAmplitude: number;

  constructor(
    population: number,
    annualIncidence: number, // cases per 1000
    seasonalAmplitude: number = 0.3
  ) {
    this.population = population;
    this.seasonalAmplitude = seasonalAmplitude;

    // Estimate current infected from incidence
    // Average infection duration ~2 weeks, so prevalence ≈ incidence * duration
    const infected = (annualIncidence / 1000) * population * (14 / 365);

    this.state = {
      S: population - infected,
      E: infected * 0.3,  // ~30% in latent stage
      I: infected * 0.7,
      R: 0,  // Partial immunity, simplified
      T: 0,
      D: 0,
    };

    // Malaria parameters (adapted from malaria modeling literature)
    this.params = {
      beta: annualIncidence / 1000 / 4,  // Quarterly transmission cycles
      sigma: 52,          // ~1 week incubation (52 weeks/year ÷ 1 week)
      gamma: 26,          // ~2 week infection duration
      mu: 0.001,          // ~0.1% case fatality rate
      treatmentRate: 0.6, // 60% treatment access
      treatmentEfficacy: 0.95,
    };
  }

  /**
   * Get seasonal transmission modifier
   */
  private getSeasonalModifier(month: number): number {
    // Peak transmission during rainy season (Nov-Apr in Zambia)
    const peakMonth = 1; // January
    const phase = ((month - peakMonth) / 12) * 2 * Math.PI;
    return 1 + this.seasonalAmplitude * Math.cos(phase);
  }

  applyIntervention(effect: InterventionEffect): void {
    // ITN (bed nets): reduce beta by 50-70%
    // IRS (indoor spraying): reduce beta by 40-60%
    // ACT treatment: reduce mu by 80-95%
    this.params.beta *= (1 - effect.betaReduction);
    this.params.mu *= (1 - effect.mortalityReduction);
    this.params.treatmentRate *= (1 + effect.treatmentIncrease);
  }

  stepYear(): CompartmentState {
    const dt = 1 / 52; // Weekly time steps

    for (let week = 0; week < 52; week++) {
      const month = Math.floor(week / 4.33);
      const seasonalBeta = this.params.beta * this.getSeasonalModifier(month);

      const { S, E, I } = this.state;
      const { sigma, gamma, mu, treatmentRate, treatmentEfficacy } = this.params;
      const N = this.population;

      // Force of infection
      const lambda = seasonalBeta * I / N;

      // Transitions
      const newExposed = lambda * S;
      const newInfected = sigma * E * dt;
      const recovered = gamma * I * dt;
      const treated = treatmentRate * I * dt;
      const deaths = mu * I * (1 - treatmentRate * treatmentEfficacy) * dt;

      // Update
      this.state.S += -newExposed * dt + recovered * 0.1; // Partial immunity loss
      this.state.E += newExposed * dt - newInfected;
      this.state.I += newInfected - recovered - treated - deaths;
      this.state.R += recovered * 0.9; // Most go to partial immunity
      this.state.T += treated;
      this.state.D += deaths;

      // Non-negative constraint
      Object.keys(this.state).forEach(key => {
        this.state[key as keyof CompartmentState] = Math.max(0, this.state[key as keyof CompartmentState]);
      });
    }

    // Reset recovered (partial immunity wanes)
    this.state.S += this.state.R * 0.5;
    this.state.R *= 0.5;
    this.state.T = 0; // Reset annual treatment count

    return { ...this.state };
  }

  project(years: number): EpidemiologicalProjection[] {
    const projections: EpidemiologicalProjection[] = [];
    const currentYear = 2025;

    for (let y = 0; y <= years; y++) {
      const incidence = (this.params.beta * this.state.S / this.population) * 1000;
      const prevalence = ((this.state.I + this.state.E) / this.population) * 100;

      // DALY: Malaria disability weight 0.051 (uncomplicated) to 0.133 (severe)
      const yld = this.state.I * 0.08;
      const yll = (this.state.D / Math.max(1, y)) * 35;

      projections.push({
        year: currentYear + y,
        prevalence,
        incidence,
        deaths: this.state.D,
        onTreatment: this.params.treatmentRate * 100,
        daly: yld + yll,
      });

      if (y < years) {
        this.stepYear();
      }
    }

    return projections;
  }

  getState(): CompartmentState {
    return { ...this.state };
  }
}

// ============ NCD PROGRESSION MODEL ============
// Multi-state Markov model for chronic diseases

export interface NCDState {
  healthy: number;
  atRisk: number;
  undiagnosed: number;
  diagnosed: number;
  controlled: number;
  complications: number;
  deaths: number;
}

export interface NCDParameters {
  progressionToRisk: number;      // Healthy → At Risk
  progressionToDisease: number;   // At Risk → Undiagnosed
  diagnosisRate: number;          // Undiagnosed → Diagnosed
  controlRate: number;            // Diagnosed → Controlled
  complicationRate: number;       // Diagnosed → Complications
  mortalityRateComplication: number;
  mortalityRateControlled: number;
}

export class NCDModel {
  private state: NCDState;
  private params: NCDParameters;
  private population: number;

  constructor(
    population: number,
    prevalence: number,
    undiagnosedPercent: number,
    _diseaseName: string = 'diabetes'
  ) {
    this.population = population;

    const totalWithDisease = population * (prevalence / 100);
    const undiagnosed = totalWithDisease * (undiagnosedPercent / 100);
    const diagnosed = totalWithDisease - undiagnosed;

    this.state = {
      healthy: population * 0.5,  // Simplified: 50% truly healthy
      atRisk: population * 0.3,   // 30% at risk (pre-diabetes, pre-hypertension)
      undiagnosed,
      diagnosed: diagnosed * 0.6,
      controlled: diagnosed * 0.4,
      complications: 0,
      deaths: 0,
    };

    // Default parameters for diabetes (adjust for other NCDs)
    this.params = {
      progressionToRisk: 0.02,      // 2% annual progression
      progressionToDisease: 0.05,   // 5% of at-risk progress
      diagnosisRate: 0.1,           // 10% diagnosed per year
      controlRate: 0.3,             // 30% achieve control
      complicationRate: 0.03,       // 3% develop complications
      mortalityRateComplication: 0.05,
      mortalityRateControlled: 0.01,
    };
  }

  applyIntervention(effect: {
    screeningIncrease?: number;
    controlImprovement?: number;
    preventionEffect?: number;
    treatmentAccess?: number;
  }): void {
    if (effect.screeningIncrease) {
      this.params.diagnosisRate *= (1 + effect.screeningIncrease);
    }
    if (effect.controlImprovement) {
      this.params.controlRate *= (1 + effect.controlImprovement);
    }
    if (effect.preventionEffect) {
      this.params.progressionToRisk *= (1 - effect.preventionEffect);
      this.params.progressionToDisease *= (1 - effect.preventionEffect);
    }
    if (effect.treatmentAccess) {
      this.params.complicationRate *= (1 - effect.treatmentAccess * 0.5);
    }
  }

  stepYear(): NCDState {
    const { healthy, atRisk, undiagnosed, diagnosed, controlled, complications } = this.state;
    const p = this.params;

    // Transitions
    const newAtRisk = p.progressionToRisk * healthy;
    const newUndiagnosed = p.progressionToDisease * atRisk;
    const newDiagnosed = p.diagnosisRate * undiagnosed;
    const newControlled = p.controlRate * diagnosed;
    const newComplications = p.complicationRate * diagnosed;
    const deathsComplication = p.mortalityRateComplication * complications;
    const deathsControlled = p.mortalityRateControlled * controlled;

    // Update states
    this.state.healthy -= newAtRisk;
    this.state.atRisk += newAtRisk - newUndiagnosed;
    this.state.undiagnosed += newUndiagnosed - newDiagnosed;
    this.state.diagnosed += newDiagnosed - newControlled - newComplications;
    this.state.controlled += newControlled - deathsControlled;
    this.state.complications += newComplications - deathsComplication;
    this.state.deaths += deathsComplication + deathsControlled;

    // Non-negative
    Object.keys(this.state).forEach(key => {
      this.state[key as keyof NCDState] = Math.max(0, this.state[key as keyof NCDState]);
    });

    return { ...this.state };
  }

  project(years: number): EpidemiologicalProjection[] {
    const projections: EpidemiologicalProjection[] = [];
    const currentYear = 2025;

    for (let y = 0; y <= years; y++) {
      const totalWithDisease = this.state.undiagnosed + this.state.diagnosed +
                               this.state.controlled + this.state.complications;
      const prevalence = (totalWithDisease / this.population) * 100;
      const incidence = this.params.progressionToDisease * this.state.atRisk;

      // Treatment coverage
      const onTreatment = ((this.state.diagnosed + this.state.controlled) /
                          Math.max(1, totalWithDisease)) * 100;

      // DALY: Diabetes disability weights vary by state
      // Uncomplicated: 0.015, Controlled: 0.01, Complications: 0.1-0.6
      const yld = this.state.undiagnosed * 0.02 +
                  this.state.diagnosed * 0.015 +
                  this.state.controlled * 0.01 +
                  this.state.complications * 0.3;
      const yll = (this.state.deaths / Math.max(1, y)) * 15;

      projections.push({
        year: currentYear + y,
        prevalence,
        incidence: (incidence / this.population) * 1000,
        deaths: this.state.deaths,
        onTreatment,
        daly: yld + yll,
      });

      if (y < years) {
        this.stepYear();
      }
    }

    return projections;
  }

  getState(): NCDState {
    return { ...this.state };
  }
}

// ============ INTEGRATED SIMULATION ============

export interface IntegratedHealthProjection {
  year: number;
  hiv: EpidemiologicalProjection;
  malaria: EpidemiologicalProjection;
  diabetes: EpidemiologicalProjection;
  totalDALY: number;
  lifeExpectancy: number;
  healthyLifeExpectancy: number;
}

/**
 * Run integrated disease projection for Zambia
 */
export function runIntegratedProjection(
  population: number,
  baselineStats: {
    hivPrevalence: number;
    hivTreatment: number;
    malariaIncidence: number;
    diabetesPrevalence: number;
    diabetesUndiagnosed: number;
    lifeExpectancy: number;
  },
  interventionEffects: {
    hiv?: InterventionEffect;
    malaria?: InterventionEffect;
    ncd?: Parameters<NCDModel['applyIntervention']>[0];
  },
  years: number = 15
): IntegratedHealthProjection[] {
  // Initialize models
  const hivModel = new HIVModel(
    population,
    baselineStats.hivPrevalence,
    baselineStats.hivTreatment
  );

  const malariaModel = new MalariaModel(
    population,
    baselineStats.malariaIncidence
  );

  const diabetesModel = new NCDModel(
    population,
    baselineStats.diabetesPrevalence,
    baselineStats.diabetesUndiagnosed,
    'diabetes'
  );

  // Apply interventions
  if (interventionEffects.hiv) {
    hivModel.applyIntervention(interventionEffects.hiv);
  }
  if (interventionEffects.malaria) {
    malariaModel.applyIntervention(interventionEffects.malaria);
  }
  if (interventionEffects.ncd) {
    diabetesModel.applyIntervention(interventionEffects.ncd);
  }

  // Project all diseases
  const hivProjection = hivModel.project(years);
  const malariaProjection = malariaModel.project(years);
  const diabetesProjection = diabetesModel.project(years);

  // Combine projections
  const integrated: IntegratedHealthProjection[] = [];

  for (let i = 0; i <= years; i++) {
    const totalDALY = hivProjection[i].daly +
                      malariaProjection[i].daly +
                      diabetesProjection[i].daly;

    // Estimate life expectancy impact from DALYs
    // Rough approximation: 1000 DALYs per 100K = 0.1 year LE reduction
    const dalyPer100K = (totalDALY / population) * 100000;
    const leImpact = dalyPer100K * 0.0001;

    integrated.push({
      year: 2025 + i,
      hiv: hivProjection[i],
      malaria: malariaProjection[i],
      diabetes: diabetesProjection[i],
      totalDALY,
      lifeExpectancy: baselineStats.lifeExpectancy - leImpact * 0.5 + (i * 0.15), // Natural improvement
      healthyLifeExpectancy: (baselineStats.lifeExpectancy - 8) - leImpact + (i * 0.2),
    });
  }

  return integrated;
}
