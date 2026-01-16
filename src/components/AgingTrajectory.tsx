import { useState } from 'react';

// Domain data for aging trajectories
const generateCurve = (startValue: number, endValue: number, curveType: string) => {
  const points: { age: number; value: number }[] = [];
  for (let age = 30; age <= 100; age += 5) {
    const t = (age - 30) / 70;
    let value;

    if (curveType === 'exponential') {
      // Steeper decline for population
      value = startValue - (startValue - endValue) * Math.pow(t, 1.5);
    } else if (curveType === 'superager') {
      // Flatter curve for super agers
      value = startValue - (startValue - endValue) * Math.pow(t, 0.7);
    } else {
      value = startValue - (startValue - endValue) * t;
    }

    points.push({ age, value: Math.max(0, Math.min(100, value)) });
  }
  return points;
};

interface Domain {
  name: string;
  icon: string;
  description: string;
  population: { age: number; value: number }[];
  superager: { age: number; value: number }[];
  unit: string;
}

const domains: Record<string, Domain> = {
  cardiovascular: {
    name: 'Cardiovascular Function',
    icon: '❤️',
    description: 'Vascular stiffness, cardiac output, blood pressure regulation',
    population: generateCurve(95, 35, 'exponential'),
    superager: generateCurve(95, 75, 'superager'),
    unit: 'Function Index',
  },
  metabolic: {
    name: 'Metabolic Health',
    icon: '🔥',
    description: 'Glucose regulation, insulin sensitivity, lipid metabolism',
    population: generateCurve(92, 40, 'exponential'),
    superager: generateCurve(92, 72, 'superager'),
    unit: 'Metabolic Score',
  },
  inflammatory: {
    name: 'Inflammatory Markers',
    icon: '🛡️',
    description: 'hsCRP, IL-6, GDF-15, immune function',
    population: generateCurve(90, 30, 'exponential'),
    superager: generateCurve(90, 68, 'superager'),
    unit: 'Anti-inflammatory Index',
  },
  functional: {
    name: 'Physical Function',
    icon: '💪',
    description: 'Grip strength, gait speed, muscle mass, balance',
    population: generateCurve(95, 25, 'exponential'),
    superager: generateCurve(95, 70, 'superager'),
    unit: 'Functional Capacity',
  },
};

interface TrajectoryChartProps {
  domain: string;
  showGap: boolean;
  selectedAge: number;
}

const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ domain, showGap, selectedAge }) => {
  const { population, superager, unit } = domains[domain];

  const width = 600;
  const height = 320;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xScale = (age: number) => padding.left + ((age - 30) / 70) * chartWidth;
  const yScale = (value: number) => padding.top + (1 - value / 100) * chartHeight;

  const createPath = (points: { age: number; value: number }[]) => {
    return points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(p.age)} ${yScale(p.value)}`
    ).join(' ');
  };

  const createGapArea = () => {
    const topPath = superager.map(p => `${xScale(p.age)},${yScale(p.value)}`).join(' ');
    const bottomPath = [...population].reverse().map(p => `${xScale(p.age)},${yScale(p.value)}`).join(' ');
    return `M ${topPath} L ${bottomPath} Z`;
  };

  const popValue = population.find(p => p.age === selectedAge)?.value || 0;
  const saValue = superager.find(p => p.age === selectedAge)?.value || 0;
  const gap = saValue - popValue;

  return (
    <svg width={width} height={height} style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
      {/* Background */}
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight}
            fill="#F5F0EB" rx="8" />

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line
            x1={padding.left} y1={yScale(v)}
            x2={width - padding.right} y2={yScale(v)}
            stroke="rgba(139, 115, 85, 0.15)" strokeDasharray="3,6"
          />
          <text x={padding.left - 10} y={yScale(v) + 4}
                fill="#8B8B8B" fontSize="11" textAnchor="end">
            {v}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {[30, 45, 60, 75, 90, 100].map(age => (
        <text key={age} x={xScale(age)} y={height - 15}
              fill="#8B8B8B" fontSize="11" textAnchor="middle">
          {age}
        </text>
      ))}

      {/* Gap area */}
      {showGap && (
        <path d={createGapArea()} fill="#4A7C59" opacity="0.15" />
      )}

      {/* Population curve */}
      <path
        d={createPath(population)}
        fill="none"
        stroke="#C75B5B"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Super ager curve */}
      <path
        d={createPath(superager)}
        fill="none"
        stroke="#4A7C59"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Selected age indicator */}
      <line
        x1={xScale(selectedAge)} y1={padding.top}
        x2={xScale(selectedAge)} y2={height - padding.bottom}
        stroke="#C4A77D" strokeWidth="2" strokeDasharray="5,5"
      />

      {/* Data points at selected age */}
      <circle cx={xScale(selectedAge)} cy={yScale(popValue)} r="7"
              fill="#C75B5B" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx={xScale(selectedAge)} cy={yScale(saValue)} r="7"
              fill="#4A7C59" stroke="#FFFFFF" strokeWidth="2" />

      {/* Gap annotation */}
      {showGap && gap > 5 && (
        <g>
          <line
            x1={xScale(selectedAge) + 20} y1={yScale(popValue)}
            x2={xScale(selectedAge) + 20} y2={yScale(saValue)}
            stroke="#8B7355" strokeWidth="2"
          />
          <rect
            x={xScale(selectedAge) + 28}
            y={(yScale(popValue) + yScale(saValue)) / 2 - 14}
            width="55" height="28" rx="6" fill="#8B7355"
          />
          <text
            x={xScale(selectedAge) + 55}
            y={(yScale(popValue) + yScale(saValue)) / 2 + 5}
            fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle"
          >
            +{gap.toFixed(0)}%
          </text>
        </g>
      )}

      {/* Axis labels */}
      <text x={width / 2} y={height - 2} fill="#6B6B6B" fontSize="12" textAnchor="middle">
        Age (years)
      </text>
      <text
        transform={`translate(16, ${height / 2}) rotate(-90)`}
        fill="#6B6B6B" fontSize="12" textAnchor="middle"
      >
        {unit}
      </text>
    </svg>
  );
};

export const AgingTrajectory: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState('cardiovascular');
  const [selectedAge, setSelectedAge] = useState(65);
  const [showGap, setShowGap] = useState(true);

  const domain = domains[selectedDomain];
  const popValue = domain.population.find(p => p.age === selectedAge)?.value || 0;
  const saValue = domain.superager.find(p => p.age === selectedAge)?.value || 0;
  const gap = saValue - popValue;

  // Calculate aggregate stats
  const avgGap = Object.values(domains).reduce((acc, d) => {
    const pv = d.population.find(p => p.age === selectedAge)?.value || 0;
    const sv = d.superager.find(p => p.age === selectedAge)?.value || 0;
    return acc + (sv - pv);
  }, 0) / 4;

  return (
    <div>
      {/* Stats Row */}
      <div className="stats-grid stats-grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: '#C4A77D' }} />
          <div className="stat-card-label">Intervention Potential</div>
          <div className="stat-card-value" style={{ color: '#8B7355' }}>
            +{avgGap.toFixed(0)}%
          </div>
          <div className="stat-card-subtext">Avg function gain at age {selectedAge}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: '#4A7C59' }} />
          <div className="stat-card-label">KSA Target Population</div>
          <div className="stat-card-value" style={{ color: '#4A7C59' }}>
            34.1M
          </div>
          <div className="stat-card-subtext">Eligible for intervention</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: '#00A0B0' }} />
          <div className="stat-card-label">Reference Cohort</div>
          <div className="stat-card-value" style={{ color: '#00A0B0' }}>
            1,224
          </div>
          <div className="stat-card-subtext">Centenarians (AMORIS)</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: '#C75B5B' }} />
          <div className="stat-card-label">Biological Age Gap</div>
          <div className="stat-card-value" style={{ color: '#C75B5B' }}>
            {Math.round((100 - popValue) / 10 * 1.5)} yrs
          </div>
          <div className="stat-card-subtext">vs chronological at age {selectedAge}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid content-grid-sidebar">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Aging Trajectory Analysis</span>
            <span className="card-badge live">VITRUVIA AI</span>
          </div>
          <div className="card-body">
            {/* Domain Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {Object.entries(domains).map(([key, d]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDomain(key)}
                  className={`nav-btn ${selectedDomain === key ? 'active' : ''}`}
                  style={{ padding: '8px 14px', fontSize: 12 }}
                >
                  <span>{d.icon}</span>
                  {d.name}
                </button>
              ))}
            </div>

            {/* Chart */}
            <TrajectoryChart
              domain={selectedDomain}
              showGap={showGap}
              selectedAge={selectedAge}
            />

            {/* Age Slider */}
            <div style={{ marginTop: 24, padding: '0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6B6B6B', fontSize: 12 }}>Selected Age</span>
                <span style={{ color: '#8B7355', fontSize: 14, fontWeight: 600 }}>{selectedAge} years</span>
              </div>
              <input
                type="range"
                min="30" max="100" step="5"
                value={selectedAge}
                onChange={(e) => setSelectedAge(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#8B7355',
                  height: 6,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B8B8B', fontSize: 10 }}>30</span>
                <span style={{ color: '#8B8B8B', fontSize: 10 }}>100</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex',
              gap: 24,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid rgba(139, 115, 85, 0.1)',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 3, background: '#C75B5B', borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: '#6B6B6B' }}>KSA Population Average</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 3, background: '#4A7C59', borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: '#6B6B6B' }}>Super Ager Reference</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginLeft: 'auto' }}>
                <input
                  type="checkbox"
                  checked={showGap}
                  onChange={(e) => setShowGap(e.target.checked)}
                  style={{ accentColor: '#8B7355' }}
                />
                <span style={{ fontSize: 12, color: '#6B6B6B' }}>Show Opportunity Gap</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Domain Info */}
          <div className="province-panel">
            <div className="province-panel-header">
              <div style={{ fontSize: 28, marginBottom: 8 }}>{domain.icon}</div>
              <div className="province-name">{domain.name}</div>
              <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>
                {domain.description}
              </p>
            </div>
            <div className="province-metrics">
              <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="metric-item">
                  <div className="metric-label">Population</div>
                  <div className="metric-value" style={{ color: '#C75B5B' }}>{popValue.toFixed(0)}%</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Super Ager</div>
                  <div className="metric-value" style={{ color: '#4A7C59' }}>{saValue.toFixed(0)}%</div>
                </div>
              </div>

              <div style={{
                marginTop: 20,
                padding: 16,
                background: 'linear-gradient(90deg, #F5F0EB, rgba(196, 167, 125, 0.1))',
                borderRadius: 12,
                borderLeft: '4px solid #C4A77D',
              }}>
                <div style={{ fontSize: 10, color: '#8B7355', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                  Intervention Opportunity
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#8B7355' }}>+{gap.toFixed(0)} points</div>
                <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
                  {gap > 30 ? 'High potential for improvement' : gap > 15 ? 'Moderate intervention benefit' : 'Closer to optimal trajectory'}
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Key Insights</span>
            </div>
            <div className="card-body">
              <div className="kpi-list" style={{ gap: 12 }}>
                <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6 }}>
                  <span style={{ color: '#4A7C59', marginRight: 8 }}>●</span>
                  Super agers show <strong style={{ color: '#3D3D3D' }}>homogeneous biomarker profiles</strong> from age 65 onwards
                </div>
                <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6 }}>
                  <span style={{ color: '#4A7C59', marginRight: 8 }}>●</span>
                  Centenarians spend only <strong style={{ color: '#3D3D3D' }}>5.2-9.4%</strong> of life with age-related diseases
                </div>
                <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6 }}>
                  <span style={{ color: '#4A7C59', marginRight: 8 }}>●</span>
                  The gap represents <strong style={{ color: '#3D3D3D' }}>modifiable factors</strong> through personalized interventions
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Reference Data</span>
            </div>
            <div className="card-body" style={{ fontSize: 12, color: '#6B6B6B' }}>
              <div style={{ marginBottom: 6 }}>SardiNIA/ProgeNIA (n=6,148)</div>
              <div style={{ marginBottom: 6 }}>Swedish AMORIS Centenarian Study (n=44,636)</div>
              <div style={{ marginBottom: 6 }}>New England Centenarian Study (n=5,500+)</div>
              <div style={{ marginTop: 12, color: '#4A7C59', fontWeight: 600 }}>
                SABA Sardinia Super Ager Cohort (n=1,600+)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div style={{
        marginTop: 24,
        background: 'linear-gradient(90deg, #F5F0EB, rgba(139, 115, 85, 0.1))',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(139, 115, 85, 0.15)',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#3D3D3D', marginBottom: 4 }}>
            Vitruvia World Model: Predictive Aging Trajectories
          </div>
          <div style={{ fontSize: 13, color: '#6B6B6B' }}>
            Trained on 25+ years of longitudinal biological data from exceptional agers
          </div>
        </div>
        <div style={{
          background: '#8B7355',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
        }}>
          Deploy for KSA Vision 2030
        </div>
      </div>
    </div>
  );
};

export default AgingTrajectory;
