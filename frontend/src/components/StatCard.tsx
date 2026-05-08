import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

const StatCard = ({ label, value, subValue, trend, color }: StatCardProps) => {
  return (
    <div className={`kc bg-white border border-border rounded-r p-2.5 border-t-2`} style={{ borderTopColor: color || 'var(--color-border)' }}>
      <div className="kl text-[10px] text-gray-600 mb-0.5 font-medium uppercase tracking-wider">{label}</div>
      <div className="kv text-[17px] font-semibold text-black leading-tight">{value}</div>
      {subValue && (
        <div className={`ks text-[10px] mt-0.5 ${trend === 'up' ? 'text-ok' : trend === 'down' ? 'text-bad' : 'text-gray-400'}`}>
          {subValue}
        </div>
      )}
    </div>
  );
};

export default StatCard;
