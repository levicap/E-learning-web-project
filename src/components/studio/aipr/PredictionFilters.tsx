import { Button } from '@/components/ui/button';

interface PredictionFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function PredictionFilters({ activeFilter, onFilterChange }: PredictionFiltersProps) {
  return (
    <div className="inline-flex items-center gap-2 p-1 bg-white rounded-lg shadow-sm">
      <Button
        variant={activeFilter === 'all' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('all')}
        className={activeFilter === 'all' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
      >
        All Predictions
      </Button>
      <Button
        variant={activeFilter === 'high' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('high')}
        className={activeFilter === 'high' ? 'bg-emerald-600' : ''}
      >
        High Success
      </Button>
      <Button
        variant={activeFilter === 'medium' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('medium')}
        className={activeFilter === 'medium' ? 'bg-amber-500' : ''}
      >
        Medium Success
      </Button>
      <Button
        variant={activeFilter === 'low' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('low')}
        className={activeFilter === 'low' ? 'bg-rose-500' : ''}
      >
        Low Success
      </Button>
    </div>
  );
}