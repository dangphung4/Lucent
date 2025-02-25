import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Check, Loader2, Sun, Moon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import {
  CalendarProvider,
  CalendarHeader,
  CalendarBody,
  CalendarDate,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  Feature as BaseFeature,
  Status
} from './ui/calendar';
import {
  getUserRoutines,
  getUserProducts,
  getRoutineCompletions,
  addRoutineCompletion,
  updateRoutineCompletion,
  type Routine,
  type Product,
  type RoutineCompletion
} from '@/lib/db';
import { cn } from '@/lib/utils';

// Extend the Feature type to include our custom meta property
interface Feature extends BaseFeature {
  meta?: {
    hasMorning: boolean;
    hasEvening: boolean;
  };
}

// Status colors for different completion states
const STATUSES: Status[] = [
  { id: 'completed', name: 'Completed', color: '#22c55e' },
  { id: 'partial', name: 'Partially Complete', color: '#f59e0b' },
  { id: 'incomplete', name: 'Not Started', color: '#6b7280' },
];

export function Calendar() {
  const { currentUser } = useAuth();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [completions, setCompletions] = useState<RoutineCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);

  // Load routines and products
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const loadData = async () => {
      try {
        const [fetchedRoutines, fetchedProducts] = await Promise.all([
          getUserRoutines(currentUser.uid),
          getUserProducts(currentUser.uid)
        ]);
        setRoutines(fetchedRoutines);
        setProducts(fetchedProducts.filter(p => p.status === 'active'));
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error loading routines and products');
      }
    };
    
    loadData();
  }, [currentUser]);

  // Load completions for the current month
  useEffect(() => {
    if (!currentUser?.uid) return;
    setLoading(true);

    const loadCompletions = async () => {
      try {
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const fetchedCompletions = await getRoutineCompletions(
          currentUser.uid,
          startOfMonth,
          endOfMonth
        );
        
        setCompletions(fetchedCompletions);
        
        // Generate features for the calendar
        const newFeatures: Feature[] = [];
        
        // Group completions by date
        const completionsByDate = fetchedCompletions.reduce((acc, completion) => {
          const dateStr = completion.date.toDateString();
          if (!acc[dateStr]) {
            acc[dateStr] = [];
          }
          acc[dateStr].push(completion);
          return acc;
        }, {} as Record<string, RoutineCompletion[]>);
        
        // Create features for each date
        Object.entries(completionsByDate).forEach(([dateStr, dateCompletions]) => {
          const date = new Date(dateStr);
          const morningCompletions = dateCompletions.filter(c => c.type === 'morning');
          const eveningCompletions = dateCompletions.filter(c => c.type === 'evening');
          
          // Calculate total completion status
          const totalSteps = dateCompletions.reduce((sum, c) => sum + c.completedSteps.length, 0);
          const completedSteps = dateCompletions.reduce((sum, c) => 
            sum + c.completedSteps.filter(step => step.completed).length, 0
          );
          
          let status = STATUSES[2]; // Default to incomplete
          if (totalSteps > 0) {
            if (completedSteps === totalSteps) {
              status = STATUSES[0]; // Completed
            } else if (completedSteps > 0) {
              status = STATUSES[1]; // Partial
            }
          }
          
          // Create feature for this date - using icons instead of text
          newFeatures.push({
            id: `routine-${dateStr}`,
            name: '', // Empty name, we'll use icons in the renderer
            startAt: date,
            endAt: date,
            status,
            // Add custom properties for our renderer
            meta: {
              hasMorning: morningCompletions.length > 0,
              hasEvening: eveningCompletions.length > 0
            }
          });
        });
        
        setFeatures(newFeatures);
      } catch (error) {
        console.error('Error loading completions:', error);
        toast.error('Error loading routine completions');
      } finally {
        setLoading(false);
      }
    };
    
    loadCompletions();
  }, [currentUser, selectedDate]);

  // Get routines for the selected date and tab
  const getRoutinesForDate = () => {
    return routines.filter(routine => 
      routine.type === activeTab || 
      (routine.type === 'weekly' && selectedDate.getDay() === 0) // Weekly routines on Sunday
    );
  };

  // Get completion status for a routine
  const getRoutineCompletion = (routineId: string, type: 'morning' | 'evening' | 'weekly' | 'custom') => {
    return completions.find(completion => 
      completion.routineId === routineId && 
      completion.date.toDateString() === selectedDate.toDateString() &&
      completion.type === type
    );
  };

  // Handle step completion toggle
  const handleStepToggle = async (routineId: string, productId: string, routineType: 'morning' | 'evening' | 'weekly' | 'custom', completed: boolean) => {
    if (!currentUser?.uid) return;
    setSaving(true);
    
    try {
      const completion = getRoutineCompletion(routineId, routineType);
      let updatedCompletions = [...completions];
      
      if (!completion) {
        // Create new completion record
        const routine = routines.find(r => r.id === routineId);
        if (!routine) throw new Error('Routine not found');
        
        const newCompletion: Omit<RoutineCompletion, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: currentUser.uid,
          routineId,
          type: routineType,
          date: selectedDate,
          completedSteps: routine.steps.map(step => ({
            productId: step.productId,
            completed: step.productId === productId ? completed : false
          }))
        };
        
        const completionId = await addRoutineCompletion(newCompletion);
        
        // Update local state immediately
        updatedCompletions = [...completions, {
          ...newCompletion,
          id: completionId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as RoutineCompletion];
        
      } else {
        // Update existing completion
        const updatedSteps = completion.completedSteps.map(step => 
          step.productId === productId ? { ...step, completed } : step
        );
        
        await updateRoutineCompletion(completion.id, {
          completedSteps: updatedSteps
        });
        
        // Update local state immediately
        updatedCompletions = completions.map(c => 
          c.id === completion.id 
            ? { ...c, completedSteps: updatedSteps }
            : c
        );
      }
      
      // Update completions state
      setCompletions(updatedCompletions);
      
      // Update features immediately
      const completionsByDate = updatedCompletions.reduce((acc, completion) => {
        const dateStr = completion.date.toDateString();
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(completion);
        return acc;
      }, {} as Record<string, RoutineCompletion[]>);
      
      const newFeatures: Feature[] = [];
      
      Object.entries(completionsByDate).forEach(([dateStr, dateCompletions]) => {
        const date = new Date(dateStr);
        const morningCompletions = dateCompletions.filter(c => c.type === 'morning');
        const eveningCompletions = dateCompletions.filter(c => c.type === 'evening');
        
        const totalSteps = dateCompletions.reduce((sum, c) => sum + c.completedSteps.length, 0);
        const completedSteps = dateCompletions.reduce((sum, c) => 
          sum + c.completedSteps.filter(step => step.completed).length, 0
        );
        
        let status = STATUSES[2]; // Default to incomplete
        if (totalSteps > 0) {
          if (completedSteps === totalSteps) {
            status = STATUSES[0]; // Completed
          } else if (completedSteps > 0) {
            status = STATUSES[1]; // Partial
          }
        }
        
        newFeatures.push({
          id: `routine-${dateStr}`,
          name: '',
          startAt: date,
          endAt: date,
          status,
          meta: {
            hasMorning: morningCompletions.length > 0,
            hasEvening: eveningCompletions.length > 0
          }
        });
      });
      
      setFeatures(newFeatures);
      
      toast.success('Progress updated');
    } catch (error) {
      console.error('Error updating completion:', error);
      toast.error('Error updating progress');
    } finally {
      setSaving(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Custom renderer for calendar features
  const renderCalendarFeature = ({ feature }: { feature: Feature }) => {
    // Access our custom meta properties
    const meta = feature.meta;
    
    return (
      <div 
        key={feature.id}
        className="cursor-pointer hover:opacity-80 transition-opacity flex justify-center items-center gap-1"
        onClick={() => handleDateSelect(feature.endAt)}
      >
        {meta?.hasMorning && <Sun className="h-3 w-3 text-amber-500" />}
        {meta?.hasEvening && <Moon className="h-3 w-3 text-indigo-500" />}
      </div>
    );
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedRoutines = getRoutinesForDate();

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Calendar Section */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">Skincare Calendar</CardTitle>
              <CardDescription className="hidden sm:block text-sm">
                Track your skincare routine
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <CalendarProvider 
              className="h-full border rounded-md p-2 bg-card"
              onSelectDate={handleDateSelect}
              selectedDate={selectedDate}
            >
              <CalendarDate>
                <div className="flex items-center gap-2">
                  <CalendarMonthPicker className="w-24 sm:w-32" />
                  <CalendarYearPicker start={2020} end={2030} className="w-20 sm:w-24" />
                </div>
                <CalendarDatePagination />
              </CalendarDate>
              
              <div className="mt-2">
                <CalendarHeader />
                <CalendarBody 
                  features={features as BaseFeature[]}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                >
                  {renderCalendarFeature}
                </CalendarBody>
              </div>
              
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                {STATUSES.map(status => (
                  <div key={status.id} className="flex items-center gap-1.5">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span>{status.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 ml-1">
                  <Sun className="h-3 w-3 text-amber-500" />
                  <span>Morning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Moon className="h-3 w-3 text-indigo-500" />
                  <span>Evening</span>
                </div>
              </div>
            </CalendarProvider>
          </CardContent>
        </Card>
        
        {/* Routine Section */}
        <Card className="overflow-hidden">
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">
              {formatDateForDisplay(selectedDate)}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track your skincare progress
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <Tabs defaultValue="morning" onValueChange={(value) => setActiveTab(value as 'morning' | 'evening')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="morning" className="flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5" />
                  <span>Morning</span>
                </TabsTrigger>
                <TabsTrigger value="evening" className="flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5" />
                  <span>Evening</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="morning" className="space-y-4">
                {selectedRoutines.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {selectedRoutines.map(routine => {
                      const completion = getRoutineCompletion(routine.id, 'morning');
                      return (
                        <div key={routine.id} className="space-y-2 sm:space-y-3">
                          <h3 className="font-medium text-base sm:text-lg">{routine.name}</h3>
                          {routine.steps.map((step) => {
                            const product = products.find(p => p.id === step.productId);
                            const isCompleted = completion?.completedSteps.find(
                              s => s.productId === step.productId
                            )?.completed || false;
                            
                            return product ? (
                              <div 
                                key={step.productId}
                                className={cn(
                                  "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors",
                                  "border border-border/50",
                                  isCompleted ? "bg-primary/10" : "bg-background"
                                )}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-7 w-7 sm:h-8 sm:w-8 rounded-full",
                                    isCompleted && "bg-primary text-primary-foreground hover:bg-primary/90"
                                  )}
                                  onClick={() => handleStepToggle(routine.id, step.productId, 'morning', !isCompleted)}
                                  disabled={saving}
                                >
                                  <Check className={cn(
                                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
                                    isCompleted ? "opacity-100" : "opacity-0"
                                  )} />
                                </Button>
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                  <div className="bg-primary/10 flex h-full w-full items-center justify-center rounded-full text-primary font-medium">
                                    {product.category?.charAt(0) || '?'}
                                  </div>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                                </div>
                                {step.notes && (
                                  <Badge variant="secondary" className="whitespace-nowrap text-xs">
                                    {step.notes}
                                  </Badge>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 border rounded-md bg-muted/20">
                    <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No routines scheduled for this day</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="evening" className="space-y-4">
                {selectedRoutines.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {selectedRoutines.map(routine => {
                      const completion = getRoutineCompletion(routine.id, 'evening');
                      return (
                        <div key={routine.id} className="space-y-2 sm:space-y-3">
                          <h3 className="font-medium text-base sm:text-lg">{routine.name}</h3>
                          {routine.steps.map((step) => {
                            const product = products.find(p => p.id === step.productId);
                            const isCompleted = completion?.completedSteps.find(
                              s => s.productId === step.productId
                            )?.completed || false;
                            
                            return product ? (
                              <div 
                                key={step.productId}
                                className={cn(
                                  "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors",
                                  "border border-border/50",
                                  isCompleted ? "bg-primary/10" : "bg-background"
                                )}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-7 w-7 sm:h-8 sm:w-8 rounded-full",
                                    isCompleted && "bg-primary text-primary-foreground hover:bg-primary/90"
                                  )}
                                  onClick={() => handleStepToggle(routine.id, step.productId, 'evening', !isCompleted)}
                                  disabled={saving}
                                >
                                  <Check className={cn(
                                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
                                    isCompleted ? "opacity-100" : "opacity-0"
                                  )} />
                                </Button>
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                  <div className="bg-primary/10 flex h-full w-full items-center justify-center rounded-full text-primary font-medium">
                                    {product.category?.charAt(0) || '?'}
                                  </div>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                                </div>
                                {step.notes && (
                                  <Badge variant="secondary" className="whitespace-nowrap text-xs">
                                    {step.notes}
                                  </Badge>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 border rounded-md bg-muted/20">
                    <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No routines scheduled for this day</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 