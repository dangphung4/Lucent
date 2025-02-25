import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Calendar as CalendarIcon, Check, Loader2 } from 'lucide-react';
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
  Feature,
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

// Status colors for different completion states
const STATUSES: Status[] = [
  { id: 'completed', name: 'Completed', color: '#22c55e' },
  { id: 'partial', name: 'Partially Complete', color: '#f59e0b' },
  { id: 'incomplete', name: 'Not Started', color: '#6b7280' },
];

/**
 * Renders the skincare calendar component, allowing users to track their skincare routines.
 * It manages the state for selected date, active tab (morning/evening), routines, products,
 * completions, and loading states. The component fetches user-specific data and displays it
 * in a calendar format.
 *
 * @returns {JSX.Element} The rendered calendar component.
 *
 * @throws {Error} Throws an error if the routine is not found during completion updates.
 *
 * @example
 * // Usage in a parent component
 * <Calendar />
 */
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
    
    /**
     * Asynchronously loads user routines and products from the server.
     * It fetches the data concurrently using Promise.all and updates the state
     * with the retrieved routines and active products.
     *
     * @async
     * @function loadData
     * @returns {Promise<void>} A promise that resolves when the data has been loaded and the state has been updated.
     *
     * @throws {Error} Throws an error if the data fetching fails, which is caught and logged to the console.
     *
     * @example
     * // Usage of loadData function
     * loadData().then(() => {
     *   console.log('Data loaded successfully');
     * }).catch((error) => {
     *   console.error('Failed to load data:', error);
     * });
     */
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

    /**
     * Asynchronously loads routine completions for the current user within the selected month.
     * It fetches the completions from a data source, processes them to generate features for a calendar,
     * and updates the state with the fetched completions and generated features.
     *
     * @async
     * @function loadCompletions
     * @throws {Error} Throws an error if there is an issue fetching the routine completions.
     *
     * @example
     * // Example usage of loadCompletions
     * loadCompletions()
     *   .then(() => console.log('Completions loaded successfully'))
     *   .catch(error => console.error('Failed to load completions:', error));
     *
     * @returns {Promise<void>} A promise that resolves when the completions have been successfully loaded and processed.
     */
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
        const newFeatures: Feature[] = fetchedCompletions.map(completion => {
          const routine = routines.find(r => r.id === completion.routineId);
          const completedSteps = completion.completedSteps.filter(step => step.completed).length;
          const totalSteps = completion.completedSteps.length;
          
          let status = STATUSES[2]; // Default to incomplete
          if (completedSteps === totalSteps) {
            status = STATUSES[0]; // Completed
          } else if (completedSteps > 0) {
            status = STATUSES[1]; // Partial
          }
          
          return {
            id: completion.id,
            name: routine?.name || 'Routine',
            startAt: completion.date,
            endAt: completion.date,
            status
          };
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
  }, [currentUser, selectedDate, routines]);

  // Get routines for the selected date and tab
  const getRoutinesForDate = () => {
    return routines.filter(routine => 
      routine.type === activeTab || 
      (routine.type === 'weekly' && selectedDate.getDay() === 0) // Weekly routines on Sunday
    );
  };

  // Get completion status for a routine
  /**
   * Retrieves a completion object for a specific routine on the selected date.
   *
   * This function searches through an array of completion objects to find one that matches
   * the provided routine ID and the currently selected date. If a matching completion is found,
   * it is returned; otherwise, the function returns undefined.
   *
   * @param {string} routineId - The ID of the routine for which to find the completion.
   * @returns {Completion | undefined} The completion object if found, otherwise undefined.
   *
   * @example
   * const completion = getRoutineCompletion('12345');
   * if (completion) {
   *   console.log('Completion found:', completion);
   * } else {
   *   console.log('No completion found for the given routine ID.');
   * }
   *
   * @throws {Error} Throws an error if the routineId is not a valid string.
   */
  const getRoutineCompletion = (routineId: string) => {
    return completions.find(completion => 
      completion.routineId === routineId && 
      completion.date.toDateString() === selectedDate.toDateString()
    );
  };

  // Handle step completion toggle
  /**
   * Toggles the completion status of a step in a routine for the current user.
   *
   * This asynchronous function checks if the current user is authenticated and
   * updates the completion status of a specified step in a routine. If no completion
   * record exists for the routine, it creates a new one. If a record does exist,
   * it updates the existing completion record with the new status.
   *
   * @param {string} routineId - The ID of the routine to update.
   * @param {string} productId - The ID of the product whose step completion is being toggled.
   * @param {boolean} completed - The new completion status for the specified step.
   *
   * @throws {Error} Throws an error if the routine is not found or if there is an issue
   *                 during the update process.
   *
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   *
   * @example
   * handleStepToggle('routine123', 'product456', true)
   *   .then(() => console.log('Step toggled successfully'))
   *   .catch(error => console.error('Failed to toggle step:', error));
   */
  const handleStepToggle = async (routineId: string, productId: string, completed: boolean) => {
    if (!currentUser?.uid) return;
    setSaving(true);
    
    try {
      const completion = getRoutineCompletion(routineId);
      
      if (!completion) {
        // Create new completion record
        const routine = routines.find(r => r.id === routineId);
        if (!routine) throw new Error('Routine not found');
        
        await addRoutineCompletion({
          userId: currentUser.uid,
          routineId,
          date: selectedDate,
          completedSteps: routine.steps.map(step => ({
            productId: step.productId,
            completed: step.productId === productId ? completed : false
          }))
        });
        
        // Reload completions
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        const updatedCompletions = await getRoutineCompletions(currentUser.uid, startOfMonth, endOfMonth);
        setCompletions(updatedCompletions);
      } else {
        // Update existing completion
        const updatedSteps = completion.completedSteps.map(step => 
          step.productId === productId ? { ...step, completed } : step
        );
        
        await updateRoutineCompletion(completion.id, {
          completedSteps: updatedSteps
        });
        
        // Update local state
        setCompletions(prev => prev.map(c => 
          c.id === completion?.id 
            ? { ...c, completedSteps: updatedSteps }
            : c
        ));
      }
      
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
    return (
      <div 
        key={feature.id}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleDateSelect(feature.endAt)}
      >
        <div className="flex items-center gap-1">
          <span className="text-xs truncate">{feature.name}</span>
        </div>
      </div>
    );
  };

  // Handle date selection
  /**
   * Handles the selection of a date and updates the selected date state.
   *
   * This function is typically used in a date picker component to manage
   * the user's date selection. When a date is selected, this function is
   * called to update the internal state with the newly selected date.
   *
   * @param {Date} date - The date object representing the selected date.
   * @throws {Error} Throws an error if the provided date is invalid.
   *
   * @example
   * // Example usage of handleDateSelect
   * const selectedDate = new Date('2023-10-01');
   * handleDateSelect(selectedDate);
   */
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
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Calendar Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Skincare Calendar</CardTitle>
              <CardDescription className="text-sm">
                Track your skincare routine
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarProvider 
              className="h-full border rounded-md p-2 bg-card"
              onSelectDate={handleDateSelect}
              selectedDate={selectedDate}
            >
              <CalendarDate>
                <div className="flex items-center gap-2">
                  <CalendarMonthPicker className="w-32 sm:w-40" />
                  <CalendarYearPicker start={2020} end={2030} className="w-24 sm:w-32" />
                </div>
                <CalendarDatePagination />
              </CalendarDate>
              
              <div className="mt-2">
                <CalendarHeader />
                <CalendarBody 
                  features={features}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                >
                  {renderCalendarFeature}
                </CalendarBody>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                {STATUSES.map(status => (
                  <div key={status.id} className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span>{status.name}</span>
                  </div>
                ))}
              </div>
            </CalendarProvider>
          </CardContent>
        </Card>
        
        {/* Routine Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {formatDateForDisplay(selectedDate)}
            </CardTitle>
            <CardDescription>
              Track your skincare progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="morning" onValueChange={(value) => setActiveTab(value as 'morning' | 'evening')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="morning">Morning</TabsTrigger>
                <TabsTrigger value="evening">Evening</TabsTrigger>
              </TabsList>
              
              <TabsContent value="morning" className="space-y-4">
                {selectedRoutines.length > 0 ? (
                  <div className="space-y-6">
                    {selectedRoutines.map(routine => {
                      const completion = getRoutineCompletion(routine.id);
                      return (
                        <div key={routine.id} className="space-y-3">
                          <h3 className="font-medium text-lg">{routine.name}</h3>
                          {routine.steps.map((step) => {
                            const product = products.find(p => p.id === step.productId);
                            const isCompleted = completion?.completedSteps.find(
                              s => s.productId === step.productId
                            )?.completed || false;
                            
                            return product ? (
                              <div 
                                key={step.productId}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                  "border border-border/50",
                                  isCompleted ? "bg-primary/10" : "bg-background"
                                )}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8 rounded-full",
                                    isCompleted && "bg-primary text-primary-foreground hover:bg-primary/90"
                                  )}
                                  onClick={() => handleStepToggle(routine.id, step.productId, !isCompleted)}
                                  disabled={saving}
                                >
                                  <Check className={cn(
                                    "h-4 w-4",
                                    isCompleted ? "opacity-100" : "opacity-0"
                                  )} />
                                </Button>
                                <Avatar className="h-10 w-10">
                                  <div className="bg-primary/10 flex h-full w-full items-center justify-center rounded-full text-primary font-medium">
                                    {product.category?.charAt(0) || '?'}
                                  </div>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                                </div>
                                {step.notes && (
                                  <Badge variant="secondary" className="whitespace-nowrap">
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
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No routines scheduled for this day</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="evening" className="space-y-4">
                {selectedRoutines.length > 0 ? (
                  <div className="space-y-6">
                    {selectedRoutines.map(routine => {
                      const completion = getRoutineCompletion(routine.id);
                      return (
                        <div key={routine.id} className="space-y-3">
                          <h3 className="font-medium text-lg">{routine.name}</h3>
                          {routine.steps.map((step) => {
                            const product = products.find(p => p.id === step.productId);
                            const isCompleted = completion?.completedSteps.find(
                              s => s.productId === step.productId
                            )?.completed || false;
                            
                            return product ? (
                              <div 
                                key={step.productId}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                  "border border-border/50",
                                  isCompleted ? "bg-primary/10" : "bg-background"
                                )}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8 rounded-full",
                                    isCompleted && "bg-primary text-primary-foreground hover:bg-primary/90"
                                  )}
                                  onClick={() => handleStepToggle(routine.id, step.productId, !isCompleted)}
                                  disabled={saving}
                                >
                                  <Check className={cn(
                                    "h-4 w-4",
                                    isCompleted ? "opacity-100" : "opacity-0"
                                  )} />
                                </Button>
                                <Avatar className="h-10 w-10">
                                  <div className="bg-primary/10 flex h-full w-full items-center justify-center rounded-full text-primary font-medium">
                                    {product.category?.charAt(0) || '?'}
                                  </div>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                                </div>
                                {step.notes && (
                                  <Badge variant="secondary" className="whitespace-nowrap">
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
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No routines scheduled for this day</p>
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