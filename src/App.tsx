import { useState } from 'react';
import { ZambiaMap } from './components/ZambiaMap';
import { StatCard } from './components/StatCard';
import { Vision2030Tracker } from './components/Vision2030Tracker';
import { ProvinceDetail } from './components/ProvinceDetail';
import { ProvinceTable } from './components/ProvinceTable';
import { DiseaseAnalysis } from './components/DiseaseAnalysis';
import { HealthcareInfrastructure } from './components/HealthcareInfrastructure';
import { AgingTrajectory } from './components/AgingTrajectory';
import { PopulationPyramid } from './components/PopulationPyramid';
import InterventionLab from './components/intervention/InterventionLab';
import { IntroPresentation } from './components/IntroPresentation';
import { nationalStats, provinces } from './data/zambiaData';

type ViewType = 'national' | 'provincial' | 'aging' | 'intervention' | 'disease' | 'infrastructure';

// Simple Health Trajectory Preview SVG for National Overview
const HealthTrajectoryPreview: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  const width = 400;
  const height = 180;
  const padding = { top: 15, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Theme colors
  const chartBg = darkMode ? '#1E2A3A' : '#F5F0EB';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 115, 85, 0.1)';
  const textMuted = darkMode ? '#6B7280' : '#8B8B8B';
  const success = darkMode ? '#5B9A6E' : '#4A7C59';
  const danger = darkMode ? '#E06B6B' : '#C75B5B';

  // Generate curve points
  const generateCurve = (start: number, end: number, power: number) => {
    const points = [];
    for (let age = 30; age <= 90; age += 5) {
      const t = (age - 30) / 60;
      const value = start - (start - end) * Math.pow(t, power);
      points.push({ age, value });
    }
    return points;
  };

  const populationCurve = generateCurve(90, 25, 1.6);
  const targetCurve = generateCurve(95, 65, 0.9);

  const xScale = (age: number) => padding.left + ((age - 30) / 60) * chartWidth;
  const yScale = (val: number) => padding.top + (1 - val / 100) * chartHeight;

  const pathD = (points: { age: number; value: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.age)} ${yScale(p.value)}`).join(' ');

  const areaD = () => {
    const top = targetCurve.map(p => `${xScale(p.age)},${yScale(p.value)}`).join(' ');
    const bottom = [...populationCurve].reverse().map(p => `${xScale(p.age)},${yScale(p.value)}`).join(' ');
    return `M ${top} L ${bottom} Z`;
  };

  return (
    <svg width={width} height={height} style={{ width: '100%', height: 'auto' }}>
      {/* Background */}
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill={chartBg} rx="4" />

      {/* Grid */}
      {[25, 50, 75].map(v => (
        <line key={v} x1={padding.left} y1={yScale(v)} x2={width - padding.right} y2={yScale(v)}
              stroke={gridColor} strokeDasharray="2,4" />
      ))}

      {/* Gap area */}
      <path d={areaD()} fill={success} opacity="0.15" />

      {/* Curves */}
      <path d={pathD(populationCurve)} fill="none" stroke={danger} strokeWidth="2.5" />
      <path d={pathD(targetCurve)} fill="none" stroke={success} strokeWidth="2.5" />

      {/* X axis labels */}
      {[30, 50, 70, 90].map(age => (
        <text key={age} x={xScale(age)} y={height - 8} fill={textMuted} fontSize="10" textAnchor="middle">
          {age}
        </text>
      ))}

      {/* Legend */}
      <text x={width - 20} y={yScale(65) - 8} fill={success} fontSize="9" textAnchor="end">Target</text>
      <text x={width - 20} y={yScale(25) + 14} fill={danger} fontSize="9" textAnchor="end">Zambia</text>
    </svg>
  );
};

// Left nav items (main dashboard views)
const navItemsLeft: { id: ViewType; label: string; icon: string }[] = [
  { id: 'national', label: 'National Overview', icon: '🏛️' },
  { id: 'provincial', label: 'Regional Analysis', icon: '🗺️' },
  { id: 'aging', label: 'Aging & Longevity', icon: '🧬' },
  { id: 'disease', label: 'Disease Deep-Dive', icon: '🩺' },
  { id: 'infrastructure', label: 'Healthcare Infrastructure', icon: '🏥' },
];

// Right nav item (Intervention Lab - special highlight)
const navItemRight: { id: ViewType; label: string; icon: string } =
  { id: 'intervention', label: 'Intervention Lab', icon: '🎯' };

// Color mode options for Zambia (HIV and Malaria are key metrics)
const colorByOptions = {
  tier: 'Color by: Priority Tier',
  hiv: 'Color by: HIV Prevalence',
  malaria: 'Color by: Malaria Incidence',
  infrastructure: 'Color by: Infrastructure',
};

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('national');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [mapColorMode, setMapColorMode] = useState<'tier' | 'hiv' | 'malaria' | 'infrastructure'>('tier');
  const [darkMode, setDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem('zambia-dashboard-intro-seen') !== 'true';
  });

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSelectedProvince(null);
  };

  // Calculate summary stats
  const criticalProvinces = Object.values(provinces).filter(p => p.tier === 1).length;
  const highPriorityProvinces = Object.values(provinces).filter(p => p.tier === 2).length;

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <img src="/nuraxi_horizontal_rgb.svg" alt="Nuraxi" className="brand-logo" />
          <div className="header-title">
            <h1>Republic of Zambia</h1>
            <p className="header-subtitle">National Health Intelligence Dashboard | NHSP 2022-2026</p>
          </div>
        </div>
        <div className="header-actions">
          {/* Sovereign Data Badge - Prominent */}
          <div className="header-tag sovereign-prominent">
            <span style={{ fontSize: 16 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>Sovereign Data</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>In-Country Processing</div>
            </div>
          </div>
          {/* About/Help Button */}
          <button
            className="header-tag toggle-btn"
            onClick={() => setShowIntro(true)}
            title="About this dashboard"
            style={{ fontSize: 16, fontWeight: 700 }}
          >
            ?
          </button>
          {/* Dark Mode Toggle */}
          <button
            className="header-tag toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        {/* Left nav items */}
        {navItemsLeft.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
            onClick={() => handleViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Color mode selector (for map views) */}
        {(currentView === 'national' || currentView === 'provincial') && (
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={mapColorMode}
              onChange={(e) => setMapColorMode(e.target.value as typeof mapColorMode)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <option value="tier">{colorByOptions.tier}</option>
              <option value="hiv">{colorByOptions.hiv}</option>
              <option value="malaria">{colorByOptions.malaria}</option>
              <option value="infrastructure">{colorByOptions.infrastructure}</option>
            </select>
          </div>
        )}

        {/* Spacer to push Intervention Lab to the right */}
        <div style={{ flex: 1 }} />

        {/* Intervention Lab button - special styling on the right */}
        <button
          className={`nav-btn highlight ${currentView === navItemRight.id ? 'active' : ''}`}
          onClick={() => handleViewChange(navItemRight.id)}
          style={{
            background: currentView === navItemRight.id
              ? darkMode
                ? 'linear-gradient(135deg, #3FB950 0%, #2ea043 100%)'
                : 'linear-gradient(135deg, #4A7C59 0%, #3d6b4a 100%)'
              : darkMode
                ? 'linear-gradient(135deg, rgba(63, 185, 80, 0.15) 0%, rgba(63, 185, 80, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(74, 124, 89, 0.15) 0%, rgba(74, 124, 89, 0.08) 100%)',
            border: darkMode
              ? '1px solid rgba(63, 185, 80, 0.4)'
              : '1px solid rgba(74, 124, 89, 0.4)',
            position: 'relative',
          }}
        >
          <span className="nav-icon">{navItemRight.icon}</span>
          {navItemRight.label}
          {/* Alpha badge */}
          <span style={{
            marginLeft: 6,
            fontSize: 9,
            padding: '2px 6px',
            background: currentView === navItemRight.id
              ? 'rgba(255,255,255,0.25)'
              : darkMode ? '#D29922' : '#F59E0B',
            color: '#FFFFFF',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}>ALPHA</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* National Overview */}
        {currentView === 'national' && (
          <>
            {/* KPI Stats Row */}
            <div className="stats-grid stats-grid-5">
              <StatCard
                label="Total Population"
                value={`${(nationalStats.population / 1000000).toFixed(1)}M`}
                subtext="2024 estimate"
                color="var(--accent-primary)"
              />
              <StatCard
                label="HIV Prevalence"
                value={`${nationalStats.hivPrevalence}%`}
                subtext="~1.4M affected"
                color="var(--accent-danger)"
              />
              <StatCard
                label="Malaria Incidence"
                value={`${nationalStats.malariaIncidence}/1K`}
                subtext="Endemic nationwide"
                color="var(--accent-warning)"
              />
              <StatCard
                label="Life Expectancy"
                value={`${nationalStats.lifeExpectancy}yr`}
                subtext="Target: 72yr"
                color="var(--accent-success)"
                trend={4}
              />
              <StatCard
                label="Healthy Life Years"
                value={`${nationalStats.healthyLifeExpectancy}yr`}
                subtext={`${(nationalStats.lifeExpectancy - nationalStats.healthyLifeExpectancy).toFixed(1)}yr gap`}
                color="var(--accent-secondary)"
              />
            </div>

            {/* Map + Sidebar */}
            <div className="content-grid content-grid-2">
              <ZambiaMap
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
                colorMode={mapColorMode}
                darkMode={darkMode}
              />
              {selectedProvince ? (
                <ProvinceDetail
                  provinceId={selectedProvince}
                  onClose={() => setSelectedProvince(null)}
                />
              ) : (
                <Vision2030Tracker />
              )}
            </div>

            {/* Population & KPIs Row */}
            <div className="content-grid content-grid-2">
              <PopulationPyramid darkMode={darkMode} />
              <div className="card">
                <div className="card-header">
                  <span className="card-title">The Intervention Opportunity</span>
                  <span className="card-badge live">VITRUVIA</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        Population trajectory vs optimal health
                      </div>
                    </div>
                    <div style={{
                      background: 'var(--accent-success-dim)',
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--accent-success)',
                      borderColor: darkMode ? 'rgba(91, 154, 110, 0.3)' : 'rgba(74, 124, 89, 0.2)',
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--accent-success)' }}>GAP AT AGE 65</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-success)' }}>+40%</div>
                    </div>
                  </div>
                  <HealthTrajectoryPreview darkMode={darkMode} />
                  <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    background: 'var(--chart-bg)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ color: 'var(--accent-success)' }}>The shaded area represents addressable health optimization.</strong> Closing this gap through HIV/malaria control and NCD prevention could add 8+ healthy life years for millions of Zambians.
                  </div>
                </div>
              </div>
            </div>

            {/* Province Table */}
            <ProvinceTable
              selectedProvince={selectedProvince}
              onProvinceSelect={setSelectedProvince}
            />
          </>
        )}

        {/* Provincial/Regional Analysis */}
        {currentView === 'provincial' && (
          <>
            <div className="stats-grid stats-grid-4">
              <StatCard
                label="Critical Provinces"
                value={criticalProvinces.toString()}
                subtext="Immediate intervention needed"
                color="var(--accent-danger)"
                small
              />
              <StatCard
                label="High Priority"
                value={highPriorityProvinces.toString()}
                subtext="Accelerated programs needed"
                color="var(--accent-warning)"
                small
              />
              <StatCard
                label="Infrastructure Gap"
                value="12K"
                subtext="Additional beds needed"
                color="var(--accent-secondary)"
                small
              />
              <StatCard
                label="Model Province"
                value="Lusaka"
                subtext="Best infrastructure"
                color="var(--accent-success)"
                small
              />
            </div>

            <div className="content-grid content-grid-sidebar">
              <ZambiaMap
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
                colorMode={mapColorMode}
                darkMode={darkMode}
              />
              {selectedProvince && (
                <ProvinceDetail
                  provinceId={selectedProvince}
                  onClose={() => setSelectedProvince(null)}
                />
              )}
            </div>

            <ProvinceTable
              selectedProvince={selectedProvince}
              onProvinceSelect={setSelectedProvince}
            />
          </>
        )}

        {/* Aging & Longevity */}
        {currentView === 'aging' && (
          <AgingTrajectory darkMode={darkMode} />
        )}

        {/* Intervention Lab - Country Agentic Health Twin */}
        {currentView === 'intervention' && (
          <InterventionLab language="en" darkMode={darkMode} />
        )}

        {/* Disease Deep-Dive */}
        {currentView === 'disease' && (
          <DiseaseAnalysis />
        )}

        {/* Healthcare Infrastructure */}
        {currentView === 'infrastructure' && (
          <HealthcareInfrastructure />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div>Data: Zambia DHS 2018 | MOH Health Statistics | WHO Country Profile | IHME GBD</div>
        <div className="footer-right">
          <span>🛡️ Sovereign Data</span>
          <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
          <span>In-Country Processing</span>
          <span className="footer-dot pulse">●</span>
          <span>Last updated: January 2025</span>
        </div>
      </footer>

      {/* Intro Presentation Modal */}
      {showIntro && (
        <IntroPresentation
          language="en"
          darkMode={darkMode}
          onComplete={(view) => {
            setShowIntro(false);
            localStorage.setItem('zambia-dashboard-intro-seen', 'true');
            if (view) handleViewChange(view);
          }}
          onDismiss={() => {
            setShowIntro(false);
            localStorage.setItem('zambia-dashboard-intro-seen', 'true');
          }}
        />
      )}
    </div>
  );
}

export default App;
