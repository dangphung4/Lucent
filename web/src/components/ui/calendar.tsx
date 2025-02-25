'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getDay, getDaysInMonth, isSameDay } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { type ReactNode, createContext, useContext, useState, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year: number;
  setMonth: (month: CalendarState['month']) => void;
  setYear: (year: CalendarState['year']) => void;
};

export const useCalendar = create<CalendarState>()(
  devtools((set) => ({
    month: new Date().getMonth() as CalendarState['month'],
    year: new Date().getFullYear(),
    setMonth: (month: CalendarState['month']) => set(() => ({ month })),
    setYear: (year: CalendarState['year']) => set(() => ({ year })),
  }))
);

export type CalendarContextProps = {
  locale: Intl.LocalesArgument;
  startDay: number;
  onSelectDate?: (date: Date, event?: React.MouseEvent) => void;
  selectedDate?: Date;
  onMonthChange?: (month: number, year: number) => void;
  month?: number;
  year?: number;
  day?: number;
  weekday?: number;
  selected?: Date;
  today?: Date;
  setMonth?: (month: number) => void;
  setYear?: (year: number) => void;
  setDay?: (day: number) => void;
  setSelected?: (day: Date, event?: React.MouseEvent) => void;
};

const CalendarContext = createContext<CalendarContextProps>({
  locale: 'en-US',
  startDay: 0,
});

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
};

type ComboboxProps = {
  value: string;
  setValue: (value: string) => void;
  data: {
    value: string;
    label: string;
  }[];
  labels: {
    button: string;
    empty: string;
    search: string;
  };
  className?: string;
};

export const monthsForLocale = (
  localeName: Intl.LocalesArgument,
  monthFormat: Intl.DateTimeFormatOptions['month'] = 'long'
) => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;

  // Create an array of month names that match their JavaScript index (0-11)
  return Array.from({ length: 12 }, (_, i) => 
    format(new Date(2021, i))
  );
};

export const daysForLocale = (locale: Intl.LocalesArgument, startDay: number) => {
  const weekdays: string[] = [];
  const baseDate = new Date(2024, 0, startDay);

  for (let i = 0; i < 7; i++) {
    weekdays.push(
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate)
    );
    baseDate.setDate(baseDate.getDate() + 1);
  }

  return weekdays;
};

/**
 * A customizable combobox component that allows users to select a value from a dropdown list.
 *
 * @param {Object} props - The properties for the Combobox component.
 * @param {string} props.value - The currently selected value.
 * @param {function} props.setValue - A function to update the selected value.
 * @param {Array<{ value: string, label: string }>} props.data - An array of objects representing the options available in the combobox.
 * @param {Object} props.labels - An object containing label strings for various UI elements.
 * @param {string} props.labels.button - The label for the button when no value is selected.
 * @param {string} props.labels.search - The placeholder text for the search input.
 * @param {string} props.labels.empty - The message displayed when no items match the search.
 * @param {string} [props.className] - Additional CSS classes to apply to the button.
 *
 * @returns {JSX.Element} The rendered Combobox component.
 *
 * @example
 * const options = [
 *   { value: 'option1', label: 'Option 1' },
 *   { value: 'option2', label: 'Option 2' }
 * ];
 *
 * const [selectedValue, setSelectedValue] = useState('');
 *
 * <Combobox
 *   value={selectedValue}
 *   setValue={setSelectedValue}
 *   data={options}
 *   labels={{
 *     button: 'Select an option',
 *     search: 'Search...',
 *     empty: 'No options available'
 *   }}
 *   className="custom-class"
 * />
 */
const Combobox = ({
  value,
  setValue,
  data,
  labels,
  className,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn('w-40 justify-between capitalize', className)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {value
            ? data.find((item) => item.value === value)?.label
            : labels.button}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <Command
          filter={(value, search) => {
            const label = data.find((item) => item.value === value)?.label;

            return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="capitalize"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type OutOfBoundsDayProps = {
  day: number;
};

const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
  <div className="relative h-full w-full bg-secondary p-1 text-muted-foreground text-xs">
    {day}
  </div>
);

export type CalendarBodyProps = {
  features: Feature[];
  children: (props: {
    feature: Feature;
  }) => ReactNode;
  selectedDate?: Date;
  onSelectDate?: (date: Date, event?: React.MouseEvent) => void;
};

/**
 * Renders the body of a calendar, displaying the days of the month along with any associated features.
 *
 * @param {Object} props - The properties for the CalendarBody component.
 * @param {Array} props.features - An array of feature objects to display on specific days.
 * @param {function} props.children - A render prop function to customize the rendering of features.
 * @param {Date} props.selectedDate - The currently selected date.
 * @param {function} props.onSelectDate - Callback function to handle date selection.
 *
 * @returns {JSX.Element} The rendered calendar body.
 *
 * @example
 * <CalendarBody
 *   features={featuresArray}
 *   selectedDate={new Date(2023, 0, 15)}
 *   onSelectDate={(date) => console.log(date)}
 * >
 *   {({ feature }) => <FeatureComponent feature={feature} />}
 * </CalendarBody>
 *
 * @throws {Error} Throws an error if the features prop is not an array.
 */
export const CalendarBody = ({ 
  features, 
  children, 
  selectedDate, 
  onSelectDate 
}: CalendarBodyProps) => {
  const { month, year } = useCalendar();
  const { startDay } = useContext(CalendarContext);
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const firstDay = (getDay(new Date(year, month, 1)) - startDay + 7) % 7;
  const days: ReactNode[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
  const prevMonthDaysArray = Array.from(
    { length: prevMonthDays },
    (_, i) => i + 1
  );

  // Today's date for highlighting
  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  // Check if a date is selected
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year;
  };

  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDaysArray[prevMonthDays - firstDay + i];

    if (day) {
      days.push(<OutOfBoundsDay key={`prev-${i}`} day={day} />);
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const featuresForDay = features.filter((feature) => {
      return isSameDay(new Date(feature.endAt), currentDate);
    });

    days.push(
      <div
        key={day}
        className={cn(
          "relative flex h-full w-full flex-col gap-1 p-2 text-xs cursor-pointer transition-colors",
          isToday(day) ? "bg-primary/10" : "",
          isSelected(day) ? "bg-primary/20 font-medium" : "",
          !isToday(day) && !isSelected(day) ? "hover:bg-muted" : ""
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onSelectDate) {
            onSelectDate(currentDate, e);
          }
          return false;
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          return false;
        }}
      >
        <div className="flex justify-between items-start">
          <span className={cn(
            isToday(day) ? "text-primary font-medium" : "",
            isSelected(day) ? "font-medium" : ""
          )}>
            {day}
          </span>
          {featuresForDay.length > 0 && (
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: featuresForDay[0].status.color }}
            />
          )}
        </div>
        <div className="mt-1">
          {featuresForDay.slice(0, 1).map((feature) => children({ feature }))}
        </div>
      </div>
    );
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
  const nextMonthDaysArray = Array.from(
    { length: nextMonthDays },
    (_, i) => i + 1
  );

  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthDaysArray[i];

      if (day) {
        days.push(<OutOfBoundsDay key={`next-${i}`} day={day} />);
      }
    }
  }

  return (
    <div className="grid flex-grow grid-cols-7">
      {days.map((day, index) => (
        <div
          key={index}
          className={cn(
            'relative aspect-square overflow-hidden border-t border-r',
            index % 7 === 6 && 'border-r-0'
          )}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePicker = ({
  className,
  children,
}: CalendarDatePickerProps) => (
  <div className={cn('flex items-center gap-1', className)}>{children}</div>
);

export type CalendarMonthPickerProps = {
  className?: string;
};

/**
 * A functional component that renders a month picker for selecting a month within a calendar.
 *
 * @param {Object} props - The properties for the component.
 * @param {string} [props.className] - An optional class name to apply to the component for styling.
 *
 * @returns {JSX.Element} The rendered month picker component.
 *
 * @example
 * // Example usage of CalendarMonthPicker
 * <CalendarMonthPicker className="custom-class" />
 *
 * @throws {Error} Throws an error if the month value cannot be parsed as an integer.
 */
export const CalendarMonthPicker = ({
  className,
}: CalendarMonthPickerProps) => {
  const { month, setMonth, year } = useCalendar();
  const { locale, onMonthChange } = useContext(CalendarContext);

  /**
   * Handles the change of the month value.
   *
   * This function takes a string representation of a month, converts it to a number,
   * and updates the current month state. If an optional callback function `onMonthChange`
   * is provided, it will be invoked with the new month and the current year.
   *
   * @param {string} value - The string representation of the month to be changed.
   * @throws {TypeError} Throws an error if the value cannot be parsed as a number.
   *
   * @example
   * // Example usage:
   * handleMonthChange("5"); // Changes the month to May (5)
   *
   * @example
   * // Example with callback:
   * handleMonthChange("3", (newMonth, year) => {
   *   console.log(`Month changed to ${newMonth} in year ${year}`);
   * });
   */
  const handleMonthChange = (value: string) => {
    const newMonth = Number.parseInt(value) as CalendarState['month'];
    setMonth(newMonth);
    
    // Call onMonthChange if provided
    if (onMonthChange) {
      onMonthChange(newMonth, year);
    }
  };

  return (
    <Combobox
      className={className}
      value={month.toString()}
      setValue={handleMonthChange}
      data={monthsForLocale(locale).map((monthName, index) => ({
        value: index.toString(),
        label: monthName,
      }))}
      labels={{
        button: 'Select month',
        empty: 'No month found',
        search: 'Search month',
      }}
    />
  );
};

export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
};

/**
 * A component that allows users to select a year from a dropdown list.
 *
 * @param {Object} props - The properties for the CalendarYearPicker component.
 * @param {string} [props.className] - Optional additional class names for styling the component.
 * @param {number} props.start - The starting year of the range.
 * @param {number} props.end - The ending year of the range.
 *
 * @returns {JSX.Element} The rendered CalendarYearPicker component.
 *
 * @example
 * <CalendarYearPicker className="year-picker" start={2000} end={2025} />
 *
 * @throws {Error} Throws an error if the provided start year is greater than the end year.
 */
export const CalendarYearPicker = ({
  className,
  start,
  end,
}: CalendarYearPickerProps) => {
  const { year, setYear, month } = useCalendar();
  const { onMonthChange } = useContext(CalendarContext);

  /**
   * Handles the change of the year value.
   *
   * This function takes a string representation of a year, converts it to a number,
   * and updates the state with the new year. If an optional callback function for
   * month change is provided, it will be called with the current month and the new year.
   *
   * @param {string} value - The new year value as a string.
   * @throws {Error} Throws an error if the value cannot be parsed as an integer.
   *
   * @example
   * // Example usage:
   * handleYearChange("2023");
   *
   * // If onMonthChange is defined:
   * const onMonthChange = (month, year) => {
   *   console.log(`Month changed to ${month} for year ${year}`);
   * };
   */
  const handleYearChange = (value: string) => {
    const newYear = Number.parseInt(value);
    setYear(newYear);
    
    // Call onMonthChange if provided
    if (onMonthChange) {
      onMonthChange(month, newYear);
    }
  };

  return (
    <Combobox
      className={className}
      value={year.toString()}
      setValue={handleYearChange}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{
        button: 'Select year',
        empty: 'No year found',
        search: 'Search year',
      }}
    />
  );
};

export type CalendarDatePaginationProps = {
  className?: string;
};

/**
 * A functional component that provides pagination controls for navigating through calendar months.
 * It allows users to move to the previous or next month and updates the current month and year accordingly.
 *
 * @param {Object} props - The properties for the component.
 * @param {string} [props.className] - An optional additional class name to apply to the component's container.
 *
 * @returns {JSX.Element} The rendered pagination controls for the calendar.
 *
 * @example
 * <CalendarDatePagination className="my-custom-class" />
 *
 * @throws {Error} Throws an error if the month or year is invalid during state updates.
 */
export const CalendarDatePagination = ({
  className,
}: CalendarDatePaginationProps) => {
  const { month, year, setMonth, setYear } = useCalendar();
  const { onMonthChange } = useContext(CalendarContext);

  /**
   * Handles the transition to the previous month in a calendar.
   * Updates the month and year state accordingly, and invokes the
   * optional callback function if provided.
   *
   * This function checks the current month and adjusts the month
   * and year values. If the current month is January (0), it sets
   * the month to December (11) of the previous year. For all other
   * months, it simply decrements the month while keeping the year
   * unchanged.
   *
   * @throws {Error} Throws an error if the month or year state is
   *                 invalid or cannot be updated.
   *
   * @example
   * // Assuming the current state is January 2023
   * handlePreviousMonth();
   * // The state will be updated to December 2022
   *
   * @example
   * // Assuming the current state is March 2023
   * handlePreviousMonth();
   * // The state will be updated to February 2023
   *
   * @param {function} [onMonthChange] - Optional callback function
   *                                      that is called with the new
   *                                      month and year after the
   *                                      transition.
   */
  const handlePreviousMonth = () => {
    let newMonth: CalendarState['month'], newYear: number;
    
    if (month === 0) {
      newMonth = 11;
      newYear = year - 1;
      setMonth(newMonth);
      setYear(newYear);
    } else {
      newMonth = (month - 1) as CalendarState['month'];
      newYear = year;
      setMonth(newMonth);
    }
    
    // Call onMonthChange if provided
    if (onMonthChange) {
      onMonthChange(newMonth, newYear);
    }
  };

  /**
   * Handles the transition to the next month in the calendar.
   * This function updates the current month and year based on the current state.
   * If the current month is December (11), it resets the month to January (0)
   * and increments the year by one. Otherwise, it simply increments the month.
   *
   * If a callback function `onMonthChange` is provided, it will be called
   * with the new month and year after the state has been updated.
   *
   * @function handleNextMonth
   * @returns {void} This function does not return a value.
   *
   * @example
   * // Assuming the current month is December (11) and year is 2023,
   * // calling handleNextMonth will set the month to January (0) and year to 2024.
   * handleNextMonth();
   *
   * @throws {Error} Throws an error if the month or year is not a valid number.
   */
  const handleNextMonth = () => {
    let newMonth: CalendarState['month'], newYear: number;
    
    if (month === 11) {
      newMonth = 0;
      newYear = year + 1;
      setMonth(newMonth);
      setYear(newYear);
    } else {
      newMonth = (month + 1) as CalendarState['month'];
      newYear = year;
      setMonth(newMonth);
    }
    
    // Call onMonthChange if provided
    if (onMonthChange) {
      onMonthChange(newMonth, newYear);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handlePreviousMonth();
        }} 
        variant="ghost" 
        size="icon"
      >
        <ChevronLeftIcon size={16} />
      </Button>
      <Button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNextMonth();
        }} 
        variant="ghost" 
        size="icon"
      >
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};

export type CalendarDateProps = {
  children: ReactNode;
};

export const CalendarDate = ({ children }: CalendarDateProps) => (
  <div className="flex items-center justify-between p-3">{children}</div>
);

export type CalendarHeaderProps = {
  className?: string;
};

export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
  const { locale, startDay } = useContext(CalendarContext);

  return (
    <div className={cn('grid flex-grow grid-cols-7', className)}>
      {daysForLocale(locale, startDay).map((day) => (
        <div key={day} className="p-3 text-center text-muted-foreground text-xs font-medium">
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarItemProps = {
  feature: Feature;
  className?: string;
};

export const CalendarItem = ({ feature, className }: CalendarItemProps) => (
  <div className={cn('flex items-center gap-1', className)} key={feature.id}>
    <span className="truncate text-xs">{feature.name}</span>
  </div>
);

export type CalendarProviderProps = {
  locale?: Intl.LocalesArgument;
  startDay?: number;
  children: ReactNode;
  className?: string;
  onSelectDate?: (date: Date, event?: React.MouseEvent) => void;
  selectedDate?: Date;
  onMonthChange?: (month: number, year: number) => void;
};

/**
 * A provider component for managing calendar state and functionality.
 * This component provides context for calendar operations such as date selection,
 * month and year changes, and localization.
 *
 * @param {Object} props - The properties for the CalendarProvider.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 * @param {string} [props.className] - Optional additional class names for styling the component.
 * @param {function(Date, React.MouseEvent): void} [props.onSelectDate] - Callback function triggered when a date is selected.
 * @param {Date} [props.selectedDate] - The currently selected date.
 * @param {function(number, number): void} [props.onMonthChange] - Callback function triggered when the month is changed.
 * @param {string} [props.locale='en-US'] - The locale for date formatting (default is 'en-US').
 * @param {number} [props.startDay=0] - The index of the first day of the week (default is 0 for Sunday).
 *
 * @throws {Error} Throws an error if the provided date is invalid.
 *
 * @returns {JSX.Element} The rendered CalendarProvider component.
 *
 * @example
 * <CalendarProvider
 *   onSelectDate={(date) => console.log(date)}
 *   selectedDate={new Date()}
 *   onMonthChange={(month, year) => console.log(month, year)}
 * >
 *   <YourCalendarComponent />
 * </CalendarProvider>
 */
export function CalendarProvider({
  children,
  className,
  onSelectDate,
  selectedDate,
  onMonthChange,
  locale = 'en-US',
  startDay = 0,
}: CalendarProviderProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [day, setDay] = useState(today.getDate());
  const [weekday] = useState(today.getDay());
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>(
    selectedDate ? [selectedDate] : undefined
  );

  // Handle date selection
  const setSelected = useCallback(
    (day: Date, event?: React.MouseEvent) => {
      // If onSelectDate is provided, call it
      if (onSelectDate) {
        onSelectDate(day, event);
      }
      
      setSelectedDates([day]);
    },
    [onSelectDate]
  );

  const handleSetMonth = useCallback((newMonth: number) => {
    setMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth, year);
    }
  }, [year, onMonthChange]);

  const handleSetYear = useCallback((newYear: number) => {
    setYear(newYear);
    if (onMonthChange) {
      onMonthChange(month, newYear);
    }
  }, [month, onMonthChange]);

  const contextValue = useMemo(() => {
    return {
      locale,
      startDay,
      month,
      year,
      day,
      weekday,
      selected: selectedDates?.[0],
      selectedDate: selectedDates?.[0],
      today,
      setMonth: handleSetMonth,
      setYear: handleSetYear,
      setDay,
      setSelected,
      onMonthChange,
      onSelectDate,
    };
  }, [
    locale,
    startDay,
    month,
    year,
    day,
    weekday,
    selectedDates,
    today,
    handleSetMonth,
    handleSetYear,
    setDay,
    setSelected,
    onMonthChange,
    onSelectDate,
  ]);

  return (
    <CalendarContext.Provider value={contextValue}>
      <div className={cn('relative flex flex-col', className)}>{children}</div>
    </CalendarContext.Provider>
  );
}
