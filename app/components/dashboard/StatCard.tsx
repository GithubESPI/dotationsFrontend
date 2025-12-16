'use client';
import React from 'react';
import MagicContainer from '../MagicContainer';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <MagicContainer className={className}>
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-black dark:text-zinc-50">
              {value}
            </p>
          </div>
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-2 mt-4">
            <span
              className={`text-sm font-medium ${
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </MagicContainer>
  );
};

export default StatCard;

