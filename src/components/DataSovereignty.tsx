import { useState } from 'react';

// Provincial data nodes for the federated diagram
const provincialNodes = [
  { id: 'riyadh', name: 'Riyadh', twins: '8.6M' },
  { id: 'makkah', name: 'Makkah', twins: '8.0M' },
  { id: 'eastern', name: 'Eastern', twins: '5.1M' },
  { id: 'other', name: '10 Others', twins: '13.6M' },
];

// Federated Architecture Diagram
const FederatedDiagram: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Swiss Vault */}
      <div style={{
        background: 'linear-gradient(135deg, #DC0018 0%, #B80014 100%)',
        borderRadius: 16,
        padding: '24px 32px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 40 }}>🇨🇭</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Swiss Intelligence Vault
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>
              Neutral Ground • Zero Personal Data
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              Only aggregated model weights cross borders — never individual health records
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>PROCESSING</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>Intelligence Only</div>
          </div>
        </div>
      </div>

      {/* Flow Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '12px 0',
        color: '#8B7355',
      }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #C4A77D)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500 }}>
          <span>↑</span>
          <span>Intelligence flows UP</span>
          <span>↑</span>
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #C4A77D, transparent)' }} />
      </div>

      {/* Provincial Nodes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
      }}>
        {provincialNodes.map(node => (
          <div
            key={node.id}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              background: hoveredNode === node.id ? '#F5F0EB' : '#FFFFFF',
              border: '2px solid',
              borderColor: hoveredNode === node.id ? '#4A7C59' : 'rgba(139, 115, 85, 0.2)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center',
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#3D3D3D' }}>{node.name}</div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{node.twins} twins</div>
            <div style={{
              marginTop: 8,
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: '#4A7C59',
              fontWeight: 600,
            }}>
              LOCAL DATA
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Label */}
      <div style={{
        textAlign: 'center',
        marginTop: 16,
        padding: '12px 24px',
        background: 'rgba(74, 124, 89, 0.1)',
        borderRadius: 8,
        border: '1px solid rgba(74, 124, 89, 0.2)',
      }}>
        <span style={{ fontSize: 12, color: '#4A7C59', fontWeight: 600 }}>
          🛡️ Data remains in-Kingdom under Saudi sovereignty • Never extracted • Never centralized
        </span>
      </div>
    </div>
  );
};

// Big Tech Comparison Table
const ComparisonTable: React.FC = () => {
  const comparisons = [
    { aspect: 'Data Ownership', bigTech: 'They own your data', nuraxi: 'You own your data' },
    { aspect: 'Data Location', bigTech: 'Centralized in their cloud', nuraxi: 'Stays in-Kingdom' },
    { aspect: 'Architecture', bigTech: 'Extract everything', nuraxi: 'Federated learning' },
    { aspect: 'Alignment', bigTech: 'Shareholder interests', nuraxi: 'Swiss neutrality' },
    { aspect: 'Profit Model', bigTech: 'Your information', nuraxi: 'Aggregated insights only' },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontSize: 11,
        color: '#8B8B8B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
      }}>
        The Difference
      </div>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid rgba(139, 115, 85, 0.15)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr 1fr',
          background: '#F5F0EB',
          borderBottom: '1px solid rgba(139, 115, 85, 0.15)',
        }}>
          <div style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#6B6B6B' }}></div>
          <div style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#C75B5B', textAlign: 'center' }}>
            Big Tech
          </div>
          <div style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#4A7C59', textAlign: 'center' }}>
            Nuraxi
          </div>
        </div>
        {/* Rows */}
        {comparisons.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr',
              borderBottom: i < comparisons.length - 1 ? '1px solid rgba(139, 115, 85, 0.1)' : 'none',
            }}
          >
            <div style={{
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: 500,
              color: '#3D3D3D',
              background: '#F5F0EB',
            }}>
              {row.aspect}
            </div>
            <div style={{
              padding: '12px 16px',
              fontSize: 12,
              color: '#C75B5B',
              textAlign: 'center',
              background: 'rgba(199, 91, 91, 0.03)',
            }}>
              {row.bigTech}
            </div>
            <div style={{
              padding: '12px 16px',
              fontSize: 12,
              color: '#4A7C59',
              fontWeight: 500,
              textAlign: 'center',
              background: 'rgba(74, 124, 89, 0.03)',
            }}>
              {row.nuraxi}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Trust Checkmarks
const TrustIndicators: React.FC = () => {
  const indicators = [
    'Data never leaves the Kingdom',
    'Zero personal data extraction',
    'Swiss-grade privacy architecture',
    'Neutral, non-aligned governance',
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
      marginTop: 24,
    }}>
      {indicators.map((text, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: '#F5F0EB',
          borderRadius: 8,
        }}>
          <span style={{ color: '#4A7C59', fontSize: 16 }}>✓</span>
          <span style={{ fontSize: 12, color: '#3D3D3D' }}>{text}</span>
        </div>
      ))}
    </div>
  );
};

// Main Export: Data Sovereignty Section
export const DataSovereigntySection: React.FC = () => {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🇨🇭</span>
          <span className="card-title">Sovereign Architecture</span>
        </div>
        <span className="card-badge" style={{
          background: 'rgba(220, 0, 24, 0.1)',
          color: '#DC0018',
          border: '1px solid rgba(220, 0, 24, 0.2)',
        }}>
          SWISS PRIVACY
        </span>
      </div>
      <div className="card-body">
        {/* Narrative */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(90deg, #F5F0EB, rgba(220, 0, 24, 0.05))',
          borderRadius: 12,
          borderLeft: '4px solid #DC0018',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, color: '#3D3D3D', lineHeight: 1.7 }}>
            <strong style={{ color: '#8B7355' }}>Like Swiss banking redefined financial privacy, Nuraxi redefines health data sovereignty.</strong>
            {' '}We sit underneath your infrastructure, not on top. We don't own your data — we never even see it.
            Only aggregated intelligence flows to our neutral Swiss vault, while every health record remains exactly
            where it belongs: under Saudi sovereignty, free from big tech's reach.
          </div>
        </div>

        {/* Federated Diagram */}
        <FederatedDiagram />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* Trust Indicators */}
        <TrustIndicators />

        {/* Swiss Neutrality Quote */}
        <div style={{
          marginTop: 24,
          padding: 20,
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid rgba(139, 115, 85, 0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#6B6B6B', fontStyle: 'italic', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            "Switzerland has protected the world's most sensitive assets for centuries through one principle: <strong style={{ color: '#DC0018' }}>neutrality</strong>.
            No allegiance to any power. No agenda beyond privacy. Nuraxi brings this same principle to health intelligence."
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#8B7355', fontWeight: 600 }}>
            Swiss Neutrality • Saudi Sovereignty
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSovereigntySection;
