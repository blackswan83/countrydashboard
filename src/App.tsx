import { useState } from 'react';
import { KSAMap } from './components/KSAMap';
import { StatCard } from './components/StatCard';
import { Vision2030Tracker } from './components/Vision2030Tracker';
import { ProvinceDetail } from './components/ProvinceDetail';
import { ProvinceTable } from './components/ProvinceTable';
import { DiseaseAnalysis } from './components/DiseaseAnalysis';
import { HealthcareInfrastructure } from './components/HealthcareInfrastructure';
import { AgingTrajectory } from './components/AgingTrajectory';
import { PopulationPyramid } from './components/PopulationPyramid';
// InterventionSimulator kept for reference - new InterventionLab replaces it
// import { InterventionSimulator } from './components/InterventionSimulator';
import InterventionLab from './components/intervention/InterventionLab';
import { nationalStats, provinces } from './data/ksaData';

type ViewType = 'national' | 'provincial' | 'aging' | 'intervention' | 'disease' | 'infrastructure';

// Simple Aging Curve Preview SVG for National Overview
const AgingCurvePreview: React.FC = () => {
  const width = 400;
  const height = 180;
  const padding = { top: 15, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

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

  const populationCurve = generateCurve(95, 35, 1.4);
  const superAgerCurve = generateCurve(95, 72, 0.8);

  const xScale = (age: number) => padding.left + ((age - 30) / 60) * chartWidth;
  const yScale = (val: number) => padding.top + (1 - val / 100) * chartHeight;

  const pathD = (points: { age: number; value: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.age)} ${yScale(p.value)}`).join(' ');

  const areaD = () => {
    const top = superAgerCurve.map(p => `${xScale(p.age)},${yScale(p.value)}`).join(' ');
    const bottom = [...populationCurve].reverse().map(p => `${xScale(p.age)},${yScale(p.value)}`).join(' ');
    return `M ${top} L ${bottom} Z`;
  };

  return (
    <svg width={width} height={height} style={{ width: '100%', height: 'auto' }}>
      {/* Background */}
      <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#F5F0EB" rx="4" />

      {/* Grid */}
      {[25, 50, 75].map(v => (
        <line key={v} x1={padding.left} y1={yScale(v)} x2={width - padding.right} y2={yScale(v)}
              stroke="rgba(139, 115, 85, 0.1)" strokeDasharray="2,4" />
      ))}

      {/* Gap area */}
      <path d={areaD()} fill="#4A7C59" opacity="0.15" />

      {/* Curves */}
      <path d={pathD(populationCurve)} fill="none" stroke="#C75B5B" strokeWidth="2.5" />
      <path d={pathD(superAgerCurve)} fill="none" stroke="#4A7C59" strokeWidth="2.5" />

      {/* X axis labels */}
      {[30, 50, 70, 90].map(age => (
        <text key={age} x={xScale(age)} y={height - 8} fill="#8B8B8B" fontSize="10" textAnchor="middle">
          {age}
        </text>
      ))}

      {/* Legend */}
      <text x={width - 20} y={yScale(72) - 8} fill="#4A7C59" fontSize="9" textAnchor="end">Super Ager</text>
      <text x={width - 20} y={yScale(35) + 14} fill="#C75B5B" fontSize="9" textAnchor="end">KSA Pop</text>
    </svg>
  );
};

// Left nav items (main dashboard views)
const navItemsLeft: { id: ViewType; labelKey: keyof typeof translations.en.nav; icon: string }[] = [
  { id: 'national', labelKey: 'national', icon: '🏛️' },
  { id: 'provincial', labelKey: 'provincial', icon: '🗺️' },
  { id: 'aging', labelKey: 'aging', icon: '🧬' },
  { id: 'disease', labelKey: 'disease', icon: '🩺' },
  { id: 'infrastructure', labelKey: 'infrastructure', icon: '🏥' },
];

// Right nav item (Intervention Lab - special highlight)
const navItemRight: { id: ViewType; labelKey: keyof typeof translations.en.nav; icon: string } =
  { id: 'intervention', labelKey: 'intervention', icon: '🎯' };

// Translations
const translations = {
  en: {
    title: 'Kingdom of Saudi Arabia',
    subtitle: 'National Health Intelligence Dashboard | Vision 2030',
    sovereignData: 'Sovereign Data',
    inKingdom: 'In-Kingdom Processing',
    nav: {
      national: 'National Overview',
      provincial: 'Regional Analysis',
      aging: 'Aging & Longevity',
      intervention: 'Intervention Lab',
      disease: 'Disease Deep-Dive',
      infrastructure: 'Healthcare Infrastructure',
    },
    colorBy: {
      tier: 'Color by: Priority Tier',
      diabetes: 'Color by: Diabetes Rate',
      obesity: 'Color by: Obesity Rate',
      infrastructure: 'Color by: Infrastructure',
    },
    footer: {
      data: 'Data: GASTAT Census 2022 | Saudi Health Interview Survey | MOH Statistical Yearbook | IHME GBD',
      lastUpdated: 'Last updated: January 2025',
    },
  },
  ar: {
    title: 'المملكة العربية السعودية',
    subtitle: 'لوحة معلومات الصحة الوطنية | رؤية 2030',
    sovereignData: 'بيانات سيادية',
    inKingdom: 'معالجة داخل المملكة',
    nav: {
      national: 'نظرة عامة وطنية',
      provincial: 'التحليل الإقليمي',
      aging: 'الشيخوخة وطول العمر',
      intervention: 'مختبر التدخل',
      disease: 'تحليل الأمراض',
      infrastructure: 'البنية التحتية الصحية',
    },
    colorBy: {
      tier: 'تلوين حسب: مستوى الأولوية',
      diabetes: 'تلوين حسب: معدل السكري',
      obesity: 'تلوين حسب: معدل السمنة',
      infrastructure: 'تلوين حسب: البنية التحتية',
    },
    footer: {
      data: 'البيانات: تعداد الهيئة العامة للإحصاء 2022 | مسح المقابلات الصحية السعودية | الكتاب الإحصائي لوزارة الصحة',
      lastUpdated: 'آخر تحديث: يناير 2025',
    },
  },
};

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('national');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [mapColorMode, setMapColorMode] = useState<'tier' | 'diabetes' | 'obesity' | 'infrastructure'>('tier');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [darkMode, setDarkMode] = useState(false);

  const t = translations[language];
  const isRTL = language === 'ar';

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSelectedProvince(null);
  };

  // Calculate summary stats
  const criticalProvinces = Object.values(provinces).filter(p => p.tier === 1).length;
  const highPriorityProvinces = Object.values(provinces).filter(p => p.tier === 2).length;

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <img src="/nuraxi_horizontal_rgb.svg" alt="Nuraxi" className="brand-logo" />
          <div className="header-title">
            <h1>{t.title}</h1>
            <p className="header-subtitle">{t.subtitle}</p>
          </div>
        </div>
        <div className="header-actions">
          {/* Sovereign Data Badge - Prominent */}
          <div className="header-tag sovereign-prominent">
            <span style={{ fontSize: 16 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{t.sovereignData}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{t.inKingdom}</div>
            </div>
          </div>
          {/* Dark Mode Toggle */}
          <button
            className="header-tag toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {/* Language Toggle */}
          <button
            className="header-tag toggle-btn language"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'en' ? 'عربي' : 'EN'}
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
            {t.nav[item.labelKey]}
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
              <option value="tier">{t.colorBy.tier}</option>
              <option value="diabetes">{t.colorBy.diabetes}</option>
              <option value="obesity">{t.colorBy.obesity}</option>
              <option value="infrastructure">{t.colorBy.infrastructure}</option>
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
              ? 'linear-gradient(135deg, #4A7C59 0%, #3d6b4a 100%)'
              : 'linear-gradient(135deg, rgba(74, 124, 89, 0.15) 0%, rgba(74, 124, 89, 0.08) 100%)',
            border: '1px solid rgba(74, 124, 89, 0.4)',
            position: 'relative',
          }}
        >
          <span className="nav-icon">{navItemRight.icon}</span>
          {t.nav[navItemRight.labelKey]}
          {/* Alpha badge */}
          <span style={{
            marginLeft: isRTL ? 0 : 6,
            marginRight: isRTL ? 6 : 0,
            fontSize: 9,
            padding: '2px 6px',
            background: currentView === navItemRight.id ? 'rgba(255,255,255,0.25)' : '#F59E0B',
            color: currentView === navItemRight.id ? '#FFFFFF' : '#FFFFFF',
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

            {/* Population & KPIs Row */}
            <div className="content-grid content-grid-2">
              <PopulationPyramid />
              <div className="card">
                <div className="card-header">
                  <span className="card-title">The Intervention Opportunity</span>
                  <span className="card-badge live">VITRUVIA</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>
                        Population trajectory vs optimal aging
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(74, 124, 89, 0.1)',
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(74, 124, 89, 0.2)',
                    }}>
                      <div style={{ fontSize: 10, color: '#4A7C59' }}>GAP AT AGE 65</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#4A7C59' }}>+37%</div>
                    </div>
                  </div>
                  <AgingCurvePreview />
                  <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    background: '#F5F0EB',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#6B6B6B',
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ color: '#4A7C59' }}>The shaded area represents addressable health optimization.</strong> Closing this gap through predictive intervention could add 10+ healthy life years for millions of Saudis.
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

        {/* Aging & Longevity */}
        {currentView === 'aging' && (
          <AgingTrajectory />
        )}

        {/* Intervention Lab - Country Agentic Health Twin */}
        {currentView === 'intervention' && (
          <InterventionLab language={language} darkMode={darkMode} />
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
        <div>{t.footer.data}</div>
        <div className="footer-right">
          <span>🛡️ {t.sovereignData}</span>
          <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
          <span>{t.inKingdom}</span>
          <span className="footer-dot pulse">●</span>
          <span>{t.footer.lastUpdated}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
