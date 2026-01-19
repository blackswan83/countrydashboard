interface AgeGroup {
  label: string;
  healthy: number;
  atRisk: number;
  ncd: number;
}

// Age distribution based on GASTAT Census 2022 (total 35.3M)
// Health status based on NCD prevalence data (16.4% diabetes, 58% undiagnosed)
const ageGroups: AgeGroup[] = [
  { label: '80+', healthy: 0.08, atRisk: 0.10, ncd: 0.12 },    // 0.3M total
  { label: '70-79', healthy: 0.27, atRisk: 0.32, ncd: 0.31 },  // 0.9M total
  { label: '60-69', healthy: 0.84, atRisk: 0.63, ncd: 0.63 },  // 2.1M total
  { label: '50-59', healthy: 2.26, atRisk: 1.03, ncd: 0.82 },  // 4.1M total
  { label: '40-49', healthy: 3.71, atRisk: 1.06, ncd: 0.53 },  // 5.3M total
  { label: '30-39', healthy: 5.70, atRisk: 0.80, ncd: 0.20 },  // 6.7M total
  { label: '20-29', healthy: 5.70, atRisk: 0.24, ncd: 0.06 },  // 6.0M total
  { label: '10-19', healthy: 4.56, atRisk: 0.19, ncd: 0.05 },  // 4.8M total
  { label: '0-9', healthy: 4.90, atRisk: 0.15, ncd: 0.05 },    // 5.1M total
];

export const PopulationPyramid: React.FC = () => {
  const maxWidth = 7; // Max bar width based on largest age group (~6.7M)

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

        {/* Summary Stats - Totals: 28.0M healthy + 4.5M at risk + 2.8M NCD = 35.3M */}
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
              28.0M
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#8B8B8B', textTransform: 'uppercase', marginBottom: 4 }}>
              At Risk
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#D4A574' }}>
              4.5M
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#8B8B8B', textTransform: 'uppercase', marginBottom: 4 }}>
              NCD Diagnosed
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#C75B5B' }}>
              2.8M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopulationPyramid;
