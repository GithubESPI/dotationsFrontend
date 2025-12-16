'use client';
import React from 'react';

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Activité récente',
}) => {
  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
    }
  };

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
            Aucune activité récente
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${getTypeColor(
                activity.type
              )} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex-shrink-0 mt-0.5">{getTypeIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-zinc-50 mb-1">
                  {activity.title}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                  {activity.description}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

