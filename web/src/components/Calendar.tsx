import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { PlusCircle, Calendar as CalendarIcon, Check } from 'lucide-react';
import {
  CalendarProvider,
  CalendarHeader,
  CalendarBody,
  CalendarDate,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  // CalendarItem,
  Feature,
  Status
} from './ui/calendar';

// Mock data for products (would come from a database in a real app)
const MOCK_PRODUCTS = [
  { id: 1, name: 'Gentle Cleanser', brand: 'CeraVe', category: 'Cleanser', image: '/placeholder-product.jpg' },
  { id: 2, name: 'Vitamin C Serum', brand: 'The Ordinary', category: 'Serum', image: '/placeholder-product.jpg' },
  { id: 3, name: 'Moisturizing Cream', brand: 'La Roche-Posay', category: 'Moisturizer', image: '/placeholder-product.jpg' },
  { id: 4, name: 'Hyaluronic Acid', brand: 'The Ordinary', category: 'Serum', image: '/placeholder-product.jpg' },
  { id: 5, name: 'SPF 50 Sunscreen', brand: 'Supergoop', category: 'Sunscreen', image: '/placeholder-product.jpg' },
];

// Mock statuses for calendar items
const STATUSES: Status[] = [
  { id: '1', name: 'Morning', color: '#22c55e' }, // Green
  { id: '2', name: 'Evening', color: '#8b5cf6' }, // Purple
  { id: '3', name: 'Both', color: '#3b82f6' },    // Blue
];

// Mock data for routines (would come from a database in a real app)
const MOCK_ROUTINES: Record<string, { morning: number[], evening: number[] }> = {
  '2023-05-15': {
    morning: [1, 2, 3, 5],
    evening: [1, 4, 3]
  },
  '2023-05-16': {
    morning: [1, 2, 5],
    evening: [1, 4, 3]
  }
};

// Generate features for the calendar
const generateCalendarFeatures = (): Feature[] => {
  const features: Feature[] = [];
  
  // Convert MOCK_ROUTINES to features
  Object.entries(MOCK_ROUTINES).forEach(([dateStr, routine]) => {
    const date = new Date(dateStr);
    
    // Determine status based on routines
    let statusId = '1'; // Default to morning
    if (routine.morning.length > 0 && routine.evening.length > 0) {
      statusId = '3'; // Both
    } else if (routine.evening.length > 0 && routine.morning.length === 0) {
      statusId = '2'; // Evening only
    }
    
    const status = STATUSES.find(s => s.id === statusId) || STATUSES[0];
    
    features.push({
      id: `routine-${dateStr}`,
      name: 'Skincare Routine',
      startAt: date,
      endAt: date,
      status
    });
  });
  
  return features;
};

export function Calendar() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [features] = useState<Feature[]>(generateCalendarFeatures());
  
  // Format date as YYYY-MM-DD for lookup in routines
  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Initialize with today's date
  useEffect(() => {
    handleDateSelect(today);
  }, []);
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Load products for this date if they exist
    const dateKey = formatDateKey(date);
    const routineForDate = MOCK_ROUTINES[dateKey as keyof typeof MOCK_ROUTINES];
    if (routineForDate) {
      setSelectedProducts(routineForDate[activeTab]);
    } else {
      setSelectedProducts([]);
    }
  };
  
  // Get product details by ID
  const getProductById = (id: number) => {
    return MOCK_PRODUCTS.find(product => product.id === id);
  };
  
  // Toggle product selection
  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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
              Log your skincare products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="morning" onValueChange={(value) => setActiveTab(value as 'morning' | 'evening')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="morning">Morning</TabsTrigger>
                <TabsTrigger value="evening">Evening</TabsTrigger>
              </TabsList>
              
              <TabsContent value="morning" className="space-y-4">
                {selectedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProducts.map(productId => {
                      const product = getProductById(productId);
                      return product ? (
                        <div 
                          key={product.id}
                          className="flex items-center gap-3 p-3 rounded-md border"
                        >
                          <Avatar className="h-10 w-10">
                            <div className="bg-primary/10 flex h-full w-full items-center justify-center rounded-full text-primary font-medium">
                              {product.category.charAt(0)}
                            </div>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No products added to your morning routine</p>
                  </div>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Products
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Morning Routine</DialogTitle>
                      <DialogDescription>
                        Select products for your morning routine
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] mt-4">
                      <div className="space-y-2">
                        {MOCK_PRODUCTS.map(product => (
                          <div 
                            key={product.id}
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                              selectedProducts.includes(product.id) 
                                ? 'bg-primary/10 border-primary border' 
                                : 'hover:bg-muted border'
                            }`}
                            onClick={() => toggleProduct(product.id)}
                          >
                            <Avatar className="h-10 w-10">
                              <div className="bg-muted flex h-full w-full items-center justify-center rounded-full">
                                {product.category.charAt(0)}
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.brand}</p>
                            </div>
                            {selectedProducts.includes(product.id) && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <DialogFooter>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
              
              <TabsContent value="evening" className="space-y-4">
                {selectedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProducts.map(productId => {
                      const product = getProductById(productId);
                      return product ? (
                        <div 
                          key={product.id}
                          className="flex items-center gap-3 p-3 rounded-md border"
                        >
                          <Avatar className="h-10 w-10">
                            <div className="bg-primary/10 flex h-full w-full items-center justify-center rounded-full text-primary font-medium">
                              {product.category.charAt(0)}
                            </div>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No products added to your evening routine</p>
                  </div>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Products
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Evening Routine</DialogTitle>
                      <DialogDescription>
                        Select products for your evening routine
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] mt-4">
                      <div className="space-y-2">
                        {MOCK_PRODUCTS.map(product => (
                          <div 
                            key={product.id}
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                              selectedProducts.includes(product.id) 
                                ? 'bg-primary/10 border-primary border' 
                                : 'hover:bg-muted border'
                            }`}
                            onClick={() => toggleProduct(product.id)}
                          >
                            <Avatar className="h-10 w-10">
                              <div className="bg-muted flex h-full w-full items-center justify-center rounded-full">
                                {product.category.charAt(0)}
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.brand}</p>
                            </div>
                            {selectedProducts.includes(product.id) && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <DialogFooter>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 