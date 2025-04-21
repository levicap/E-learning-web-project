import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/types/course';
import { 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-emerald-100 text-emerald-800';
    if (rate >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMonthlyAverage = (data: { enrollment: number; revenue: number }[]) => {
    const total = data.reduce((acc, month) => ({
      enrollment: acc.enrollment + month.enrollment,
      revenue: acc.revenue + month.revenue
    }), { enrollment: 0, revenue: 0 });

    return {
      enrollment: Math.round(total.enrollment / data.length),
      revenue: Math.round(total.revenue / data.length)
    };
  };

  const monthlyAverage = calculateMonthlyAverage(course.predictionData);

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold line-clamp-1">{course.title}</h3>
            <p className="text-muted-foreground mt-1">{formatCurrency(course.price)}</p>
          </div>
          <Badge 
            className={cn(
              "ml-2 px-2 py-1 text-xs font-medium", 
              getSuccessRateColor(course.successRate)
            )}
          >
            {course.successRate}% Success Rate
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {course.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-600">Monthly Students</p>
            </div>
            <p className="text-lg font-semibold">{monthlyAverage.enrollment}</p>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-indigo-600" />
              <p className="text-xs font-medium text-indigo-600">Monthly Revenue</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(monthlyAverage.revenue)}</p>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-6 pt-4 border-t animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-medium text-blue-600">Market Trend</p>
                </div>
                <p className="text-sm font-medium">{course.marketTrend}</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-medium text-indigo-600">Best Launch</p>
                </div>
                <p className="text-sm font-medium">{course.bestLaunchTime}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">AI Success Prediction Factors</h4>
              <ul className="space-y-2">
                {course.successFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                    <div className="min-w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                    <p>{factor}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 flex justify-center border-t bg-gradient-to-r from-blue-50 to-indigo-50">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs font-medium hover:bg-blue-100/50"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <span className="flex items-center gap-1">
              Show Less <ChevronUp className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              View AI Insights <ChevronDown className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}