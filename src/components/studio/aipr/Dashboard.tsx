import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';             // ← Clerk hook
import CourseList from './CourseList';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from './DashboardHeader';
import { PredictionFilters } from './PredictionFilters';

export default function Aiprediction() {
  const [filter, setFilter] = useState<'all'|'high'|'medium'|'low'>('all');
  const [courses, setCourses] = useState<any[]>([]);       // AI predictions
  const [loading, setLoading] = useState(false);           // ← new loading flag
  const { userId } = useAuth();                            // Clerk user ID
  const { toast } = useToast();

  // Memoize headers (including your Clerk ID)
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-clerk-user-id': userId || ''
  }), [userId]);

  // Fetch via POST on mount / when userId changes
  useEffect(() => {
    if (!userId) return;

    const fetchPredictions = async () => {
      setLoading(true); // ← start loading
      try {
        const res = await fetch('http://localhost:5000/api/ai/predict-courses', {
          method: 'POST',
          headers,
          body: JSON.stringify({})    // no extra payload needed for now
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const { predictions } = await res.json();
        setCourses(predictions);
      } catch (err: any) {
        toast({
          title: 'Failed to load course predictions',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false); // ← stop loading
      }
    };

    fetchPredictions();
  }, [headers, toast, userId]);

  // Apply your high/medium/low filter to the live courses
  const filteredCourses = useMemo(() => {
    if (filter === 'all') return courses;
    if (filter === 'high')   return courses.filter(c => c.successRate >= 80);
    if (filter === 'medium') return courses.filter(c => c.successRate >= 50 && c.successRate < 80);
    if (filter === 'low')    return courses.filter(c => c.successRate < 50);
    return courses;
  }, [courses, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Course Predictions</h2>
          <p className="text-muted-foreground">
            Our AI analyzes market trends, student demand, and industry needs to predict which courses will succeed. Here are your personalized recommendations.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <PredictionFilters activeFilter={filter} onFilterChange={setFilter} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            {/* Simple spinner */}
            <svg
              className="animate-spin h-12 w-12 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        ) : (
          <CourseList courses={filteredCourses} />
        )}
      </main>
    </div>
  );
}
