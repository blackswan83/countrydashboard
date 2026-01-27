import React from 'react';
import { provinces, nationalStats } from '../data/zambiaData';

export const HealthcareInfrastructure: React.FC = () => {
  // Sort provinces by beds per capita
  const bedsSorted = Object.values(provinces)
    .sort((a, b) => b.bedsPerCapita - a.bedsPerCapita);

  // Calculate totals
  const totalHospitals = Object.values(provinces).reduce((sum, p) => sum + p.hospitals, 0);
  const avgBeds = Object.values(provinces).reduce((sum, p) => sum + p.bedsPerCapita, 0) / 13;
  const avgPhysicians = Object.values(provinces).reduce((sum, p) => sum + p.physicians, 0) / 13;

  // Identify gaps
  const underserved = Object.values(provinces).filter(p => p.bedsPerCapita < 23);
  const wellServed = Object.values(provinces).filter(p => p.bedsPerCapita >= 30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Stats */}
      <div className="stats-grid stats-grid-5">
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-primary)' }} />
          <div className="stat-card-label">Total Hospitals</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-primary)' }}>
            {totalHospitals}
          </div>
          <div className="stat-card-subtext">Across 13 provinces</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-secondary)' }} />
          <div className="stat-card-label">Total Hospital Beds</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-secondary)' }}>
            {(nationalStats.totalBeds / 1000).toFixed(0)}K
          </div>
          <div className="stat-card-subtext">{avgBeds.toFixed(1)} avg per 10K</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--nuraxi-gold)' }} />
          <div className="stat-card-label">Total Physicians</div>
          <div className="stat-card-value" style={{ color: 'var(--nuraxi-gold)' }}>
            {(nationalStats.totalPhysicians / 1000).toFixed(0)}K
          </div>
          <div className="stat-card-subtext">{avgPhysicians.toFixed(1)} avg per 10K</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-warning)' }} />
          <div className="stat-card-label">Health Expenditure</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-warning)' }}>
            {nationalStats.healthExpenditure}%
          </div>
          <div className="stat-card-subtext">of GDP</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-accent" style={{ backgroundColor: 'var(--accent-danger)' }} />
          <div className="stat-card-label">Private Sector Share</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-danger)' }}>
            {nationalStats.privateHealthShare}%
          </div>
          <div className="stat-card-subtext">of healthcare market</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid content-grid-sidebar">
        {/* Beds Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hospital Beds Distribution (per 10,000 population)</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              WHO recommendation: 25 beds/10K
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bedsSorted.map((p) => {
                const percentage = (p.bedsPerCapita / 40) * 100;
                const color = p.bedsPerCapita >= 30 ? 'var(--accent-success)' :
                              p.bedsPerCapita >= 25 ? 'var(--accent-primary)' :
                              p.bedsPerCapita >= 22 ? 'var(--accent-warning)' :
                              'var(--accent-danger)';

                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 120,
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.name}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: 20,
                        background: 'var(--bg-tertiary)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: color,
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                        }} />
                        {/* WHO line */}
                        <div style={{
                          position: 'absolute',
                          left: `${(25 / 40) * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          background: 'var(--text-muted)',
                          opacity: 0.5,
                        }} />
                      </div>
                    </div>
                    <div style={{
                      width: 50,
                      textAlign: 'right',
                      fontSize: 13,
                      fontWeight: 600,
                      color,
                    }}>
                      {p.bedsPerCapita}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--accent-success)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Excellent (30+)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--accent-primary)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Good (25-30)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--accent-warning)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Moderate (22-25)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--accent-danger)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Below Standard (&lt;22)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gap Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Infrastructure Gap Analysis</span>
            </div>
            <div className="card-body">
              <div style={{
                padding: 16,
                background: 'var(--accent-danger-dim)',
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: 'var(--accent-danger)', marginBottom: 4 }}>
                  UNDERSERVED PROVINCES
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {underserved.length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {underserved.map(p => p.name).join(', ')}
                </div>
              </div>

              <div style={{
                padding: 16,
                background: 'var(--accent-success-dim)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 11, color: 'var(--accent-success)', marginBottom: 4 }}>
                  WELL-SERVED PROVINCES
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {wellServed.length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {wellServed.map(p => p.name).join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Investment Priorities</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  padding: 12,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Makkah Region
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Needs ~4,000 additional beds to meet WHO standards for Hajj season capacity
                  </div>
                </div>
                <div style={{
                  padding: 12,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Jazan Region
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Lowest beds per capita - priority for specialist center development
                  </div>
                </div>
                <div style={{
                  padding: 12,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Primary Care Expansion
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Digital health centers needed in rural areas of Riyadh, Makkah
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Vision 2030 Healthcare Goals</span>
            </div>
            <div className="card-body" style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Increase private sector contribution to 35%</li>
                <li>100% EHR adoption across all facilities</li>
                <li>Achieve 30 beds per 10,000 population nationally</li>
                <li>Reduce emergency room waiting times by 50%</li>
                <li>Establish 5 medical cities across regions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareInfrastructure;
