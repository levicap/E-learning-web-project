import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card } from '@/components/ui/card';
import { PredictionData } from '@/types/course';

interface PredictionChartProps {
  data: PredictionData[];
}

export function PredictionChart({ data }: PredictionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: 0,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 border shadow-sm">
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    Enrollment: {payload[0].value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Revenue: ${payload[1].value}
                  </div>
                </Card>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="enrollment"
          stroke="hsl(var(--chart-1))"
          fillOpacity={1}
          fill="url(#colorEnrollment)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--chart-2))"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}