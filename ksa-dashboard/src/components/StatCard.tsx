import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  color?: string;
  small?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  color = 'var(--accent-primary)',
  small = false,
}) => {
  return (
    <div className="stat-card">
      <div
        className="stat-card-accent"
        style={{ backgroundColor: color }}
      />
      <div className="stat-card-label">{label}</div>
      <div
        className="stat-card-value"
        style={{
          color,
          fontSize: small ? '22px' : '28px',
        }}
      >
        {value}
        {trend !== undefined && (
          <span className={`stat-card-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtext && (
        <div className="stat-card-subtext">{subtext}</div>
      )}
    </div>
  );
};

export default StatCard;
