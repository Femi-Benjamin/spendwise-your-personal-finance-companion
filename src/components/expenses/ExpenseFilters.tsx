import { ExpenseCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/expense';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExpenseFiltersProps {
  category: ExpenseCategory | 'all';
  startDate: string;
  endDate: string;
  onCategoryChange: (category: ExpenseCategory | 'all') => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilters: () => void;
}

export function ExpenseFilters({
  category,
  startDate,
  endDate,
  onCategoryChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: ExpenseFiltersProps) {
  const categories = Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][];
  const hasFilters = category !== 'all' || startDate || endDate;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={(value) => onCategoryChange(value as ExpenseCategory | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[value]}</span>
                    <span>{label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
