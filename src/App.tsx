import { useState } from 'react';
import { KSAMap } from './components/KSAMap';
import { StatCard } from './components/StatCard';
import { Vision2030Tracker } from './components/Vision2030Tracker';
import { ProvinceDetail } from './components/ProvinceDetail';
import { ProvinceTable } from './components/ProvinceTable';
import { DiseaseAnalysis } from './components/DiseaseAnalysis';
import { HealthcareInfrastructure } from './components/HealthcareInfrastructure';
import { nationalStats, provinces } from './data/ksaData';

type ViewType = 'national' | 'provincial' | 'disease' | 'infrastructure';

const navItems: { id: ViewType; label: string; icon: string }[] = [
  { id: 'national', label: 'National Overview', icon: '🏛️' },
  { id: 'provincial', label: 'Regional Analysis', icon: '🗺️' },
  { id: 'disease', label: 'Disease Deep-Dive', icon: '🩺' },
  { id: 'infrastructure', label: 'Healthcare Infrastructure', icon: '🏥' },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('national');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [mapColorMode, setMapColorMode] = useState<'tier' | 'diabetes' | 'obesity' | 'infrastructure'>('tier');

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSelectedProvince(null);
  };

  // Calculate summary stats
  const criticalProvinces = Object.values(provinces).filter(p => p.tier === 1).length;
  const highPriorityProvinces = Object.values(provinces).filter(p => p.tier === 2).length;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="brand-badge">NURAXI</div>
          <div className="header-title">
            <h1>Kingdom of Saudi Arabia</h1>
            <p className="header-subtitle">
              National Health Intelligence Dashboard | Vision 2030
            </p>
          </div>
        </div>
        <div className="header-actions">
          <div className="header-tag sovereign">
            Sovereign Data
          </div>
          <div className="header-tag language">
            عربي | EN
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
            onClick={() => handleViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
        {currentView === 'national' || currentView === 'provincial' ? (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
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
              <option value="tier">Color by: Priority Tier</option>
              <option value="diabetes">Color by: Diabetes Rate</option>
              <option value="obesity">Color by: Obesity Rate</option>
              <option value="infrastructure">Color by: Infrastructure</option>
            </select>
          </div>
        ) : null}
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
                label="Diabetes Prevalence"
                value={`${nationalStats.diabetesPrevalence}%`}
                subtext="~5.8M affected"
                color="var(--accent-danger)"
              />
              <StatCard
                label="Undiagnosed NCDs"
                value={`${nationalStats.undiagnosedDiabetes}%`}
                subtext="Hidden burden"
                color="var(--accent-warning)"
              />
              <StatCard
                label="Life Expectancy"
                value={`${nationalStats.lifeExpectancy}yr`}
                subtext="Target: 80yr"
                color="var(--accent-success)"
                trend={3}
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
              <KSAMap
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
                colorMode={mapColorMode}
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
                value="17K"
                subtext="Additional beds needed"
                color="var(--accent-secondary)"
                small
              />
              <StatCard
                label="Model Province"
                value="Najran"
                subtext="Lowest NCD burden"
                color="var(--accent-success)"
                small
              />
            </div>

            <div className="content-grid content-grid-sidebar">
              <KSAMap
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
                colorMode={mapColorMode}
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
        <div>
          Data: GASTAT Census 2022 | Saudi Health Interview Survey | MOH Statistical Yearbook | IHME GBD
        </div>
        <div className="footer-right">
          <span>Sovereign Data | In-Kingdom Processing</span>
          <span className="footer-dot pulse">●</span>
          <span>Last updated: January 2025</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
