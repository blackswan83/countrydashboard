import React from 'react';
import { vision2030KPIs } from '../data/ksaData';

const statusColors = {
  'on-track': 'var(--accent-success)',
  'at-risk': 'var(--accent-warning)',
  'off-track': 'var(--accent-danger)',
};

export const Vision2030Tracker: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Vision 2030 Health KPIs</span>
        <span className="card-badge live">LIVE TRACKING</span>
      </div>
      <div className="card-body">
        <div className="kpi-list">
          {vision2030KPIs.map((kpi) => {
            // Calculate progress percentage
            const range = kpi.target - kpi.baseline;
            const progress = kpi.current - kpi.baseline;
            const percent = Math.min(Math.max((progress / range) * 100, 0), 100);

            return (
              <div key={kpi.id} className="kpi-item">
                <div className="kpi-header">
                  <span className="kpi-name">{kpi.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="kpi-value"
                      style={{ color: statusColors[kpi.status] }}
                    >
                      {kpi.current}
                      {kpi.unit.includes('%') || kpi.unit === 'index' ? '' : ` ${kpi.unit}`}
                      {kpi.unit.includes('%') && '%'}
                    </span>
                    <span className={`kpi-status ${kpi.status}`}>
                      {kpi.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="kpi-progress">
                  <div
                    className="kpi-progress-bar"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: statusColors[kpi.status],
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}>
                  <span>Baseline: {kpi.baseline}{kpi.unit.includes('%') ? '%' : ''}</span>
                  <span>Target: {kpi.target}{kpi.unit.includes('%') ? '%' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: 'var(--bg-tertiary)',
          borderRadius: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>ON TRACK</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-success)' }}>
              {vision2030KPIs.filter(k => k.status === 'on-track').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>AT RISK</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-warning)' }}>
              {vision2030KPIs.filter(k => k.status === 'at-risk').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>OFF TRACK</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-danger)' }}>
              {vision2030KPIs.filter(k => k.status === 'off-track').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vision2030Tracker;
