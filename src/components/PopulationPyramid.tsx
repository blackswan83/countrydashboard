interface AgeGroup {
  label: string;
  healthy: number;
  atRisk: number;
  ncd: number;
}

// Theme colors for dark mode support
const getThemeColors = (darkMode: boolean) => ({
  chartBg: darkMode ? '#1E2A3A' : '#F5F0EB',
  textSecondary: darkMode ? '#9CA3AF' : '#6B6B6B',
  textMuted: darkMode ? '#6B7280' : '#8B8B8B',
  primary: darkMode ? '#C4A77D' : '#8B7355',
  danger: darkMode ? '#E06B6B' : '#C75B5B',
  success: darkMode ? '#5B9A6E' : '#4A7C59',
  warning: darkMode ? '#E8B584' : '#D4A574',
  border: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 115, 85, 0.1)',
});

interface PopulationPyramidProps {
  darkMode?: boolean;
}

// Age distribution based on Zambia CSO 2022 estimates (total 19.6M)
// Health status based on NCD prevalence data (3.5% diabetes, HIV 11.1%)
const ageGroups: AgeGroup[] = [
  { label: '80+', healthy: 0.04, atRisk: 0.03, ncd: 0.03 },    // 0.1M total
  { label: '70-79', healthy: 0.12, atRisk: 0.10, ncd: 0.08 },  // 0.3M total
  { label: '60-69', healthy: 0.28, atRisk: 0.18, ncd: 0.14 },  // 0.6M total
  { label: '50-59', healthy: 0.70, atRisk: 0.35, ncd: 0.25 },  // 1.3M total
  { label: '40-49', healthy: 1.20, atRisk: 0.45, ncd: 0.35 },  // 2.0M total
  { label: '30-39', healthy: 1.80, atRisk: 0.50, ncd: 0.30 },  // 2.6M total
  { label: '20-29', healthy: 2.40, atRisk: 0.40, ncd: 0.20 },  // 3.0M total
  { label: '10-19', healthy: 3.20, atRisk: 0.30, ncd: 0.10 },  // 3.6M total
  { label: '0-9', healthy: 5.50, atRisk: 0.30, ncd: 0.10 },    // 5.9M total
];

export const PopulationPyramid: React.FC<PopulationPyramidProps> = ({ darkMode = false }) => {
  const maxWidth = 6; // Max bar width based on largest age group (~5.9M)
  const colors = getThemeColors(darkMode);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Population by Age & Health Status</span>
        <span className="card-badge" style={{ background: `${colors.primary}15`, color: colors.primary }}>
          19.6M TOTAL
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
                  color: colors.textSecondary,
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
                  background: colors.chartBg,
                }}>
                  <div style={{
                    width: `${(group.healthy / maxWidth) * 100}%`,
                    background: colors.success,
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{
                    width: `${(group.atRisk / maxWidth) * 100}%`,
                    background: colors.warning,
                    transition: 'width 0.5s ease',
                  }} />
                  <div style={{
                    width: `${(group.ncd / maxWidth) * 100}%`,
                    background: colors.danger,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{
                  width: 45,
                  fontSize: 12,
                  color: colors.textMuted,
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
          borderTop: `1px solid ${colors.border}`,
          fontSize: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: colors.success }} />
            <span style={{ color: colors.textSecondary }}>Healthy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: colors.warning }} />
            <span style={{ color: colors.textSecondary }}>At Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: colors.danger }} />
            <span style={{ color: colors.textSecondary }}>Diagnosed NCD</span>
          </div>
        </div>

        {/* Summary Stats - Totals: 15.2M healthy + 2.6M at risk + 1.6M NCD = 19.6M */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 20,
          padding: 16,
          background: colors.chartBg,
          borderRadius: 12,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              Healthy Pop
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.success }}>
              15.2M
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              At Risk
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.warning }}>
              2.6M
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              NCD Diagnosed
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.danger }}>
              1.6M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopulationPyramid;
