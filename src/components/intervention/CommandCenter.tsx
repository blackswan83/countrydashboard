// Command Center - Executive overview tab
// Budget gauge, key metrics, impact map, quick controls

import React from 'react';
import { interventions, baselineStats } from '../../data/interventionData';
import type { SimulationResult } from '../../utils/simulationEngine';

interface CommandCenterProps {
  language: 'en' | 'ar';
  darkMode: boolean;
  interventionValues: Record<string, number>;
  simulationResult: SimulationResult;
  timeHorizon: number;
  budget: number;
  budgetUsage: number;
  onInterventionChange: (id: string, value: number) => void;
}

// Budget Gauge Component
const BudgetGauge: React.FC<{ used: number; total: number; language: 'en' | 'ar' }> = ({ used, total, language }) => {
  const percentage = Math.min(100, (used / total) * 100);
  const isOver = used > total;
  const isWarning = percentage > 85 && !isOver;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const color = isOver ? '#EF4444' : isWarning ? '#F59E0B' : '#4A7C59';

  return (
    <div className="budget-gauge">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="12"
        />
        {/* Progress arc */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Center text */}
        <text
          x="90"
          y="80"
          textAnchor="middle"
          className="gauge-value"
          style={{ fill: color, fontSize: '28px', fontWeight: 700 }}
        >
          {used.toFixed(1)}
        </text>
        <text
          x="90"
          y="100"
          textAnchor="middle"
          className="gauge-unit"
          style={{ fill: 'var(--text-secondary)', fontSize: '12px' }}
        >
          {language === 'ar' ? 'مليار ريال' : 'SAR Bn'}
        </text>
        <text
          x="90"
          y="120"
          textAnchor="middle"
          className="gauge-label"
          style={{ fill: 'var(--text-muted)', fontSize: '11px' }}
        >
          {language === 'ar' ? `من ${total}` : `of ${total}`}
        </text>
      </svg>
      {isOver && (
        <div className="gauge-warning">
          ⚠️ {language === 'ar' ? 'تجاوز الميزانية' : 'Over Budget'}
        </div>
      )}
    </div>
  );
};

// Key Metric Card with sparkline
const MetricCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  delta: number;
  isPositive: boolean;
  color: string;
  trajectory: { year: number; intervention: number }[];
}> = ({ title, value, unit, delta, isPositive, color, trajectory }) => {
  // Simple sparkline
  const sparklinePoints = trajectory.slice(0, 8).map((point, i) => {
    const values = trajectory.map(p => p.intervention);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const x = (i / 7) * 60;
    const y = 20 - ((point.intervention - min) / range) * 18;
    return `${x},${y}`;
  }).join(' ');

  const deltaColor = (isPositive && delta > 0) || (!isPositive && delta < 0) ? '#4A7C59' : '#EF4444';
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <svg width="64" height="24" className="sparkline">
          <polyline
            points={sparklinePoints}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="metric-value">
        {value.toFixed(1)}<span className="metric-unit">{unit}</span>
      </div>
      <div className="metric-delta" style={{ color: deltaColor }}>
        {deltaSign}{delta.toFixed(1)}%
        <span className="delta-label">{delta !== 0 ? (delta > 0 ? '↑' : '↓') : '→'}</span>
      </div>
    </div>
  );
};

// Quick Lever Component
const QuickLever: React.FC<{
  intervention: typeof interventions[0];
  value: number;
  onChange: (value: number) => void;
  language: 'en' | 'ar';
}> = ({ intervention, value, onChange, language }) => {
  const isChanged = value !== intervention.baseline;

  return (
    <div className={`quick-lever ${isChanged ? 'changed' : ''}`}>
      <div className="lever-header">
        <span className="lever-icon">{intervention.icon}</span>
        <span className="lever-name">{language === 'ar' ? intervention.nameAr : intervention.name}</span>
        <span className="lever-value" style={{ color: isChanged ? '#4A7C59' : 'var(--text-secondary)' }}>
          {value}{intervention.unit}
        </span>
      </div>
      <input
        type="range"
        min={intervention.min}
        max={intervention.max}
        step={intervention.step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="lever-slider"
      />
    </div>
  );
};

const CommandCenter: React.FC<CommandCenterProps> = ({
  language,
  darkMode: _darkMode,
  interventionValues,
  simulationResult,
  timeHorizon,
  budget,
  budgetUsage,
  onInterventionChange,
}) => {
  void _darkMode; // Reserved for dark mode styling
  const t = {
    overview: language === 'ar' ? 'نظرة عامة' : 'Overview',
    keyOutcomes: language === 'ar' ? 'النتائج الرئيسية' : 'Key Outcomes',
    quickLevers: language === 'ar' ? 'الرافعات السريعة' : 'Quick Levers',
    budgetAllocation: language === 'ar' ? 'تخصيص الميزانية' : 'Budget Allocation',
    activeSynergies: language === 'ar' ? 'التآزرات النشطة' : 'Active Synergies',
    diabetesReduction: language === 'ar' ? 'انخفاض السكري' : 'Diabetes Reduction',
    lifeExpectancy: language === 'ar' ? 'متوسط العمر' : 'Life Expectancy',
    healthcareSavings: language === 'ar' ? 'وفورات الرعاية' : 'Healthcare Savings',
    roi: language === 'ar' ? 'العائد على الاستثمار' : 'Return on Investment',
    projectedTo: language === 'ar' ? 'متوقع حتى' : 'Projected to',
    noSynergies: language === 'ar' ? 'لا توجد تآزرات نشطة - قم بتفعيل تدخلات متكاملة' : 'No active synergies - activate complementary interventions',
  };

  // Quick levers - top 6 most impactful
  const quickLeverIds = ['ncdScreening', 'primaryCare', 'digitalHealthTwin', 'physicalActivity', 'sugarTax', 'chronicDiseaseManagement'];
  const quickLevers = quickLeverIds.map(id => interventions.find(i => i.id === id)!).filter(Boolean);

  const { trajectories, economicImpact, activeSynergies, outcomeDeltas } = simulationResult;

  return (
    <div className="command-center">
      {/* Top Section: Budget + Key Metrics */}
      <div className="command-top">
        {/* Budget Gauge */}
        <div className="budget-section">
          <h3>{t.budgetAllocation}</h3>
          <BudgetGauge used={budgetUsage} total={budget} language={language} />
          <div className="budget-details">
            <div className="budget-stat">
              <span className="stat-label">{t.healthcareSavings}</span>
              <span className="stat-value positive">+{economicImpact.healthcareSavings.toFixed(1)} Bn</span>
            </div>
            <div className="budget-stat">
              <span className="stat-label">{t.roi}</span>
              <span className={`stat-value ${economicImpact.roi > 0 ? 'positive' : 'negative'}`}>
                {economicImpact.roi > 0 ? '+' : ''}{economicImpact.roi}%
              </span>
            </div>
          </div>
        </div>

        {/* Key Outcome Cards */}
        <div className="metrics-section">
          <h3>{t.keyOutcomes} <span className="time-label">{t.projectedTo} {2025 + timeHorizon}</span></h3>
          <div className="metrics-grid">
            <MetricCard
              title={t.diabetesReduction}
              value={trajectories.diabetes[trajectories.diabetes.length - 1]?.intervention ?? baselineStats.diabetesPrevalence}
              unit="%"
              delta={outcomeDeltas.diabetes}
              isPositive={false}
              color="#EF4444"
              trajectory={trajectories.diabetes}
            />
            <MetricCard
              title={t.lifeExpectancy}
              value={trajectories.lifeExpectancy[trajectories.lifeExpectancy.length - 1]?.intervention ?? baselineStats.lifeExpectancy}
              unit=" yrs"
              delta={outcomeDeltas.lifeExpectancy}
              isPositive={true}
              color="#4A7C59"
              trajectory={trajectories.lifeExpectancy}
            />
            <MetricCard
              title={language === 'ar' ? 'السمنة' : 'Obesity Rate'}
              value={trajectories.obesity[trajectories.obesity.length - 1]?.intervention ?? baselineStats.obesityRate}
              unit="%"
              delta={outcomeDeltas.obesity}
              isPositive={false}
              color="#F59E0B"
              trajectory={trajectories.obesity}
            />
            <MetricCard
              title={language === 'ar' ? 'أمراض القلب' : 'CVD Prevalence'}
              value={trajectories.cvd[trajectories.cvd.length - 1]?.intervention ?? baselineStats.cvdPrevalence}
              unit="%"
              delta={outcomeDeltas.cvd}
              isPositive={false}
              color="#8B7355"
              trajectory={trajectories.cvd}
            />
          </div>
        </div>
      </div>

      {/* Middle Section: Quick Levers + Synergies */}
      <div className="command-middle">
        {/* Quick Levers */}
        <div className="quick-levers-section">
          <h3>{t.quickLevers}</h3>
          <div className="quick-levers-grid">
            {quickLevers.map(intervention => (
              <QuickLever
                key={intervention.id}
                intervention={intervention}
                value={interventionValues[intervention.id] ?? intervention.baseline}
                onChange={value => onInterventionChange(intervention.id, value)}
                language={language}
              />
            ))}
          </div>
        </div>

        {/* Active Synergies */}
        <div className="synergies-section">
          <h3>{t.activeSynergies}</h3>
          {activeSynergies.length > 0 ? (
            <div className="synergies-list">
              {activeSynergies.map((synergy, i) => {
                const int1 = interventions.find(x => x.id === synergy.interventions[0]);
                const int2 = interventions.find(x => x.id === synergy.interventions[1]);
                return (
                  <div key={i} className="synergy-item">
                    <div className="synergy-icons">
                      <span>{int1?.icon}</span>
                      <span className="synergy-plus">+</span>
                      <span>{int2?.icon}</span>
                    </div>
                    <div className="synergy-details">
                      <div className="synergy-names">
                        {language === 'ar' ? int1?.nameAr : int1?.name} + {language === 'ar' ? int2?.nameAr : int2?.name}
                      </div>
                      <div className="synergy-boost">
                        ✨ {Math.round((synergy.multiplier - 1) * 100)}% {language === 'ar' ? 'تعزيز' : 'boost'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-synergies">
              <span className="no-synergy-icon">💡</span>
              <p>{t.noSynergies}</p>
            </div>
          )}
        </div>
      </div>

      {/* Economic Summary */}
      <div className="command-bottom">
        <div className="economic-summary">
          <div className="econ-card">
            <span className="econ-icon">💰</span>
            <div className="econ-content">
              <span className="econ-label">{t.healthcareSavings}</span>
              <span className="econ-value">{economicImpact.healthcareSavings.toFixed(1)} <small>SAR Bn</small></span>
            </div>
          </div>
          <div className="econ-card">
            <span className="econ-icon">📈</span>
            <div className="econ-content">
              <span className="econ-label">{language === 'ar' ? 'مكاسب الإنتاجية' : 'Productivity Gains'}</span>
              <span className="econ-value">{economicImpact.productivityGains.toFixed(1)} <small>SAR Bn</small></span>
            </div>
          </div>
          <div className="econ-card">
            <span className="econ-icon">❤️</span>
            <div className="econ-content">
              <span className="econ-label">{language === 'ar' ? 'سنوات حياة معدلة' : 'QALYs Gained'}</span>
              <span className="econ-value">{(economicImpact.qalyGained / 1000000).toFixed(2)} <small>M</small></span>
            </div>
          </div>
          <div className="econ-card highlight">
            <span className="econ-icon">🎯</span>
            <div className="econ-content">
              <span className="econ-label">{language === 'ar' ? 'صافي الفائدة' : 'Net Benefit'}</span>
              <span className={`econ-value ${economicImpact.netBenefit > 0 ? 'positive' : 'negative'}`}>
                {economicImpact.netBenefit > 0 ? '+' : ''}{economicImpact.netBenefit.toFixed(1)} <small>SAR Bn</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
