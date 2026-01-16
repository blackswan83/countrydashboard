import React, { useState, useMemo } from 'react';
import { provinces, tierDefinitions, type ProvinceData } from '../data/ksaData';

interface ProvinceTableProps {
  selectedProvince: string | null;
  onProvinceSelect: (provinceId: string | null) => void;
}

type SortKey = keyof ProvinceData | 'name' | 'population' | 'diabetes' | 'hypertension' | 'obesity' | 'bedsPerCapita' | 'inactivity' | 'tier' | 'trend';

export const ProvinceTable: React.FC<ProvinceTableProps> = ({
  selectedProvince,
  onProvinceSelect,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('tier');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedProvinces = useMemo(() => {
    return Object.entries(provinces).sort(([, a], [, b]) => {
      const aVal = a[sortKey as keyof ProvinceData];
      const bVal = b[sortKey as keyof ProvinceData];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Province' },
    { key: 'population', label: 'Population' },
    { key: 'diabetes', label: 'Diabetes %' },
    { key: 'hypertension', label: 'HTN %' },
    { key: 'obesity', label: 'Obesity %' },
    { key: 'bedsPerCapita', label: 'Beds/10K' },
    { key: 'inactivity', label: 'Inactive %' },
    { key: 'tier', label: 'Priority' },
    { key: 'trend', label: 'Trend' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Provincial Health Comparison</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Click headers to sort | Click row for details
        </span>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span style={{ marginLeft: 4 }}>
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedProvinces.map(([key, p]) => {
              const tierDef = tierDefinitions[p.tier];
              return (
                <tr
                  key={key}
                  className={selectedProvince === key ? 'selected' : ''}
                  onClick={() => onProvinceSelect(selectedProvince === key ? null : key)}
                >
                  <td>
                    <div className="province-cell">
                      <div
                        className="province-dot"
                        style={{ backgroundColor: tierDef.color }}
                      />
                      <div className="province-info">
                        <span className="province-info-name">{p.name}</span>
                        <span className="province-info-ar">{p.nameAr}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {(p.population / 1000000).toFixed(2)}M
                  </td>
                  <td>
                    <span style={{
                      color: p.diabetes > 8 ? 'var(--accent-danger)' :
                             p.diabetes > 7 ? 'var(--accent-warning)' :
                             'var(--text-secondary)',
                      fontWeight: p.diabetes > 8 ? 600 : 400,
                    }}>
                      {p.diabetes}%
                    </span>
                  </td>
                  <td>
                    <span style={{
                      color: p.hypertension > 8 ? 'var(--accent-danger)' :
                             'var(--text-secondary)',
                    }}>
                      {p.hypertension}%
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {p.obesity}%
                  </td>
                  <td>
                    <span style={{
                      color: p.bedsPerCapita < 23 ? 'var(--accent-danger)' :
                             'var(--accent-success)',
                    }}>
                      {p.bedsPerCapita}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {p.inactivity}%
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      background: `${tierDef.color}20`,
                      color: tierDef.color,
                    }}>
                      {tierDef.label}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      color: p.trend === 'improving' ? 'var(--accent-success)' :
                             p.trend === 'worsening' ? 'var(--accent-danger)' :
                             'var(--text-muted)',
                    }}>
                      {p.trend === 'improving' ? '↑' :
                       p.trend === 'worsening' ? '↓' : '→'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvinceTable;
