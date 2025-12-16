'use client';
import React from 'react';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`group relative rounded-2xl bg-white dark:bg-zinc-900 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 border border-zinc-200 dark:border-zinc-800 ${
            action.color || 'hover:border-blue-500'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                action.color
                  ? `bg-gradient-to-br ${action.color}`
                  : 'bg-gradient-to-br from-blue-500 to-purple-500'
              }`}
            >
              <div className="text-white">{action.icon}</div>
            </div>
            <span className="text-sm font-medium text-black dark:text-zinc-50 text-center">
              {action.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;

