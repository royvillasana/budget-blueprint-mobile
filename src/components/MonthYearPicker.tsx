import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MonthYearPickerProps {
  selectedMonth: number;
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
  buttonClassName?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  displayText?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function MonthYearPicker({
  selectedMonth,
  selectedYear,
  onSelect,
  buttonClassName,
  buttonVariant = 'ghost',
  displayText
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedYear);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Determine language based on displayText or default to Spanish
  const isSpanish = displayText?.includes('Enero') || displayText?.includes('enero') ||
                     MONTHS_ES.some(m => displayText?.includes(m)) || true;
  const monthNames = isSpanish ? MONTHS_ES : MONTHS;

  const handleMonthSelect = (monthIndex: number) => {
    onSelect(monthIndex + 1, viewYear);
    setOpen(false);
  };

  const handlePreviousYear = () => {
    setViewYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear(prev => prev + 1);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          className={cn('justify-start text-left font-normal', buttonClassName)}
        >
          {displayText || `${monthNames[selectedMonth - 1]} ${selectedYear}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Year selector */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviousYear}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{viewYear}</div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextYear}
              disabled={viewYear >= currentYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((month, index) => {
              const isSelected = selectedMonth === index + 1 && selectedYear === viewYear;
              const isCurrent = currentMonth === index + 1 && currentYear === viewYear;
              const isFuture = viewYear > currentYear || (viewYear === currentYear && index + 1 > currentMonth);

              return (
                <Button
                  key={month}
                  variant={isSelected ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'h-9 text-xs',
                    isCurrent && !isSelected && 'border border-primary',
                    isFuture && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handleMonthSelect(index)}
                  disabled={isFuture}
                >
                  {month.slice(0, 3)}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
