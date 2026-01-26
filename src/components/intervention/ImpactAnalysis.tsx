// Impact Analysis - Trajectory charts, Sankey diagrams, population pyramids
// Geographic drill-down, demographic views

import React, { useState } from 'react';
// baselineStats available if needed for future enhancements
import type { SimulationResult, ProjectedOutcome } from '../../utils/simulationEngine';
import type { HealthOutcome } from '../../data/interventionData';

interface ImpactAnalysisProps {
  language: 'en' | 'ar';
  darkMode: boolean;
  simulationResult: SimulationResult;
  timeHorizon: number;
}

type ViewMode = 'national' | 'provincial' | 'demographic';

// Enhanced Trajectory Chart with confidence bands
const TrajectoryChart: React.FC<{
  data: ProjectedOutcome[];
  title: string;
  unit: string;
  isPositiveMetric: boolean;
  color: string;
  language: 'en' | 'ar';
}> = ({ data, title, unit, isPositiveMetric, color, language }) => {
  const width = 400;
  const height = 200;
  const padding = { top: 20, right: 60, bottom: 35, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (data.length === 0) return null;

  // Calculate scales
  const years = data.map(d => d.year);
  const allValues = data.flatMap(d => [d.baseline, d.intervention, d.superAger, d.lowerBound, d.upperBound]);
  const minVal = Math.min(...allValues) * 0.95;
  const maxVal = Math.max(...allValues) * 1.05;

  const xScale = (year: number) => padding.left + ((year - years[0]) / (years[years.length - 1] - years[0])) * chartWidth;
  const yScale = (value: number) => padding.top + (1 - (value - minVal) / (maxVal - minVal)) * chartHeight;

  // Generate path strings
  const baselinePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.baseline)}`).join(' ');
  const interventionPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.intervention)}`).join(' ');
  const superAgerPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.superAger)}`).join(' ');

  // Confidence band area
  const confidenceArea = [
    ...data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.upperBound)}`),
    ...data.slice().reverse().map((d) => `L ${xScale(d.year)} ${yScale(d.lowerBound)}`),
    'Z'
  ].join(' ');

  // Calculate improvement
  const startVal = data[0].baseline;
  const endInterv = data[data.length - 1].intervention;
  const endBase = data[data.length - 1].baseline;
  const improvement = ((endInterv - endBase) / Math.abs(startVal)) * 100;
  const improvementColor = (isPositiveMetric && improvement > 0) || (!isPositiveMetric && improvement < 0) ? '#4A7C59' : '#EF4444';

  return (
    <div className="trajectory-chart">
      <div className="chart-header">
        <h4>{title}</h4>
        <div className="improvement-badge" style={{ backgroundColor: improvementColor }}>
          {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
        </div>
      </div>
      <svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padding.top + t * chartHeight;
          const value = maxVal - t * (maxVal - minVal);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--border-color)" strokeDasharray="3,3" />
              <text x={padding.left - 5} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Confidence band */}
        <path d={confidenceArea} fill={color} opacity={0.15} />

        {/* Baseline path */}
        <path d={baselinePath} fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />

        {/* Super-ager path */}
        <path d={superAgerPath} fill="none" stroke="#C4A77D" strokeWidth="2" strokeDasharray="3,3" />

        {/* Intervention path */}
        <path d={interventionPath} fill="none" stroke={color} strokeWidth="3" />

        {/* End labels */}
        <text x={width - padding.right + 5} y={yScale(data[data.length - 1].baseline)} fontSize="9" fill="#EF4444">
          {language === 'ar' ? 'أساس' : 'Base'}
        </text>
        <text x={width - padding.right + 5} y={yScale(data[data.length - 1].intervention)} fontSize="9" fill={color}>
          {language === 'ar' ? 'تدخل' : 'Interv.'}
        </text>
        <text x={width - padding.right + 5} y={yScale(data[data.length - 1].superAger)} fontSize="9" fill="#C4A77D">
          {language === 'ar' ? 'مثالي' : 'Optimal'}
        </text>

        {/* Year labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((d, i) => (
          <text key={i} x={xScale(d.year)} y={height - 10} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            {d.year}
          </text>
        ))}

        {/* Axis labels */}
        <text x={width / 2} y={height - 2} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
          {language === 'ar' ? 'السنة' : 'Year'}
        </text>
        <text x={12} y={height / 2} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" transform={`rotate(-90, 12, ${height / 2})`}>
          {unit}
        </text>
      </svg>
    </div>
  );
};

// Sankey Diagram showing intervention to outcome flows
const SankeyDiagram: React.FC<{
  simulationResult: SimulationResult;
  language: 'en' | 'ar';
}> = ({ simulationResult, language }) => {
  const { outcomeDeltas, activeSynergies } = simulationResult;

  // Simplified Sankey visualization
  const interventionGroups = [
    { id: 'prevention', label: language === 'ar' ? 'الوقاية' : 'Prevention', color: '#4A7C59' },
    { id: 'screening', label: language === 'ar' ? 'الفحص' : 'Screening', color: '#00A0B0' },
    { id: 'treatment', label: language === 'ar' ? 'العلاج' : 'Treatment', color: '#8B7355' },
    { id: 'digital', label: language === 'ar' ? 'رقمي' : 'Digital', color: '#10B981' },
  ];

  const outcomes = [
    { id: 'diabetes', label: language === 'ar' ? 'السكري' : 'Diabetes', value: outcomeDeltas.diabetes, color: '#EF4444' },
    { id: 'obesity', label: language === 'ar' ? 'السمنة' : 'Obesity', value: outcomeDeltas.obesity, color: '#F59E0B' },
    { id: 'cvd', label: language === 'ar' ? 'القلب' : 'CVD', value: outcomeDeltas.cvd, color: '#8B7355' },
    { id: 'lifeExpectancy', label: language === 'ar' ? 'العمر' : 'Life Exp', value: outcomeDeltas.lifeExpectancy, color: '#4A7C59' },
  ];

  return (
    <div className="sankey-diagram">
      <h4>{language === 'ar' ? 'تدفق التأثير' : 'Impact Flow'}</h4>
      <div className="sankey-container">
        {/* Left: Intervention groups */}
        <div className="sankey-left">
          {interventionGroups.map(group => (
            <div key={group.id} className="sankey-node" style={{ borderColor: group.color }}>
              {group.label}
            </div>
          ))}
        </div>

        {/* Middle: Flow lines (simplified) */}
        <div className="sankey-middle">
          <svg width="100" height="200">
            {interventionGroups.map((group, gi) =>
              outcomes.map((outcome, oi) => {
                const y1 = 25 + gi * 45;
                const y2 = 25 + oi * 45;
                const opacity = Math.abs(outcome.value) / 20;
                return (
                  <path
                    key={`${group.id}-${outcome.id}`}
                    d={`M 0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`}
                    fill="none"
                    stroke={group.color}
                    strokeWidth={Math.max(1, Math.abs(outcome.value) / 5)}
                    opacity={Math.max(0.1, opacity)}
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* Right: Outcomes */}
        <div className="sankey-right">
          {outcomes.map(outcome => (
            <div
              key={outcome.id}
              className="sankey-node outcome"
              style={{ borderColor: outcome.color }}
            >
              <span className="outcome-label">{outcome.label}</span>
              <span className="outcome-value" style={{ color: outcome.value < 0 ? '#4A7C59' : '#EF4444' }}>
                {outcome.value > 0 ? '+' : ''}{outcome.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active synergies indicator */}
      {activeSynergies.length > 0 && (
        <div className="sankey-synergies">
          ✨ {activeSynergies.length} {language === 'ar' ? 'تآزر نشط يعزز التأثير' : 'active synergies boosting impact'}
        </div>
      )}
    </div>
  );
};

// Population Pyramid Comparison
const PopulationPyramidComparison: React.FC<{
  simulationResult: SimulationResult;
  language: 'en' | 'ar';
}> = ({ simulationResult, language }) => {
  const { outcomeDeltas } = simulationResult;

  // Simplified age groups for visualization
  const ageGroups = [
    { label: '0-14', baseline: { healthy: 85, atRisk: 12, ncd: 3 } },
    { label: '15-29', baseline: { healthy: 78, atRisk: 17, ncd: 5 } },
    { label: '30-44', baseline: { healthy: 70, atRisk: 20, ncd: 10 } },
    { label: '45-59', baseline: { healthy: 55, atRisk: 25, ncd: 20 } },
    { label: '60-74', baseline: { healthy: 40, atRisk: 30, ncd: 30 } },
    { label: '75+', baseline: { healthy: 30, atRisk: 30, ncd: 40 } },
  ];

  // Calculate intervention effect on each group
  const getInterventionDistribution = (baseline: { healthy: number; atRisk: number; ncd: number }) => {
    const effect = Math.abs(outcomeDeltas.diabetes + outcomeDeltas.obesity) / 200;
    return {
      healthy: Math.min(100, baseline.healthy * (1 + effect)),
      atRisk: baseline.atRisk * (1 - effect * 0.5),
      ncd: baseline.ncd * (1 - effect * 0.7),
    };
  };

  return (
    <div className="pyramid-comparison">
      <h4>{language === 'ar' ? 'التوزيع الصحي حسب العمر' : 'Health Distribution by Age'}</h4>
      <div className="pyramid-legend">
        <span className="legend-item"><span className="dot healthy"></span> {language === 'ar' ? 'صحي' : 'Healthy'}</span>
        <span className="legend-item"><span className="dot at-risk"></span> {language === 'ar' ? 'معرض للخطر' : 'At Risk'}</span>
        <span className="legend-item"><span className="dot ncd"></span> {language === 'ar' ? 'أمراض مزمنة' : 'NCD'}</span>
      </div>
      <div className="pyramid-container">
        {/* Baseline side */}
        <div className="pyramid-side baseline">
          <div className="pyramid-label">{language === 'ar' ? 'خط الأساس' : 'Baseline'}</div>
          {ageGroups.map((group, i) => (
            <div key={i} className="pyramid-row">
              <div className="pyramid-bar">
                <div className="segment healthy" style={{ width: `${group.baseline.healthy}%` }} />
                <div className="segment at-risk" style={{ width: `${group.baseline.atRisk}%` }} />
                <div className="segment ncd" style={{ width: `${group.baseline.ncd}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Age labels */}
        <div className="pyramid-ages">
          {ageGroups.map((group, i) => (
            <div key={i} className="age-label">{group.label}</div>
          ))}
        </div>

        {/* Intervention side */}
        <div className="pyramid-side intervention">
          <div className="pyramid-label">{language === 'ar' ? 'بعد التدخل' : 'With Intervention'}</div>
          {ageGroups.map((group, i) => {
            const interv = getInterventionDistribution(group.baseline);
            return (
              <div key={i} className="pyramid-row">
                <div className="pyramid-bar">
                  <div className="segment healthy" style={{ width: `${interv.healthy}%` }} />
                  <div className="segment at-risk" style={{ width: `${interv.atRisk}%` }} />
                  <div className="segment ncd" style={{ width: `${interv.ncd}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Provincial Impact Heatmap
const ProvincialHeatmap: React.FC<{
  simulationResult: SimulationResult;
  outcome: HealthOutcome;
  language: 'en' | 'ar';
}> = ({ simulationResult, outcome, language }) => {
  const { provincialImpacts } = simulationResult;

  const provinces = [
    { id: 'riyadh', name: 'Riyadh', nameAr: 'الرياض' },
    { id: 'makkah', name: 'Makkah', nameAr: 'مكة' },
    { id: 'eastern', name: 'Eastern', nameAr: 'الشرقية' },
    { id: 'madinah', name: 'Madinah', nameAr: 'المدينة' },
    { id: 'asir', name: 'Asir', nameAr: 'عسير' },
    { id: 'jazan', name: 'Jazan', nameAr: 'جازان' },
    { id: 'qassim', name: 'Qassim', nameAr: 'القصيم' },
    { id: 'tabuk', name: 'Tabuk', nameAr: 'تبوك' },
    { id: 'hail', name: 'Hail', nameAr: 'حائل' },
    { id: 'najran', name: 'Najran', nameAr: 'نجران' },
    { id: 'aljawf', name: 'Al-Jawf', nameAr: 'الجوف' },
    { id: 'northernBorders', name: 'N. Borders', nameAr: 'الحدود' },
    { id: 'albahah', name: 'Al-Bahah', nameAr: 'الباحة' },
  ];

  // Get color based on impact value
  const getColor = (value: number) => {
    const isPositive = ['lifeExpectancy', 'healthyLifeYears', 'productivity'].includes(outcome);
    const isGood = isPositive ? value > 0 : value < 0;

    const intensity = Math.min(1, Math.abs(value) / 20);
    if (isGood) {
      return `rgba(74, 124, 89, ${intensity})`; // Green
    }
    return `rgba(239, 68, 68, ${intensity})`; // Red
  };

  return (
    <div className="provincial-heatmap">
      <h4>{language === 'ar' ? 'الأثر حسب المنطقة' : 'Impact by Province'}</h4>
      <div className="heatmap-grid">
        {provinces.map(province => {
          const impact = provincialImpacts[province.id]?.[outcome] ?? 0;
          return (
            <div
              key={province.id}
              className="heatmap-cell"
              style={{ backgroundColor: getColor(impact) }}
            >
              <span className="cell-name">{language === 'ar' ? province.nameAr : province.name}</span>
              <span className="cell-value">{impact > 0 ? '+' : ''}{impact.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({
  language,
  darkMode: _darkMode,
  simulationResult,
  timeHorizon: _timeHorizon,
}) => {
  void _darkMode; // Reserved for dark mode styling
  void _timeHorizon; // Available for time-based filtering

  const [viewMode, setViewMode] = useState<ViewMode>('national');
  const [selectedOutcome, setSelectedOutcome] = useState<HealthOutcome>('diabetes');

  const { trajectories } = simulationResult;

  const t = {
    title: language === 'ar' ? 'تحليل الأثر' : 'Impact Analysis',
    national: language === 'ar' ? 'وطني' : 'National',
    provincial: language === 'ar' ? 'إقليمي' : 'By Province',
    demographic: language === 'ar' ? 'ديموغرافي' : 'By Demographic',
    trajectories: language === 'ar' ? 'المسارات' : 'Trajectories',
    flowDiagram: language === 'ar' ? 'مخطط التدفق' : 'Flow Diagram',
    populationHealth: language === 'ar' ? 'صحة السكان' : 'Population Health',
    selectOutcome: language === 'ar' ? 'اختر النتيجة' : 'Select Outcome',
  };

  const outcomeOptions: { id: HealthOutcome; label: string; labelAr: string }[] = [
    { id: 'diabetes', label: 'Diabetes', labelAr: 'السكري' },
    { id: 'obesity', label: 'Obesity', labelAr: 'السمنة' },
    { id: 'cvd', label: 'CVD', labelAr: 'أمراض القلب' },
    { id: 'lifeExpectancy', label: 'Life Expectancy', labelAr: 'متوسط العمر' },
  ];

  return (
    <div className="impact-analysis">
      {/* Header with view toggles */}
      <div className="analysis-header">
        <h2>{t.title}</h2>
        <div className="view-toggles">
          {(['national', 'provincial', 'demographic'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              className={`view-toggle ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {t[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* National View */}
      {viewMode === 'national' && (
        <>
          {/* Trajectory Charts Grid */}
          <div className="section">
            <h3>{t.trajectories}</h3>
            <div className="charts-grid">
              <TrajectoryChart
                data={trajectories.diabetes}
                title={language === 'ar' ? 'انتشار السكري' : 'Diabetes Prevalence'}
                unit="%"
                isPositiveMetric={false}
                color="#EF4444"
                language={language}
              />
              <TrajectoryChart
                data={trajectories.lifeExpectancy}
                title={language === 'ar' ? 'متوسط العمر المتوقع' : 'Life Expectancy'}
                unit={language === 'ar' ? 'سنوات' : 'years'}
                isPositiveMetric={true}
                color="#4A7C59"
                language={language}
              />
              <TrajectoryChart
                data={trajectories.obesity}
                title={language === 'ar' ? 'معدل السمنة' : 'Obesity Rate'}
                unit="%"
                isPositiveMetric={false}
                color="#F59E0B"
                language={language}
              />
              <TrajectoryChart
                data={trajectories.cvd}
                title={language === 'ar' ? 'انتشار أمراض القلب' : 'CVD Prevalence'}
                unit="%"
                isPositiveMetric={false}
                color="#8B7355"
                language={language}
              />
            </div>
          </div>

          {/* Sankey Diagram */}
          <div className="section">
            <h3>{t.flowDiagram}</h3>
            <SankeyDiagram simulationResult={simulationResult} language={language} />
          </div>

          {/* Population Pyramid */}
          <div className="section">
            <h3>{t.populationHealth}</h3>
            <PopulationPyramidComparison simulationResult={simulationResult} language={language} />
          </div>
        </>
      )}

      {/* Provincial View */}
      {viewMode === 'provincial' && (
        <div className="provincial-view">
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
          <ProvincialHeatmap
            simulationResult={simulationResult}
            outcome={selectedOutcome}
            language={language}
          />
        </div>
      )}

      {/* Demographic View */}
      {viewMode === 'demographic' && (
        <div className="demographic-view">
          <PopulationPyramidComparison simulationResult={simulationResult} language={language} />
          <div className="demographic-insight">
            <h4>{language === 'ar' ? 'رؤى ديموغرافية' : 'Demographic Insights'}</h4>
            <ul>
              <li>{language === 'ar' ? 'الفئات العمرية 45-59 تستفيد أكثر من فحص الأمراض' : 'Age groups 45-59 benefit most from NCD screening'}</li>
              <li>{language === 'ar' ? 'برامج الشباب (10-19) لها أعلى تأثير طويل المدى' : 'Youth programs (10-19) have highest long-term impact'}</li>
              <li>{language === 'ar' ? 'الرعاية الرقمية فعالة بشكل خاص للفئة 30-59' : 'Digital health particularly effective for ages 30-59'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysis;
