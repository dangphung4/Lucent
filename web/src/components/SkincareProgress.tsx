import { Card, CardContent } from "./ui/card";
import { TrendingUp, Calendar, ScrollText, CheckCircle2 } from "lucide-react";
import { JournalEntry, ProgressLog, getRoutineCompletions } from "@/lib/db";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

interface SkincareProgressProps {
  journalEntries: JournalEntry[];
  progressLogs: ProgressLog[];
}

interface RoutineStats {
  morning: number;
  evening: number;
  weekly: number;
  total: number;
}

export function SkincareProgress({ progressLogs }: SkincareProgressProps) {
  const { currentUser } = useAuth();
  const [routineStats, setRoutineStats] = useState<RoutineStats>({
    morning: 0,
    evening: 0,
    weekly: 0,
    total: 0
  });
  const [recentConcerns, setRecentConcerns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutineCompletions = async () => {
      if (!currentUser) return;

      try {
        // Get completions for the last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const completions = await getRoutineCompletions(
          currentUser.uid,
          thirtyDaysAgo,
          now
        );

        // Calculate routine type percentages
        const stats = completions.reduce((acc, completion) => {
          const completedSteps = completion.completedSteps.filter(step => step.completed).length;
          const totalSteps = completion.completedSteps.length;
          
          if (completedSteps > 0) {
            const completionRate = completedSteps / totalSteps;
            
            switch (completion.type) {
              case 'morning':
                acc.morning++;
                break;
              case 'evening':
                acc.evening++;
                break;
              case 'weekly':
                acc.weekly++;
                break;
            }
            
            acc.total += completionRate;
          }
          
          return acc;
        }, { morning: 0, evening: 0, weekly: 0, total: 0 });

        // Calculate percentages
        const totalDays = 30;
        const expectedMorning = totalDays;
        const expectedEvening = totalDays;
        const expectedWeekly = 4; // Approximately 4 weeks in 30 days

        setRoutineStats({
          morning: Math.round((stats.morning / expectedMorning) * 100),
          evening: Math.round((stats.evening / expectedEvening) * 100),
          weekly: Math.round((stats.weekly / expectedWeekly) * 100),
          total: Math.round((stats.total / completions.length) * 100) || 0
        });

      } catch (error) {
        console.error('Error fetching routine completions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Analyze recent skin concerns
    const analyzeConcerns = () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const recentLogs = progressLogs.filter(log => {
        const logDate = log.date instanceof Date ? log.date : new Date(log.date);
        return logDate >= thirtyDaysAgo && logDate <= now;
      });

      const concerns = recentLogs
        .flatMap(log => log.concerns || [])
        .filter(Boolean);

      const concernCounts = concerns.reduce((acc, concern) => {
        acc[concern] = (acc[concern] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topConcerns = Object.entries(concernCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([concern]) => concern);

      setRecentConcerns(topConcerns);
    };

    fetchRoutineCompletions();
    analyzeConcerns();
  }, [currentUser, progressLogs]);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Skincare Progress</h2>
        </div>

        <div className="space-y-6">
          {/* Routine Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-medium">30-Day Routine Stats</h3>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-purple-100/50 rounded-md" />
                <div className="h-8 bg-purple-100/50 rounded-md" />
                <div className="h-8 bg-purple-100/50 rounded-md" />
              </div>
            ) : (
              <div className="grid gap-2">
                {/* Morning Routine */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Morning Routine</span>
                    <span className="font-medium">{routineStats.morning}%</span>
                  </div>
                  <div className="h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${routineStats.morning}%` }}
                    />
                  </div>
                </div>

                {/* Evening Routine */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Evening Routine</span>
                    <span className="font-medium">{routineStats.evening}%</span>
                  </div>
                  <div className="h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${routineStats.evening}%` }}
                    />
                  </div>
                </div>

                {/* Weekly Routine */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Routine</span>
                    <span className="font-medium">{routineStats.weekly}%</span>
                  </div>
                  <div className="h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${routineStats.weekly}%` }}
                    />
                  </div>
                </div>

                {/* Overall Completion */}
                <div className="mt-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Overall Completion</span>
                    </div>
                    <span className="text-lg font-semibold">{routineStats.total}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {routineStats.total < 30 
                      ? "Try to be more consistent with your routines"
                      : routineStats.total < 70
                      ? "Good progress! Keep building those habits"
                      : "Excellent routine consistency!"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Skin Concerns Analysis */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-medium">Recent Skin Concerns</h3>
            </div>
            {recentConcerns.length > 0 ? (
              <div className="space-y-1">
                {recentConcerns.map((concern, index) => (
                  <div
                    key={index}
                    className="text-sm px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-md"
                  >
                    {concern}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent skin concerns logged. Add progress logs to track your concerns.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 