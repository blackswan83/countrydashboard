// Analytics - Sensitivity analysis, cost-effectiveness, equity, Pareto frontier
// Advanced analysis tools for policy optimization

import React, { useState, useMemo } from 'react';
import { interventions } from '../../data/interventionData';
import { runSensitivityAnalysis, calculateCostEffectiveness } from '../../utils/simulationEngine';
import type { SimulationResult } from '../../utils/simulationEngine';
import type { HealthOutcome } from '../../data/interventionData';
import { getThemeColors, getCostEffectivenessColor as getThemeCostEffColor } from '../../utils/themeColors';

interface AnalyticsProps {
  language: 'en' | 'ar';
  darkMode: boolean;
  interventionValues: Record<string, number>;
  simulationResult: SimulationResult;
  timeHorizon: number;
}

type AnalysisType = 'sensitivity' | 'costEffectiveness' | 'equity' | 'pareto';

// Tornado Chart for Sensitivity Analysis
const TornadoChart: React.FC<{
  data: Record<string, { min: number; max: number; range: number }>;
  outcome: HealthOutcome;
  language: 'en' | 'ar';
}> = ({ data, outcome: _outcome, language }) => {
  void _outcome; // Available for future filtering
  // Sort by range (most impactful first)
  const sorted = Object.entries(data)
    .map(([id, values]) => ({
      id,
      name: interventions.find(i => i.id === id)?.name || id,
      nameAr: interventions.find(i => i.id === id)?.nameAr || id,
      icon: interventions.find(i => i.id === id)?.icon || '📊',
      ...values,
    }))
    .sort((a, b) => b.range - a.range)
    .slice(0, 10); // Top 10 most impactful

  const maxRange = Math.max(...sorted.map(d => Math.max(Math.abs(d.min), Math.abs(d.max))));
  const scale = maxRange > 0 ? 150 / maxRange : 1;

  return (
    <div className="tornado-chart">
      <div className="tornado-header">
        <h4>{language === 'ar' ? 'تحليل الحساسية' : 'Sensitivity Analysis'}</h4>
        <p>{language === 'ar' ? 'ما الذي يهم أكثر؟' : 'What matters most?'}</p>
      </div>

      <div className="tornado-body">
        {sorted.map((item, i) => (
          <div key={item.id} className="tornado-row">
            <div className="tornado-label">
              <span className="tornado-rank">#{i + 1}</span>
              <span className="tornado-icon">{item.icon}</span>
              <span className="tornado-name">{language === 'ar' ? item.nameAr : item.name}</span>
            </div>
            <div className="tornado-bars">
              <div className="tornado-center" />
              {/* Negative bar (improvement for prevalence metrics) */}
              <div
                className="tornado-bar negative"
                style={{ width: `${Math.abs(item.min) * scale}px` }}
              >
                {item.min.toFixed(1)}%
              </div>
              {/* Positive bar */}
              <div
                className="tornado-bar positive"
                style={{ width: `${Math.abs(item.max) * scale}px` }}
              >
                {item.max > 0 ? '+' : ''}{item.max.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tornado-legend">
        <span className="legend-item negative">
          <span className="dot"></span>
          {language === 'ar' ? 'الحد الأدنى' : 'Minimum'}
        </span>
        <span className="legend-item positive">
          <span className="dot"></span>
          {language === 'ar' ? 'الحد الأقصى' : 'Maximum'}
        </span>
      </div>
    </div>
  );
};

// Cost-Effectiveness Ranking
const CostEffectivenessTable: React.FC<{
  data: Record<string, { costPerQaly: number; rank: number }>;
  language: 'en' | 'ar';
  darkMode: boolean;
}> = ({ data, language, darkMode }) => {
  const sorted = Object.entries(data)
    .map(([id, values]) => {
      const intervention = interventions.find(i => i.id === id);
      return {
        id,
        name: intervention?.name || id,
        nameAr: intervention?.nameAr || id,
        icon: intervention?.icon || '📊',
        category: intervention?.category || '',
        ...values,
      };
    })
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 15);

  const getCostEffectivenessColor = (costPerQaly: number) => getThemeCostEffColor(costPerQaly, darkMode);

  return (
    <div className="cost-effectiveness">
      <div className="ce-header">
        <h4>{language === 'ar' ? 'ترتيب فعالية التكلفة' : 'Cost-Effectiveness Ranking'}</h4>
        <p>{language === 'ar' ? 'التكلفة لكل سنة حياة معدلة (QALY)' : 'Cost per Quality-Adjusted Life Year (QALY)'}</p>
      </div>

      <div className="ce-table">
        <div className="ce-row header">
          <span className="ce-rank">#</span>
          <span className="ce-intervention">{language === 'ar' ? 'التدخل' : 'Intervention'}</span>
          <span className="ce-cost">{language === 'ar' ? 'التكلفة/QALY' : 'Cost/QALY'}</span>
          <span className="ce-rating">{language === 'ar' ? 'التقييم' : 'Rating'}</span>
        </div>

        {sorted.map(item => (
          <div key={item.id} className="ce-row">
            <span className="ce-rank">{item.rank}</span>
            <span className="ce-intervention">
              {item.icon} {language === 'ar' ? item.nameAr : item.name}
            </span>
            <span className="ce-cost">
              {item.costPerQaly < Infinity
                ? `${(item.costPerQaly / 1000).toFixed(0)}K ZMW`
                : '∞'}
            </span>
            <span
              className="ce-rating"
              style={{ color: getCostEffectivenessColor(item.costPerQaly) }}
            >
              {item.costPerQaly < 20000 && '★★★★'}
              {item.costPerQaly >= 20000 && item.costPerQaly < 50000 && '★★★'}
              {item.costPerQaly >= 50000 && item.costPerQaly < 100000 && '★★'}
              {item.costPerQaly >= 100000 && '★'}
            </span>
          </div>
        ))}
      </div>

      <div className="ce-legend">
        <span className="ce-threshold">
          {language === 'ar' ? 'Cost-effectiveness threshold:' : 'Cost-effectiveness threshold:'} 2,000 ZMW/QALY
        </span>
      </div>
    </div>
  );
};

// Equity Analysis
const EquityAnalysis: React.FC<{
  simulationResult: SimulationResult;
  language: 'en' | 'ar';
  darkMode: boolean;
}> = ({ simulationResult, language, darkMode }) => {
  const { provincialImpacts } = simulationResult;
  const colors = getThemeColors(darkMode);

  // Calculate variance in outcomes across provinces
  const provinces = Object.keys(provincialImpacts);
  const outcomes: HealthOutcome[] = ['diabetes', 'lifeExpectancy', 'cvd'];

  const calculateVariance = (outcome: HealthOutcome) => {
    const values = provinces.map(p => provincialImpacts[p]?.[outcome] || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const equityMetrics = outcomes.map(outcome => ({
    outcome,
    label: outcome === 'diabetes' ? (language === 'ar' ? 'السكري' : 'Diabetes')
         : outcome === 'lifeExpectancy' ? (language === 'ar' ? 'العمر المتوقع' : 'Life Expectancy')
         : (language === 'ar' ? 'أمراض القلب' : 'CVD'),
    variance: calculateVariance(outcome),
    min: Math.min(...provinces.map(p => provincialImpacts[p]?.[outcome] || 0)),
    max: Math.max(...provinces.map(p => provincialImpacts[p]?.[outcome] || 0)),
  }));

  // Calculate Gini coefficient (simplified)
  const calculateGini = () => {
    const allImpacts = provinces.flatMap(p =>
      outcomes.map(o => Math.abs(provincialImpacts[p]?.[o] || 0))
    );
    const n = allImpacts.length;
    const sorted = [...allImpacts].sort((a, b) => a - b);
    const cumsum = sorted.reduce((acc, val, i) => [...acc, (acc[i] || 0) + val], [] as number[]);
    const totalSum = cumsum[cumsum.length - 1] || 1;
    const gini = 1 - (2 / (n * totalSum)) * cumsum.reduce((a, b, i) => a + b * (n - i), 0) + 1 / n;
    return Math.max(0, Math.min(1, gini));
  };

  const giniCoefficient = calculateGini();

  return (
    <div className="equity-analysis">
      <div className="equity-header">
        <h4>{language === 'ar' ? 'تحليل العدالة' : 'Equity Analysis'}</h4>
        <p>{language === 'ar' ? 'هل الفوائد موزعة بالتساوي؟' : 'Are benefits equally distributed?'}</p>
      </div>

      {/* Gini Coefficient Display */}
      <div className="gini-display">
        <div className="gini-gauge">
          <svg width="120" height="80">
            <path
              d="M 10 70 A 50 50 0 0 1 110 70"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="8"
            />
            <path
              d="M 10 70 A 50 50 0 0 1 110 70"
              fill="none"
              stroke={giniCoefficient < 0.3 ? colors.success : giniCoefficient < 0.5 ? colors.warning : colors.danger}
              strokeWidth="8"
              strokeDasharray={`${(1 - giniCoefficient) * 157} 157`}
            />
            <text x="60" y="55" textAnchor="middle" className="gini-value">
              {giniCoefficient.toFixed(2)}
            </text>
            <text x="60" y="72" textAnchor="middle" className="gini-label">
              {language === 'ar' ? 'جيني' : 'Gini'}
            </text>
          </svg>
        </div>
        <div className="gini-interpretation">
          <strong>
            {giniCoefficient < 0.3
              ? (language === 'ar' ? 'توزيع عادل' : 'Equitable Distribution')
              : giniCoefficient < 0.5
              ? (language === 'ar' ? 'تفاوت معتدل' : 'Moderate Inequality')
              : (language === 'ar' ? 'تفاوت عالٍ' : 'High Inequality')}
          </strong>
          <p>
            {language === 'ar'
              ? '0 = عدالة تامة، 1 = تفاوت تام'
              : '0 = perfect equality, 1 = perfect inequality'}
          </p>
        </div>
      </div>

      {/* Provincial Variance by Outcome */}
      <div className="variance-metrics">
        {equityMetrics.map(metric => (
          <div key={metric.outcome} className="variance-card">
            <span className="variance-label">{metric.label}</span>
            <div className="variance-bar">
              <div
                className="variance-range"
                style={{
                  left: `${50 + metric.min * 2}%`,
                  width: `${(metric.max - metric.min) * 2}%`,
                }}
              />
              <div className="variance-center" />
            </div>
            <div className="variance-values">
              <span className="min-val">{metric.min.toFixed(1)}%</span>
              <span className="max-val">{metric.max.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="equity-recommendations">
        <h5>{language === 'ar' ? 'توصيات لتحسين العدالة' : 'Recommendations for Equity'}</h5>
        <ul>
          <li>
            {language === 'ar'
              ? 'Increase investment in rural provinces (Luapula, Northern, Western)'
              : 'Increase investment in rural provinces (Luapula, Northern, Western)'}
          </li>
          <li>
            {language === 'ar'
              ? 'توسيع برامج التطبيب عن بعد لتحسين الوصول'
              : 'Expand telemedicine programs to improve access'}
          </li>
          <li>
            {language === 'ar'
              ? 'نشر عمال صحة المجتمع في المناطق المحرومة'
              : 'Deploy community health workers in underserved areas'}
          </li>
        </ul>
      </div>
    </div>
  );
};

// Pareto Frontier Visualization
const ParetoFrontier: React.FC<{
  simulationResult: SimulationResult;
  language: 'en' | 'ar';
  darkMode: boolean;
}> = ({ simulationResult, language, darkMode }) => {
  const { economicImpact, outcomeDeltas } = simulationResult;
  const colors = getThemeColors(darkMode);

  // Generate some hypothetical Pareto points for visualization
  const paretoPoints = [
    { cost: 5, health: 15, label: language === 'ar' ? 'محافظ' : 'Conservative' },
    { cost: 10, health: 35, label: language === 'ar' ? 'معتدل' : 'Moderate' },
    { cost: 15, health: 50, label: language === 'ar' ? 'نشط' : 'Active' },
    { cost: 20, health: 58, label: language === 'ar' ? 'طموح' : 'Ambitious' },
    { cost: 30, health: 65, label: language === 'ar' ? 'أقصى' : 'Maximum' },
  ];

  // Current scenario point
  const currentPoint = {
    cost: economicImpact.totalCost,
    health: Math.abs(outcomeDeltas.diabetes) + Math.abs(outcomeDeltas.obesity) + outcomeDeltas.lifeExpectancy,
  };

  const maxCost = 35;
  const maxHealth = 70;

  return (
    <div className="pareto-frontier">
      <div className="pareto-header">
        <h4>{language === 'ar' ? 'الحدود الباريتو' : 'Pareto Frontier'}</h4>
        <p>{language === 'ar' ? 'المقايضات بين التكلفة والنتائج الصحية' : 'Trade-offs between Cost and Health Outcomes'}</p>
      </div>

      <div className="pareto-chart">
        <svg width="400" height="300" viewBox="0 0 400 300">
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line
                x1={50}
                y1={250 - t * 200}
                x2={380}
                y2={250 - t * 200}
                stroke="var(--border-color)"
                strokeDasharray="3,3"
              />
              <text x={45} y={255 - t * 200} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                {(t * maxHealth).toFixed(0)}
              </text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line
                x1={50 + t * 330}
                y1={50}
                x2={50 + t * 330}
                y2={250}
                stroke="var(--border-color)"
                strokeDasharray="3,3"
              />
              <text x={50 + t * 330} y={270} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                {(t * maxCost).toFixed(0)}
              </text>
            </g>
          ))}

          {/* Pareto frontier line */}
          <path
            d={paretoPoints.map((p, i) => {
              const x = 50 + (p.cost / maxCost) * 330;
              const y = 250 - (p.health / maxHealth) * 200;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={colors.success}
            strokeWidth="2"
          />

          {/* Pareto points */}
          {paretoPoints.map((p, i) => {
            const x = 50 + (p.cost / maxCost) * 330;
            const y = 250 - (p.health / maxHealth) * 200;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={6} fill={colors.success} />
                <text x={x} y={y - 12} textAnchor="middle" fontSize="9" fill={colors.textSecondary}>
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Current scenario point */}
          <circle
            cx={50 + (currentPoint.cost / maxCost) * 330}
            cy={250 - (currentPoint.health / maxHealth) * 200}
            r={8}
            fill={colors.danger}
            stroke={colors.bgCard}
            strokeWidth="2"
          />
          <text
            x={50 + (currentPoint.cost / maxCost) * 330}
            y={250 - (currentPoint.health / maxHealth) * 200 - 15}
            textAnchor="middle"
            fontSize="10"
            fill={colors.danger}
            fontWeight="bold"
          >
            {language === 'ar' ? 'أنت هنا' : 'You are here'}
          </text>

          {/* Axis labels */}
          <text x={215} y={295} textAnchor="middle" fontSize="11" fill="var(--text-primary)">
            {language === 'ar' ? 'Cost (ZMW Bn)' : 'Cost (ZMW Bn)'}
          </text>
          <text
            x={15}
            y={150}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-primary)"
            transform="rotate(-90, 15, 150)"
          >
            {language === 'ar' ? 'تأثير صحي (%)' : 'Health Impact (%)'}
          </text>
        </svg>
      </div>

      <div className="pareto-insight">
        <span className="insight-icon">💡</span>
        <span className="insight-text">
          {currentPoint.cost < 12
            ? (language === 'ar' ? 'لديك مجال لزيادة الاستثمار' : 'You have room to increase investment')
            : (language === 'ar' ? 'أنت بالقرب من الحد الأمثل' : 'You are near the optimal frontier')}
        </span>
      </div>
    </div>
  );
};

const Analytics: React.FC<AnalyticsProps> = ({
  language,
  darkMode,
  interventionValues,
  simulationResult,
  timeHorizon,
}) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('sensitivity');
  const [selectedOutcome, setSelectedOutcome] = useState<HealthOutcome>('diabetes');

  // Run sensitivity analysis
  const sensitivityData = useMemo(() => {
    return runSensitivityAnalysis(interventionValues, selectedOutcome, timeHorizon);
  }, [interventionValues, selectedOutcome, timeHorizon]);

  // Run cost-effectiveness analysis
  const costEffectivenessData = useMemo(() => {
    return calculateCostEffectiveness(timeHorizon);
  }, [timeHorizon]);

  const t = {
    title: language === 'ar' ? 'التحليلات المتقدمة' : 'Advanced Analytics',
    subtitle: language === 'ar' ? 'رؤى عميقة لتحسين السياسات' : 'Deep Insights for Policy Optimization',
    sensitivity: language === 'ar' ? 'الحساسية' : 'Sensitivity',
    costEffectiveness: language === 'ar' ? 'فعالية التكلفة' : 'Cost-Effectiveness',
    equity: language === 'ar' ? 'العدالة' : 'Equity',
    pareto: language === 'ar' ? 'باريتو' : 'Pareto',
    selectOutcome: language === 'ar' ? 'اختر النتيجة' : 'Select Outcome',
  };

  const outcomeOptions: { id: HealthOutcome; label: string; labelAr: string }[] = [
    { id: 'diabetes', label: 'Diabetes', labelAr: 'السكري' },
    { id: 'obesity', label: 'Obesity', labelAr: 'السمنة' },
    { id: 'cvd', label: 'CVD', labelAr: 'أمراض القلب' },
    { id: 'lifeExpectancy', label: 'Life Expectancy', labelAr: 'متوسط العمر' },
  ];

  return (
    <div className="analytics-tab">
      {/* Header */}
      <div className="analytics-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      {/* Analysis Type Selector */}
      <div className="analysis-selector">
        {(['sensitivity', 'costEffectiveness', 'equity', 'pareto'] as AnalysisType[]).map(type => (
          <button
            key={type}
            className={`analysis-btn ${analysisType === type ? 'active' : ''}`}
            onClick={() => setAnalysisType(type)}
          >
            {type === 'sensitivity' && '📊'}
            {type === 'costEffectiveness' && '💰'}
            {type === 'equity' && '⚖️'}
            {type === 'pareto' && '📈'}
            <span>{t[type]}</span>
          </button>
        ))}
      </div>

      {/* Analysis Content */}
      <div className="analysis-content">
        {analysisType === 'sensitivity' && (
          <>
            <div className="outcome-selector">
              <span>{t.selectOutcome}:</span>
              {outcomeOptions.map(opt => (
                <button
                  key={opt.id}
                  className={`outcome-btn ${selectedOutcome === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedOutcome(opt.id)}
                >
                  {language === 'ar' ? opt.labelAr : opt.label}
                </button>
              ))}
            </div>
            <TornadoChart data={sensitivityData} outcome={selectedOutcome} language={language} />
          </>
        )}

        {analysisType === 'costEffectiveness' && (
          <CostEffectivenessTable data={costEffectivenessData} language={language} darkMode={darkMode} />
        )}

        {analysisType === 'equity' && (
          <EquityAnalysis simulationResult={simulationResult} language={language} darkMode={darkMode} />
        )}

        {analysisType === 'pareto' && (
          <ParetoFrontier simulationResult={simulationResult} language={language} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default Analytics;
