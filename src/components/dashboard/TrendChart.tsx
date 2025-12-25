import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense } from '@/types/expense';
import { format, getDate, getDaysInMonth, startOfMonth } from 'date-fns';
import { useCurrency } from '@/context/CurrencyContext';
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
    expenses: Expense[];
}

export function TrendChart({ expenses }: TrendChartProps) {
    const { formatAmount } = useCurrency();

    const data = useMemo(() => {
        if (expenses.length === 0) return [];

        const now = new Date();
        const daysInMonth = getDaysInMonth(now);
        // Initialize array with 0 for all days up to today (or end of month)
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            total: 0,
        }));

        // Sum up expenses per day
        expenses.forEach((expense) => {
            const date = new Date(expense.expense_date);
            // Ensure we only chart cumulative for the current month relevant to the passed expenses
            // Assuming parent filters expenses to current month, we just take the day.
            const day = getDate(date);
            if (day >= 1 && day <= daysInMonth) {
                dailyData[day - 1].total += expense.amount;
            }
        });

        // Determine how many days to show (e.g. up to today if current month, or all if past)
        // For simplicity, just show all days that have passed or up to today
        const currentDay = getDate(now);
        return dailyData.filter(d => d.day <= currentDay);

    }, [expenses]);

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Spending Trend (Daily)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                            <XAxis
                                dataKey="day"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `Day ${value}`}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `\u00A4${value}`} // Generic currency symbol just for axis
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                                formatter={(value: number) => [formatAmount(value), 'Total']}
                                labelFormatter={(label) => `Day ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
