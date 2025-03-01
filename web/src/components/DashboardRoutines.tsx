import React from 'react';
import { RoutineList } from './RoutineList';

interface DashboardRoutinesProps {
  onRoutinesChange: () => void;
}

/**
 * DashboardRoutines component - Displays the routines tab content
 * 
 * This component has been extracted from the main Dashboard component
 * to improve performance by reducing re-renders.
 */
const DashboardRoutines = React.memo(({ onRoutinesChange }: DashboardRoutinesProps) => {
  return (
    <div className="space-y-4">
      {/* Routines Header - Updated with better text contrast for light mode */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/60 via-purple-500/50 to-purple-400/40 dark:from-purple-500/20 dark:via-purple-500/15 dark:to-background border border-purple-500/40 dark:border-purple-500/30 p-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-900 dark:text-purple-400 text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-purple-500/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Daily Routines
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-purple-950 dark:text-purple-200">
              Your Routines
            </h2>
            <p className="text-purple-800 dark:text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-purple-500/30 shadow-sm">
              Create and customize your morning and evening skincare routines for optimal results.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-16 w-16 rounded-2xl bg-purple-500/40 flex items-center justify-center shadow-glow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-purple-950 dark:text-purple-400"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Routines List */}
      <RoutineList onRoutinesChange={onRoutinesChange} />
    </div>
  );
});

DashboardRoutines.displayName = 'DashboardRoutines';

export default DashboardRoutines; 