import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORY_LABELS, CATEGORY_COLORS, ExpenseCategory } from '@/types/expense';

interface CategoryChartProps {
  data: { category: ExpenseCategory; total: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    name: CATEGORY_LABELS[item.category],
    value: item.total,
    color: CATEGORY_COLORS[item.category],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-center">
            No expenses this month.<br />Add some expenses to see the breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg transition-colors duration-300">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
                  'Amount',
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                formatter={(value, entry: any) => {
                  const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                  return (
                    <span className="text-sm text-muted-foreground transition-colors duration-300">
                      {value} ({percentage}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
