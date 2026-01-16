import React, { useState } from 'react';
import { provinces, diseaseburden } from '../data/ksaData';

type DiseaseKey = 'diabetes' | 'obesity' | 'cvd' | 'hypertension';

export const DiseaseAnalysis: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>('diabetes');

  const disease = diseaseburden[selectedDisease];

  // Calculate province rankings for selected disease
  const provinceRankings = Object.entries(provinces)
    .map(([id, p]) => ({
      id,
      name: p.name,
      nameAr: p.nameAr,
      value: selectedDisease === 'diabetes' ? p.diabetes :
             selectedDisease === 'obesity' ? p.obesity :
             selectedDisease === 'cvd' ? p.cvd : p.hypertension,
      population: p.population,
    }))
    .sort((a, b) => b.value - a.value);

  const diseaseOptions = [
    { key: 'diabetes' as const, label: 'Diabetes', icon: '🩸' },
    { key: 'obesity' as const, label: 'Obesity', icon: '⚖️' },
    { key: 'cvd' as const, label: 'Cardiovascular', icon: '❤️' },
    { key: 'hypertension' as const, label: 'Hypertension', icon: '💉' },
  ];

  const maxValue = Math.max(...provinceRankings.map(p => p.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Disease Selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {diseaseOptions.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDisease(d.key)}
            className={`nav-btn ${selectedDisease === d.key ? 'active' : ''}`}
          >
            <span className="nav-icon">{d.icon}</span>
            {d.label}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="stats-grid stats-grid-4">
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-danger)' }} />
          <div className="stat-card-label">National Prevalence</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-danger)' }}>
            {disease.prevalence}%
          </div>
          <div className="stat-card-subtext">Adult population</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-warning)' }} />
          <div className="stat-card-label">Affected Population</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-warning)' }}>
            {(disease.affected / 1000000).toFixed(1)}M
          </div>
          <div className="stat-card-subtext">Estimated cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-secondary)' }} />
          <div className="stat-card-label">Annual Increase</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-secondary)' }}>
            +{disease.yearlyIncrease}%
          </div>
          <div className="stat-card-subtext">Year over year</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--nuraxi-gold)' }} />
          <div className="stat-card-label">Economic Burden</div>
          <div className="stat-card-value" style={{ color: 'var(--nuraxi-gold)' }}>
            ${disease.economicBurden}B
          </div>
          <div className="stat-card-subtext">Annual USD</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid content-grid-sidebar">
        {/* Province Ranking */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Provincial {disease.name} Prevalence</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Ranked by prevalence rate
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {provinceRankings.map((p, idx) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: idx < 3 ? 'var(--accent-danger-dim)' : 'var(--bg-tertiary)',
                    color: idx < 3 ? 'var(--accent-danger)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: idx < 3 ? 'var(--accent-danger)' : 'var(--text-primary)',
                      }}>
                        {p.value}%
                      </span>
                    </div>
                    <div style={{
                      height: 6,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(p.value / maxValue) * 100}%`,
                        height: '100%',
                        background: idx < 3 ? 'var(--accent-danger)' :
                                   idx < 6 ? 'var(--accent-warning)' :
                                   'var(--accent-success)',
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Key Insights</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedDisease === 'diabetes' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--accent-primary)' }}>58%</span> of diabetes cases remain undiagnosed in KSA
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      KSA ranks <span style={{ color: 'var(--accent-warning)' }}>7th globally</span> in diabetes prevalence
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Makkah & Eastern Province show highest prevalence rates
                    </div>
                  </>
                )}
                {selectedDisease === 'obesity' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--accent-danger)' }}>78.6%</span> of adults are overweight or obese
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Child obesity rate: <span style={{ color: 'var(--accent-warning)' }}>19.5%</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Strong correlation with urbanization levels
                    </div>
                  </>
                )}
                {selectedDisease === 'cvd' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Cardiovascular disease causes <span style={{ color: 'var(--accent-danger)' }}>42%</span> of all deaths
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Mortality rate: <span style={{ color: 'var(--accent-warning)' }}>158 per 100,000</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Makkah shows highest CVD burden
                    </div>
                  </>
                )}
                {selectedDisease === 'hypertension' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Only <span style={{ color: 'var(--accent-danger)' }}>32%</span> of diagnosed cases are controlled
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Strong link with diabetes comorbidity
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Makkah & Al-Bahah provinces highest risk
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Intervention Priorities</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  padding: 12,
                  background: 'var(--accent-danger-dim)',
                  borderRadius: 8,
                  borderLeft: '3px solid var(--accent-danger)',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-danger)', marginBottom: 4 }}>
                    IMMEDIATE
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    Mass screening programs in Makkah, Eastern, Jazan
                  </div>
                </div>
                <div style={{
                  padding: 12,
                  background: 'var(--accent-warning-dim)',
                  borderRadius: 8,
                  borderLeft: '3px solid var(--accent-warning)',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-warning)', marginBottom: 4 }}>
                    SHORT-TERM
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    Digital health monitoring expansion
                  </div>
                </div>
                <div style={{
                  padding: 12,
                  background: 'var(--accent-success-dim)',
                  borderRadius: 8,
                  borderLeft: '3px solid var(--accent-success)',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-success)', marginBottom: 4 }}>
                    LONG-TERM
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    Lifestyle intervention at community level
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseAnalysis;
