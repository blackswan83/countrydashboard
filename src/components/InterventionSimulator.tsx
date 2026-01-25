import { useState, useMemo } from 'react';
import { DataSovereigntySection } from './DataSovereignty';

// Policy intervention definitions
interface PolicyLever {
  id: string;
  name: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  baseline: number;
  costPerUnit: number; // SAR billions per unit
  icon: string;
}

const policyLevers: PolicyLever[] = [
  {
    id: 'sugarTax',
    name: 'Sugar Tax',
    description: 'Tax on sugary beverages and processed foods',
    unit: '%',
    min: 0,
    max: 50,
    baseline: 0,
    costPerUnit: -0.2, // Negative = revenue generating
    icon: '🥤',
  },
  {
    id: 'screeningCoverage',
    name: 'NCD Screening',
    description: 'Population coverage for diabetes/CVD screening',
    unit: '%',
    min: 20,
    max: 95,
    baseline: 42,
    costPerUnit: 0.15,
    icon: '🩺',
  },
  {
    id: 'physicalActivity',
    name: 'Activity Campaigns',
    description: 'National physical activity promotion reach',
    unit: '%',
    min: 10,
    max: 80,
    baseline: 25,
    costPerUnit: 0.08,
    icon: '🏃',
  },
  {
    id: 'primaryCare',
    name: 'Primary Care Expansion',
    description: 'New PHC centers per 100K population',
    unit: 'centers',
    min: 0,
    max: 5,
    baseline: 0,
    costPerUnit: 2.5,
    icon: '🏥',
  },
  {
    id: 'digitalHealth',
    name: 'Digital Health Twin',
    description: 'Population with personal health AI assistant',
    unit: '%',
    min: 5,
    max: 100,
    baseline: 15,
    costPerUnit: 0.12,
    icon: '📱',
  },
  {
    id: 'schoolNutrition',
    name: 'School Nutrition',
    description: 'Schools with healthy meal programs',
    unit: '%',
    min: 10,
    max: 100,
    baseline: 35,
    costPerUnit: 0.18,
    icon: '🍎',
  },
];

// Impact coefficients (how much each policy affects outcomes)
const impactCoefficients: Record<string, Record<string, number>> = {
  sugarTax: { diabetes: -0.08, obesity: -0.12, cvd: -0.05, lifeYears: 0.015 },
  screeningCoverage: { diabetes: -0.15, obesity: -0.02, cvd: -0.12, lifeYears: 0.025 },
  physicalActivity: { diabetes: -0.10, obesity: -0.18, cvd: -0.08, lifeYears: 0.020 },
  primaryCare: { diabetes: -0.06, obesity: -0.03, cvd: -0.10, lifeYears: 0.035 },
  digitalHealth: { diabetes: -0.12, obesity: -0.08, cvd: -0.10, lifeYears: 0.030 },
  schoolNutrition: { diabetes: -0.05, obesity: -0.15, cvd: -0.03, lifeYears: 0.010 },
};

// Baseline national stats
const baselineStats = {
  diabetesPrevalence: 16.4,
  obesityRate: 30.5, // Adult obesity specifically
  cvdPrevalence: 8.2,
  lifeExpectancy: 78.8,
  healthyLifeYears: 65,
  healthcareCostBn: 125, // SAR billions annually
  productivityLossBn: 45, // SAR billions annually
};

interface ProjectedOutcome {
  year: number;
  baseline: number;
  intervention: number;
  superAger: number;
}

// Generate trajectory projections
const generateTrajectory = (
  startValue: number,
  interventionEffect: number,
  years: number,
  metric: 'prevalence' | 'lifeYears'
): ProjectedOutcome[] => {
  const outcomes: ProjectedOutcome[] = [];

  for (let y = 0; y <= years; y++) {
    const t = y / years;

    // Baseline: slight worsening for prevalence, slight improvement for life years
    const baselineDrift = metric === 'prevalence' ? 1 + (t * 0.15) : 1 + (t * 0.02);
    const baseline = startValue * baselineDrift;

    // Intervention: gradual improvement (S-curve adoption)
    const adoptionCurve = 1 / (1 + Math.exp(-6 * (t - 0.4)));
    const interventionValue = metric === 'prevalence'
      ? startValue * (1 + interventionEffect * adoptionCurve)
      : startValue * (1 + interventionEffect * adoptionCurve);

    // Super ager reference (optimal trajectory)
    const superAgerTarget = metric === 'prevalence' ? startValue * 0.4 : startValue * 1.15;
    const superAger = startValue + (superAgerTarget - startValue) * Math.pow(t, 0.7);

    outcomes.push({
      year: 2025 + y,
      baseline: Math.max(0, baseline),
      intervention: Math.max(0, interventionValue),
      superAger: Math.max(0, superAger),
    });
  }

  return outcomes;
};

// Trajectory Chart Component
interface TrajectoryChartProps {
  data: ProjectedOutcome[];
  title: string;
  inverted?: boolean; // true for metrics where lower is better
}

const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ data, title, inverted }) => {
  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 80, bottom: 35, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap(d => [d.baseline, d.intervention, d.superAger]);
  const minVal = Math.min(...allValues) * 0.9;
  const maxVal = Math.max(...allValues) * 1.1;

  const xScale = (year: number) => padding.left + ((year - data[0].year) / (data[data.length - 1].year - data[0].year)) * chartWidth;
  const yScale = (val: number) => padding.top + (1 - (val - minVal) / (maxVal - minVal)) * chartHeight;

  const createPath = (values: number[]) => {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(values[i])}`).join(' ');
  };

  const lastIdx = data.length - 1;
  const improvement = inverted
    ? ((data[lastIdx].baseline - data[lastIdx].intervention) / data[lastIdx].baseline * 100)
    : ((data[lastIdx].intervention - data[lastIdx].baseline) / data[lastIdx].baseline * 100);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#3D3D3D' }}>{title}</span>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: (inverted ? improvement > 0 : improvement > 0) ? '#4A7C59' : '#C75B5B',
          background: (inverted ? improvement > 0 : improvement > 0) ? 'rgba(74, 124, 89, 0.1)' : 'rgba(199, 91, 91, 0.1)',
          padding: '4px 10px',
          borderRadius: 6,
        }}>
          {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}% by 2040
        </span>
      </div>
      <svg width={width} height={height} style={{ width: '100%', height: 'auto' }}>
        {/* Background */}
        <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#F5F0EB" rx="4" />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const val = minVal + (maxVal - minVal) * (1 - t);
          return (
            <g key={i}>
              <line x1={padding.left} y1={yScale(val)} x2={width - padding.right} y2={yScale(val)}
                    stroke="rgba(139, 115, 85, 0.15)" strokeDasharray="3,6" />
              <text x={padding.left - 8} y={yScale(val) + 4} fill="#8B8B8B" fontSize="10" textAnchor="end">
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area between baseline and intervention */}
        <path
          d={`${createPath(data.map(d => d.baseline))} L ${xScale(data[lastIdx].year)} ${yScale(data[lastIdx].intervention)} ${data.slice().reverse().map((d, i) => `L ${xScale(d.year)} ${yScale(data[lastIdx - i].intervention)}`).join(' ')} Z`}
          fill={inverted ? '#4A7C59' : '#C75B5B'}
          opacity="0.1"
        />

        {/* Super ager reference (dashed) */}
        <path d={createPath(data.map(d => d.superAger))} fill="none" stroke="#C4A77D" strokeWidth="2" strokeDasharray="6,4" />

        {/* Baseline trajectory */}
        <path d={createPath(data.map(d => d.baseline))} fill="none" stroke="#C75B5B" strokeWidth="2.5" />

        {/* Intervention trajectory */}
        <path d={createPath(data.map(d => d.intervention))} fill="none" stroke="#4A7C59" strokeWidth="3" />

        {/* X axis labels */}
        {data.filter((_, i) => i % 3 === 0).map(d => (
          <text key={d.year} x={xScale(d.year)} y={height - 8} fill="#8B8B8B" fontSize="10" textAnchor="middle">
            {d.year}
          </text>
        ))}

        {/* End labels */}
        <text x={width - 5} y={yScale(data[lastIdx].baseline)} fill="#C75B5B" fontSize="9" dominantBaseline="middle">
          Baseline
        </text>
        <text x={width - 5} y={yScale(data[lastIdx].intervention)} fill="#4A7C59" fontSize="9" fontWeight="600" dominantBaseline="middle">
          Projected
        </text>
        <text x={width - 5} y={yScale(data[lastIdx].superAger)} fill="#C4A77D" fontSize="9" dominantBaseline="middle">
          Optimal
        </text>
      </svg>
    </div>
  );
};

// Main Component
export const InterventionSimulator: React.FC = () => {
  const [interventions, setInterventions] = useState<Record<string, number>>(
    Object.fromEntries(policyLevers.map(p => [p.id, p.baseline]))
  );
  const [timeHorizon, setTimeHorizon] = useState(15);
  const [activeScenario, setActiveScenario] = useState<'custom' | 'conservative' | 'aggressive'>('custom');

  // Preset scenarios
  const applyScenario = (scenario: 'conservative' | 'aggressive') => {
    if (scenario === 'conservative') {
      setInterventions({
        sugarTax: 15,
        screeningCoverage: 60,
        physicalActivity: 40,
        primaryCare: 1,
        digitalHealth: 35,
        schoolNutrition: 60,
      });
    } else {
      setInterventions({
        sugarTax: 35,
        screeningCoverage: 85,
        physicalActivity: 70,
        primaryCare: 4,
        digitalHealth: 80,
        schoolNutrition: 95,
      });
    }
    setActiveScenario(scenario);
  };

  // Calculate total intervention effects
  const effects = useMemo(() => {
    let diabetesEffect = 0;
    let obesityEffect = 0;
    let cvdEffect = 0;
    let lifeYearsEffect = 0;
    let totalCost = 0;

    policyLevers.forEach(lever => {
      const change = interventions[lever.id] - lever.baseline;
      const normalizedChange = change / (lever.max - lever.min);

      diabetesEffect += normalizedChange * impactCoefficients[lever.id].diabetes;
      obesityEffect += normalizedChange * impactCoefficients[lever.id].obesity;
      cvdEffect += normalizedChange * impactCoefficients[lever.id].cvd;
      lifeYearsEffect += normalizedChange * impactCoefficients[lever.id].lifeYears;
      totalCost += change * lever.costPerUnit;
    });

    return { diabetesEffect, obesityEffect, cvdEffect, lifeYearsEffect, totalCost };
  }, [interventions]);

  // Generate trajectory data
  const diabetesTrajectory = useMemo(
    () => generateTrajectory(baselineStats.diabetesPrevalence, effects.diabetesEffect, timeHorizon, 'prevalence'),
    [effects.diabetesEffect, timeHorizon]
  );

  const lifeExpectancyTrajectory = useMemo(
    () => generateTrajectory(baselineStats.lifeExpectancy, effects.lifeYearsEffect, timeHorizon, 'lifeYears'),
    [effects.lifeYearsEffect, timeHorizon]
  );

  // Calculate economic impact
  const economicImpact = useMemo(() => {
    const healthcareSavings = effects.diabetesEffect * -150 + effects.cvdEffect * -120; // Billions SAR
    const productivityGains = effects.lifeYearsEffect * 80;
    const qalyGains = effects.lifeYearsEffect * 35.3 * 1000000 * 0.1; // QALYs gained
    const roi = (healthcareSavings + productivityGains - effects.totalCost) / Math.max(effects.totalCost, 1);

    return {
      healthcareSavings: Math.max(0, healthcareSavings * timeHorizon / 15),
      productivityGains: Math.max(0, productivityGains * timeHorizon / 15),
      qalyGains: Math.max(0, qalyGains),
      roi: roi > 0 ? roi : 0,
      netBenefit: healthcareSavings + productivityGains - effects.totalCost,
    };
  }, [effects, timeHorizon]);

  const handleSliderChange = (id: string, value: number) => {
    setInterventions(prev => ({ ...prev, [id]: value }));
    setActiveScenario('custom');
  };

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #8B7355 0%, #6B5344 100%)',
        borderRadius: 16,
        padding: '32px 40px',
        marginBottom: 24,
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(196, 167, 125, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>🧬</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                KSA Agentic Health Twin
              </h2>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 14 }}>
                Simulate policy interventions. See population health trajectories transform in real-time.
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: 24,
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>POPULATION MODELED</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>35.3M</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>INDIVIDUAL TWINS</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>35.3M</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>SIMULATION HORIZON</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{timeHorizon} Years</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>MODEL VERSION</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Vitruvia 2.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Presets */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => { setInterventions(Object.fromEntries(policyLevers.map(p => [p.id, p.baseline]))); setActiveScenario('custom'); }}
          className={`nav-btn ${activeScenario === 'custom' && Object.values(interventions).every((v, i) => v === policyLevers[i].baseline) ? 'active' : ''}`}
        >
          Reset to Baseline
        </button>
        <button
          onClick={() => applyScenario('conservative')}
          className={`nav-btn ${activeScenario === 'conservative' ? 'active' : ''}`}
        >
          Conservative Scenario
        </button>
        <button
          onClick={() => applyScenario('aggressive')}
          className={`nav-btn ${activeScenario === 'aggressive' ? 'active' : ''}`}
        >
          Aggressive Transformation
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#6B6B6B' }}>Time Horizon:</span>
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid rgba(139, 115, 85, 0.2)',
              background: '#FFFFFF',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <option value={5}>5 Years (2030)</option>
            <option value={10}>10 Years (2035)</option>
            <option value={15}>15 Years (2040)</option>
            <option value={25}>25 Years (2050)</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Policy Levers Panel */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <span className="card-title">Policy Levers</span>
            <span className="card-badge" style={{ background: 'rgba(139, 115, 85, 0.1)', color: '#8B7355' }}>
              {policyLevers.length} ACTIVE
            </span>
          </div>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            {policyLevers.map(lever => (
              <div key={lever.id} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{lever.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#3D3D3D' }}>{lever.name}</span>
                  </div>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: interventions[lever.id] > lever.baseline ? '#4A7C59' : '#8B7355',
                  }}>
                    {interventions[lever.id]}{lever.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={lever.min}
                  max={lever.max}
                  value={interventions[lever.id]}
                  onChange={(e) => handleSliderChange(lever.id, Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 6,
                    accentColor: '#8B7355',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: '#8B8B8B' }}>{lever.min}{lever.unit}</span>
                  <span style={{ fontSize: 10, color: '#8B8B8B' }}>{lever.description}</span>
                  <span style={{ fontSize: 10, color: '#8B8B8B' }}>{lever.max}{lever.unit}</span>
                </div>
              </div>
            ))}

            {/* Investment Summary */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: effects.totalCost > 0 ? 'rgba(199, 91, 91, 0.05)' : 'rgba(74, 124, 89, 0.05)',
              borderRadius: 12,
              border: `1px solid ${effects.totalCost > 0 ? 'rgba(199, 91, 91, 0.2)' : 'rgba(74, 124, 89, 0.2)'}`,
            }}>
              <div style={{ fontSize: 10, color: '#6B6B6B', textTransform: 'uppercase', marginBottom: 4 }}>
                Annual Investment Required
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: effects.totalCost > 0 ? '#C75B5B' : '#4A7C59',
              }}>
                {effects.totalCost > 0 ? '' : '+'}{effects.totalCost.toFixed(1)} SAR Bn
              </div>
              <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 4 }}>
                {effects.totalCost < 0 ? 'Net revenue from sugar tax' : 'Additional budget allocation'}
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Trajectory Charts */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Population Health Trajectories</span>
              <span className="card-badge live">REAL-TIME SIMULATION</span>
            </div>
            <div className="card-body">
              <TrajectoryChart
                data={diabetesTrajectory}
                title="Diabetes Prevalence"
                inverted={true}
              />
              <TrajectoryChart
                data={lifeExpectancyTrajectory}
                title="Life Expectancy"
                inverted={false}
              />
            </div>
          </div>

          {/* Impact Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ backgroundColor: '#4A7C59' }} />
              <div className="stat-card-label">Healthcare Savings</div>
              <div className="stat-card-value" style={{ color: '#4A7C59' }}>
                {economicImpact.healthcareSavings.toFixed(0)} Bn
              </div>
              <div className="stat-card-subtext">SAR over {timeHorizon} years</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ backgroundColor: '#00A0B0' }} />
              <div className="stat-card-label">Productivity Gains</div>
              <div className="stat-card-value" style={{ color: '#00A0B0' }}>
                {economicImpact.productivityGains.toFixed(0)} Bn
              </div>
              <div className="stat-card-subtext">SAR economic output</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ backgroundColor: '#C4A77D' }} />
              <div className="stat-card-label">QALYs Gained</div>
              <div className="stat-card-value" style={{ color: '#C4A77D' }}>
                {(economicImpact.qalyGains / 1000000).toFixed(1)}M
              </div>
              <div className="stat-card-subtext">Quality-adjusted life years</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" style={{ backgroundColor: economicImpact.roi > 2 ? '#4A7C59' : '#D4A574' }} />
              <div className="stat-card-label">Return on Investment</div>
              <div className="stat-card-value" style={{ color: economicImpact.roi > 2 ? '#4A7C59' : '#D4A574' }}>
                {economicImpact.roi.toFixed(1)}x
              </div>
              <div className="stat-card-subtext">Per SAR invested</div>
            </div>
          </div>

          {/* Individual Twin Connection */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">From Individual to Population</span>
            </div>
            <div className="card-body">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
                textAlign: 'center',
              }}>
                <div>
                  <div style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, #E8E4DC, #D4CFC5)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                  }}>
                    👤
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#3D3D3D', marginBottom: 4 }}>
                    Individual Health Twin
                  </div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5 }}>
                    Personal AI that tracks biomarkers, predicts risks, and recommends interventions
                  </div>
                </div>
                <div>
                  <div style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, #C4A77D, #A08060)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                  }}>
                    👥
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#3D3D3D', marginBottom: 4 }}>
                    Cohort Aggregation
                  </div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5 }}>
                    35.3M individual twins aggregate into provincial and national health models
                  </div>
                </div>
                <div>
                  <div style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, #8B7355, #6B5344)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                  }}>
                    🏛️
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#3D3D3D', marginBottom: 4 }}>
                    Country Health Twin
                  </div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5 }}>
                    Ministry simulates policy → twins respond → trajectories shift in real-time
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div style={{
                marginTop: 24,
                padding: 20,
                background: 'linear-gradient(90deg, #F5F0EB, rgba(196, 167, 125, 0.1))',
                borderRadius: 12,
                borderLeft: '4px solid #8B7355',
              }}>
                <div style={{ fontSize: 14, color: '#3D3D3D', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "When {interventions.screeningCoverage}% of the population receives NCD screening and {interventions.digitalHealth}%
                  have personal health AI assistants, each individual twin updates its risk model. The aggregate effect:
                  <strong style={{ color: '#4A7C59' }}> {Math.abs(effects.diabetesEffect * 100).toFixed(1)}% reduction in diabetes prevalence</strong> and
                  <strong style={{ color: '#4A7C59' }}> {(effects.lifeYearsEffect * baselineStats.lifeExpectancy).toFixed(1)} additional healthy life years</strong> per person by {2025 + timeHorizon}."
                </div>
              </div>
            </div>
          </div>

          {/* Data Sovereignty Section */}
          <DataSovereigntySection />
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        marginTop: 24,
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(139, 115, 85, 0.15)',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#3D3D3D', marginBottom: 4 }}>
            Ready to deploy this scenario?
          </div>
          <div style={{ fontSize: 13, color: '#6B6B6B' }}>
            Export simulation results, generate policy briefs, or connect to provincial planning systems
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(139, 115, 85, 0.3)',
            borderRadius: 8,
            fontSize: 13,
            color: '#8B7355',
            cursor: 'pointer',
          }}>
            Export Report
          </button>
          <button style={{
            padding: '12px 24px',
            background: '#8B7355',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: 'pointer',
          }}>
            Deploy to Vitruvia
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterventionSimulator;
