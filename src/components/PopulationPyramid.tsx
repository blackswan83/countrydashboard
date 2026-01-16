interface AgeGroup {
  label: string;
  healthy: number;
  atRisk: number;
  ncd: number;
}

const ageGroups: AgeGroup[] = [
  { label: '80+', healthy: 0.3, atRisk: 0.15, ncd: 0.05 },
  { label: '70-79', healthy: 1.2, atRisk: 0.8, ncd: 0.4 },
  { label: '60-69', healthy: 2.5, atRisk: 1.8, ncd: 1.2 },
  { label: '50-59', healthy: 4.0, atRisk: 2.5, ncd: 1.5 },
  { label: '40-49', healthy: 5.5, atRisk: 2.0, ncd: 0.8 },
  { label: '30-39', healthy: 7.0, atRisk: 1.2, ncd: 0.3 },
  { label: '20-29', healthy: 8.5, atRisk: 0.5, ncd: 0.1 },
  { label: '10-19', healthy: 6.5, atRisk: 0.2, ncd: 0.05 },
  { label: '0-9', healthy: 5.8, atRisk: 0.1, ncd: 0.02 },
];

export const PopulationPyramid: React.FC = () => {
  const maxWidth = 12;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Population by Age & Health Status</span>
        <span className="card-badge" style={{ background: 'rgba(139, 115, 85, 0.1)', color: '#8B7355' }}>
          35.3M TOTAL
        </span>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ageGroups.map((group, i) => {
            const total = group.healthy + group.atRisk + group.ncd;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 50,
                  fontSize: 12,
                  color: '#6B6B6B',
                  textAlign: 'right',
                  fontWeight: 500,
                }}>
                  {group.label}
                </div>
                <div style={{
                  flex: 1,
                  height: 22,
                  display: 'flex',
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#F5F0EB',
                }}>
                  <div style={{
                    width: `${(group.healthy / maxWidth) * 100}%`,
                    background: '#4A7C59',
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{
                    width: `${(group.atRisk / maxWidth) * 100}%`,
                    background: '#D4A574',
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{
                    width: `${(group.ncd / maxWidth) * 100}%`,
                    background: '#C75B5B',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{
                  width: 45,
                  fontSize: 12,
                  color: '#8B8B8B',
                  fontWeight: 500,
                }}>
                  {total.toFixed(1)}M
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          gap: 24,
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid rgba(139, 115, 85, 0.1)',
          fontSize: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#4A7C59' }} />
            <span style={{ color: '#6B6B6B' }}>Healthy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#D4A574' }} />
            <span style={{ color: '#6B6B6B' }}>At Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#C75B5B' }} />
            <span style={{ color: '#6B6B6B' }}>Diagnosed NCD</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 20,
          padding: 16,
          background: '#F5F0EB',
          borderRadius: 12,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#8B8B8B', textTransform: 'uppercase', marginBottom: 4 }}>
              Healthy Pop
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4A7C59' }}>
              41.3M
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#8B8B8B', textTransform: 'uppercase', marginBottom: 4 }}>
              At Risk
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#D4A574' }}>
              9.3M
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#8B8B8B', textTransform: 'uppercase', marginBottom: 4 }}>
              NCD Diagnosed
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#C75B5B' }}>
              4.4M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopulationPyramid;
