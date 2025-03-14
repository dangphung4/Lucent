import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Trash, Loader2, Sun, Moon, Calendar, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useAuth } from '@/lib/AuthContext';
import { getUserRoutines, deleteRoutine, Routine, getUserProducts, Product, addRoutine, updateRoutine } from '@/lib/db';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import type { DropResult } from '@hello-pangea/dnd';

export interface RoutineListProps {
  onRoutinesChange?: () => void;
}

interface RoutineFormState {
  name: string;
  type: Routine['type'];
  description: string;
  steps: Array<{
    productId: string;
    notes?: string;
  }>;
}

const initialFormState: RoutineFormState = {
  name: '',
  type: 'morning',
  description: '',
  steps: [],
};

export const RoutineList = forwardRef<{ loadRoutines: () => Promise<void> }, RoutineListProps>(
  ({ onRoutinesChange }, ref) => {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formState, setFormState] = useState<RoutineFormState>(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const { currentUser } = useAuth();

    const loadRoutines = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      try {
        const [fetchedRoutines, fetchedProducts] = await Promise.all([
          getUserRoutines(currentUser.uid),
          getUserProducts(currentUser.uid)
        ]);
        setRoutines(fetchedRoutines);
        setProducts(fetchedProducts.filter(p => p.status === 'active'));
      } catch (error) {
        console.error('Error loading routines:', error);
        toast.error('Error loading routines', {
          description: 'Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      loadRoutines,
    }));

    useEffect(() => {
      loadRoutines();
    }, [currentUser]);

    useEffect(() => {
      if (editingRoutine) {
        setFormState({
          name: editingRoutine.name,
          type: editingRoutine.type,
          description: editingRoutine.description || '',
          steps: editingRoutine.steps.map(step => ({
            productId: step.productId,
            notes: step.notes,
          })),
        });
      } else {
        setFormState(initialFormState);
      }
    }, [editingRoutine]);

    const handleDelete = async (routine: Routine) => {
      setIsDeleting(true);
      try {
        await deleteRoutine(routine.id);
        await loadRoutines();
        onRoutinesChange?.();
        toast.success('Routine deleted', {
          description: 'The routine has been successfully deleted.'
        });
      } catch (error) {
        console.error('Error deleting routine:', error);
        toast.error('Error deleting routine', {
          description: 'Please try again later.'
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setRoutineToDelete(null);
      }
    };

    const handleSave = async () => {
      if (!currentUser?.uid) return;
      if (!formState.name || !formState.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      setIsSaving(true);
      try {
        const routineData = {
          userId: currentUser.uid,
          name: formState.name,
          type: formState.type,
          description: formState.description || undefined,
          steps: formState.steps.map((step, index) => ({
            ...step,
            order: index,
          })),
          isActive: true,
        };

        if (editingRoutine) {
          await updateRoutine(editingRoutine.id, routineData);
          toast.success('Routine updated successfully');
        } else {
          await addRoutine(routineData);
          toast.success('Routine created successfully');
        }

        await loadRoutines();
        onRoutinesChange?.();
        setCreateDialogOpen(false);
        setEditingRoutine(null);
      } catch (error) {
        console.error('Error saving routine:', error);
        toast.error('Error saving routine', {
          description: 'Please try again later.'
        });
      } finally {
        setIsSaving(false);
      }
    };

    const handleDragEnd = (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(formState.steps);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setFormState(prev => ({ ...prev, steps: items }));
    };

    const addStep = (productId: string) => {
      if (formState.steps.some(step => step.productId === productId)) {
        toast.error('This product is already in the routine');
        return;
      }

      setFormState(prev => ({
        ...prev,
        steps: [...prev.steps, { productId, notes: '' }],
      }));
    };

    const removeStep = (index: number) => {
      setFormState(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index),
      }));
    };

    const getRoutineIcon = (type: Routine['type']) => {
      switch (type) {
        case 'morning':
          return <Sun className="h-4 w-4" />;
        case 'evening':
          return <Moon className="h-4 w-4" />;
        case 'weekly':
          return <Calendar className="h-4 w-4" />;
        default:
          return null;
      }
    };

    if (loading) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Routine Card */}
          <Card 
            className={cn(
              "group relative overflow-hidden transition-all hover:shadow-md cursor-pointer border-dashed",
              "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
              "hover:bg-gradient-to-br hover:from-primary/20 hover:via-primary/10 hover:to-transparent"
            )} 
            onClick={() => setCreateDialogOpen(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] text-muted-foreground hover:text-primary">
              <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Create New Routine</h3>
              <p className="text-sm">Set up your morning, evening, or custom routine</p>
            </CardContent>
          </Card>

          {/* Existing Routines */}
          {routines.map((routine) => (
            <Card 
              key={routine.id} 
              className={cn(
                "group relative overflow-hidden transition-all hover:shadow-md border cursor-pointer",
                routine.type === 'morning' && [
                  "bg-gradient-to-br from-amber-100/50 via-amber-50/25 to-transparent",
                  "dark:from-amber-950/20 dark:via-transparent dark:to-transparent",
                  "hover:from-amber-100/80 hover:via-amber-50/40 hover:to-transparent",
                  "dark:hover:from-amber-950/30 dark:hover:via-transparent dark:hover:to-transparent",
                  "border-amber-200/50 dark:border-amber-800/30"
                ],
                routine.type === 'evening' && [
                  "bg-gradient-to-br from-indigo-100/50 via-indigo-50/25 to-transparent",
                  "dark:from-indigo-950/20 dark:via-transparent dark:to-transparent",
                  "hover:from-indigo-100/80 hover:via-indigo-50/40 hover:to-transparent",
                  "dark:hover:from-indigo-950/30 dark:hover:via-transparent dark:hover:to-transparent",
                  "border-indigo-200/50 dark:border-indigo-800/30"
                ],
                routine.type === 'weekly' && [
                  "bg-gradient-to-br from-emerald-100/50 via-emerald-50/25 to-transparent",
                  "dark:from-emerald-950/20 dark:via-transparent dark:to-transparent",
                  "hover:from-emerald-100/80 hover:via-emerald-50/40 hover:to-transparent",
                  "dark:hover:from-emerald-950/30 dark:hover:via-transparent dark:hover:to-transparent",
                  "border-emerald-200/50 dark:border-emerald-800/30"
                ],
                routine.type === 'custom' && [
                  "bg-gradient-to-br from-purple-100/50 via-purple-50/25 to-transparent",
                  "dark:from-purple-950/20 dark:via-transparent dark:to-transparent",
                  "hover:from-purple-100/80 hover:via-purple-50/40 hover:to-transparent",
                  "dark:hover:from-purple-950/30 dark:hover:via-transparent dark:hover:to-transparent",
                  "border-purple-200/50 dark:border-purple-800/30"
                ]
              )}
              onClick={() => setEditingRoutine(routine)}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1 mr-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className={cn(
                        "rounded-full p-1.5",
                        routine.type === 'morning' && [
                          "bg-amber-100 text-amber-900",
                          "dark:bg-amber-900/30 dark:text-amber-400",
                          "border border-amber-200 dark:border-amber-800/50"
                        ],
                        routine.type === 'evening' && [
                          "bg-indigo-100 text-indigo-900",
                          "dark:bg-indigo-900/30 dark:text-indigo-400",
                          "border border-indigo-200 dark:border-indigo-800/50"
                        ],
                        routine.type === 'weekly' && [
                          "bg-emerald-100 text-emerald-900",
                          "dark:bg-emerald-900/30 dark:text-emerald-400",
                          "border border-emerald-200 dark:border-emerald-800/50"
                        ],
                        routine.type === 'custom' && [
                          "bg-purple-100 text-purple-900",
                          "dark:bg-purple-900/30 dark:text-purple-400",
                          "border border-purple-200 dark:border-purple-800/50"
                        ]
                      )}>
                        {getRoutineIcon(routine.type)}
                      </div>
                      {routine.name}
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      setRoutineToDelete(routine);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {routine.description && (
                  <p className="text-sm text-muted-foreground mb-4">{routine.description}</p>
                )}
                <div className="space-y-2">
                  {routine.steps.map((step, index) => {
                    const product = products.find(p => p.id === step.productId);
                    return (
                      <div 
                        key={step.productId} 
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          "bg-background/80 hover:bg-background transition-colors",
                          "border border-border/50"
                        )}
                      >
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "w-6 h-6 rounded-full p-0 flex items-center justify-center",
                            "border-2 font-semibold"
                          )}
                        >
                          {index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {product?.name || 'Unknown Product'}
                            </span>
                            {product?.category && (
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                          </div>
                          {step.notes && (
                            <span className="text-xs text-muted-foreground block truncate mt-0.5">
                              {step.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Routine</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{routineToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  const routine = routineToDelete;
                  if (routine) {
                    handleDelete(routine);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create/Edit Routine Dialog */}
        <Dialog 
          open={createDialogOpen || !!editingRoutine} 
          onOpenChange={(open) => {
            if (!open) {
              setCreateDialogOpen(false);
              setEditingRoutine(null);
              setFormState(initialFormState);
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px] h-[85vh] sm:max-h-[90vh] flex flex-col p-0 gap-0 sm:p-6 sm:gap-4">
            <DialogHeader className="p-4 sm:p-0 border-b sm:border-0 shrink-0">
              <DialogTitle>{editingRoutine ? 'Edit Routine' : 'Create Routine'}</DialogTitle>
              <DialogDescription>
                {editingRoutine 
                  ? 'Make changes to your skincare routine.'
                  : 'Set up a new skincare routine with your products.'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-auto p-4 sm:p-0 max-h-[calc(70vh-120px)]">
              <div className="grid gap-6 pb-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="My Morning Routine"
                    value={formState.name}
                    onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formState.type}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, type: value as Routine['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select routine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>Morning Routine</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="evening">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>Evening Routine</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Weekly Routine</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">Custom Routine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="A brief description of your routine..." 
                    value={formState.description}
                    onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Separator className="sm:hidden" />

                {/* Product Steps */}
                <div className="grid gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                    <Label>Products</Label>
                    <Select
                      onValueChange={(value) => addStep(value)}
                      value=""
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Add a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No active products available
                          </div>
                        ) : (
                          products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="steps">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef} 
                          className="space-y-2 touch-pan-y"
                        >
                          {formState.steps.map((step, index) => {
                            const product = products.find(p => p.id === step.productId);
                            return (
                              <Draggable key={step.productId} draggableId={step.productId} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      "flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg",
                                      "bg-secondary/50 hover:bg-secondary/70 transition-colors"
                                    )}
                                  >
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                      <div 
                                        {...provided.dragHandleProps} 
                                        className="cursor-grab touch-manipulation p-1"
                                        aria-label="Drag to reorder"
                                      >
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className="w-6 h-6 rounded-full p-0 flex items-center justify-center border-2 font-semibold"
                                      >
                                        {index + 1}
                                      </Badge>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{product?.name}</span>
                                        {product?.category && (
                                          <Badge variant="secondary" className="text-xs">
                                            {product.category}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                      <Input
                                        placeholder="Notes (optional)"
                                        value={step.notes || ''}
                                        onChange={(e) => {
                                          const newSteps = [...formState.steps];
                                          newSteps[index].notes = e.target.value;
                                          setFormState(prev => ({ ...prev, steps: newSteps }));
                                        }}
                                        className="flex-1 sm:w-48"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeStep(index)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {formState.steps.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No products added to this routine yet.</p>
                              <p className="text-sm">Use the dropdown above to add products.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-4 sm:p-0 border-t sm:border-0 shrink-0">
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditingRoutine(null);
                    setFormState(initialFormState);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

RoutineList.displayName = 'RoutineList'; 