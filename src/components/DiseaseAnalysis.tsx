import React, { useState } from 'react';
import { provinces, diseaseburden } from '../data/zambiaData';

type DiseaseKey = 'hiv' | 'malaria' | 'diabetes' | 'cvd';

export const DiseaseAnalysis: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>('hiv');

  // Use type assertion since different diseases have different structures
  const disease = diseaseburden[selectedDisease] as any;

  // Calculate province rankings for selected disease
  const provinceRankings = Object.entries(provinces)
    .map(([id, p]) => ({
      id,
      name: p.name,
      value: selectedDisease === 'hiv' ? p.hiv :
             selectedDisease === 'malaria' ? p.malaria :
             selectedDisease === 'diabetes' ? p.diabetes : p.cvd,
      population: p.population,
    }))
    .sort((a, b) => b.value - a.value);

  const diseaseOptions = [
    { key: 'hiv' as const, label: 'HIV/AIDS', icon: '🎗️' },
    { key: 'malaria' as const, label: 'Malaria', icon: '🦟' },
    { key: 'diabetes' as const, label: 'Diabetes', icon: '🩸' },
    { key: 'cvd' as const, label: 'Cardiovascular', icon: '❤️' },
  ];

  const maxValue = Math.max(...provinceRankings.map(p => p.value));
  const isPerThousand = selectedDisease === 'malaria';
  const unit = isPerThousand ? '/1K' : '%';

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
            {disease.prevalence}{unit}
          </div>
          <div className="stat-card-subtext">{isPerThousand ? 'Per 1,000 population' : 'Adult population'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-warning)' }} />
          <div className="stat-card-label">{selectedDisease === 'malaria' ? 'Annual Cases' : 'Affected Population'}</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-warning)' }}>
            {selectedDisease === 'malaria'
              ? `${(disease.cases / 1000000).toFixed(1)}M`
              : `${(disease.affected / 1000000).toFixed(1)}M`}
          </div>
          <div className="stat-card-subtext">{selectedDisease === 'malaria' ? 'Estimated annually' : 'Estimated cases'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-secondary)' }} />
          <div className="stat-card-label">{selectedDisease === 'hiv' ? 'On Treatment' : selectedDisease === 'malaria' ? 'Mortality Rate' : 'Annual Increase'}</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-secondary)' }}>
            {selectedDisease === 'hiv' ? `${disease.onTreatment}%` :
             selectedDisease === 'malaria' ? `${disease.mortality}/100K` :
             `+${disease.yearlyIncrease}%`}
          </div>
          <div className="stat-card-subtext">{selectedDisease === 'hiv' ? 'ART coverage' : selectedDisease === 'malaria' ? 'Per 100,000' : 'Year over year'}</div>
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
            <span className="card-title">Provincial {disease.name} {isPerThousand ? 'Incidence' : 'Prevalence'}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Ranked by {isPerThousand ? 'incidence' : 'prevalence'} rate
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
                        {p.value}{unit}
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
                {selectedDisease === 'hiv' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--accent-success)' }}>82%</span> of diagnosed HIV cases are on antiretroviral treatment
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Lusaka and Southern provinces show highest prevalence rates
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Mother-to-child transmission reduced to <span style={{ color: 'var(--accent-success)' }}>4.8%</span>
                    </div>
                  </>
                )}
                {selectedDisease === 'malaria' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--accent-danger)' }}>Endemic</span> in all 10 provinces year-round
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Luapula & Northern provinces show highest incidence rates
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      ITN coverage: <span style={{ color: 'var(--accent-warning)' }}>68%</span> of households
                    </div>
                  </>
                )}
                {selectedDisease === 'diabetes' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--accent-danger)' }}>58%</span> of diabetes cases remain undiagnosed
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Urban provinces (Lusaka, Copperbelt) show highest rates
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Prevalence increasing <span style={{ color: 'var(--accent-warning)' }}>4.2% annually</span>
                    </div>
                  </>
                )}
                {selectedDisease === 'cvd' && (
                  <>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Cardiovascular disease causes <span style={{ color: 'var(--accent-danger)' }}>18%</span> of all deaths
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Rising burden linked to urbanization and diet changes
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Limited cardiac care facilities outside Lusaka
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
                    {selectedDisease === 'hiv' ? 'Expand ART access in rural Northern & Luapula' :
                     selectedDisease === 'malaria' ? 'IRS campaigns in Luapula, Northern provinces' :
                     selectedDisease === 'diabetes' ? 'Mass screening programs in Lusaka, Copperbelt' :
                     'Establish cardiac units in provincial hospitals'}
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
                    {selectedDisease === 'hiv' ? 'Youth-focused prevention programs' :
                     selectedDisease === 'malaria' ? 'Increase ITN distribution to 80% coverage' :
                     selectedDisease === 'diabetes' ? 'Primary care NCD training expansion' :
                     'Risk factor screening at primary care level'}
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
                    {selectedDisease === 'hiv' ? 'Vaccine research and trials partnership' :
                     selectedDisease === 'malaria' ? 'Elimination target in low-burden provinces' :
                     selectedDisease === 'diabetes' ? 'Lifestyle intervention at community level' :
                     'Cardiovascular disease registry implementation'}
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
