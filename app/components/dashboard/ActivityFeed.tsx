'use client';
import React from 'react';

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  isLoading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Activité récente',
  isLoading = false,
}) => {
  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50/80 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/20';
      case 'info':
        return 'bg-blue-50/80 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/20';
      case 'warning':
        return 'bg-amber-50/80 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/20';
      case 'error':
        return 'bg-red-50/80 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/20';
      default:
        return 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800';
    }
  };

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 flex flex-col h-full border border-zinc-200 dark:border-zinc-800/80 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          {title}
        </h3>
      </div>
      
      <div className="p-6 flex-1">
        <div className="space-y-4">
          {isLoading ? (
            // Skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-${i}`} className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">Aucune activité récente</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">Les dernières actions apparaîtront ici.</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm ${getTypeColor(
                  activity.type
                )}`}
              >
                <div className="flex-shrink-0 mt-0.5 transition-transform duration-300 hover:scale-110">
                  {getTypeIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {activity.title}
                    </p>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 shrink-0 ml-2 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;

