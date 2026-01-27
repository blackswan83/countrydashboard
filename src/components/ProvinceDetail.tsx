import React from 'react';
import { provinces, tierDefinitions } from '../data/zambiaData';

interface ProvinceDetailProps {
  provinceId: string;
  onClose?: () => void;
}

export const ProvinceDetail: React.FC<ProvinceDetailProps> = ({ provinceId, onClose }) => {
  const province = provinces[provinceId];

  if (!province) return null;

  const metrics = [
    { label: 'HIV', value: province.hiv, unit: '%', danger: 12 },
    { label: 'Malaria', value: province.malaria, unit: '/1K', danger: 300 },
    { label: 'Diabetes', value: province.diabetes, unit: '%', danger: 4 },
    { label: 'CVD', value: province.cvd, unit: '%', danger: 6 },
    { label: 'Obesity', value: province.obesity, unit: '%', danger: 15 },
    { label: 'Hypertension', value: province.hypertension, unit: '%', danger: 25 },
  ];

  const infrastructure = [
    { label: 'Hospital Beds', value: province.bedsPerCapita, unit: '/10K', good: 12 },
    { label: 'Primary Care', value: province.phcPerCapita, unit: '/10K', good: 1.5 },
    { label: 'Physicians', value: province.physicians, unit: '/10K', good: 0.8 },
    { label: 'Hospitals', value: province.hospitals, unit: '', good: 10 },
  ];

  const tierColor = tierDefinitions[province.tier].color;
  const trendColor = province.trend === 'improving' ? 'var(--accent-success)' :
                     province.trend === 'worsening' ? 'var(--accent-danger)' :
                     'var(--text-muted)';

  return (
    <div className="province-panel slide-in">
      {/* Header */}
      <div
        className="province-panel-header"
        style={{
          background: `linear-gradient(135deg, ${tierColor}15, transparent)`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="province-name">{province.name}</h2>
            <div className="province-meta">
              Capital: {province.capital} | {(province.population / 1000000).toFixed(2)}M population
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-tertiary)',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Close
            </button>
          )}
        </div>
        <div className="province-badges">
          <span
            className="tier-badge"
            style={{
              background: `${tierColor}20`,
              color: tierColor,
            }}
          >
            {tierDefinitions[province.tier].label}
          </span>
          <span
            className="trend-badge"
            style={{ color: trendColor }}
          >
            {province.trend === 'improving' ? '↑ Improving' :
             province.trend === 'worsening' ? '↓ Worsening' :
             '→ Stable'}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="province-metrics">
        <div className="metrics-section">
          <div className="metrics-section-title">Disease Prevalence</div>
          <div className="metrics-grid">
            {metrics.map((m, i) => (
              <div key={i} className="metric-item">
                <div className="metric-label">{m.label}</div>
                <div
                  className="metric-value"
                  style={{
                    color: m.value >= m.danger ? 'var(--accent-danger)' : 'var(--text-primary)',
                  }}
                >
                  {m.value}{m.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="metrics-section">
          <div className="metrics-section-title">Healthcare Infrastructure</div>
          <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {infrastructure.map((m, i) => (
              <div key={i} className="metric-item">
                <div className="metric-label">{m.label}</div>
                <div
                  className="metric-value"
                  style={{
                    color: m.value >= m.good ? 'var(--accent-success)' : 'var(--accent-warning)',
                  }}
                >
                  {m.value}{m.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mortality Section */}
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--accent-danger-dim)',
            borderRadius: 8,
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <div style={{
            fontSize: 11,
            color: 'var(--accent-danger)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Annual Mortality per 100,000
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                {province.hivMortality.toLocaleString()}
              </span>
              <span style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginLeft: 6,
              }}>
                HIV
              </span>
            </div>
            <div>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                {province.malariaMortality.toLocaleString()}
              </span>
              <span style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginLeft: 6,
              }}>
                Malaria
              </span>
            </div>
            <div>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                {province.cvdMortality.toLocaleString()}
              </span>
              <span style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginLeft: 6,
              }}>
                CVD
              </span>
            </div>
            <div>
              <span style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                {province.diabetesMortality.toLocaleString()}
              </span>
              <span style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginLeft: 6,
              }}>
                Diabetes
              </span>
            </div>
          </div>
        </div>

        {/* Undiagnosed Risk */}
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--bg-tertiary)',
            borderRadius: 8,
          }}
        >
          <div style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Undiagnosed Risk Level
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 600,
              color: province.undiagnosedRisk === 'very high' ? 'var(--accent-danger)' :
                     province.undiagnosedRisk === 'high' ? 'var(--accent-warning)' :
                     'var(--text-primary)',
              textTransform: 'capitalize',
            }}>
              {province.undiagnosedRisk}
            </span>
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
            }}>
              - Priority for screening programs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvinceDetail;
