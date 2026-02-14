// src/features/dashboard/components/RiskTrendChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface RiskTrendData {
  months: string[];
  high_risk: number[];
  medium_risk: number[];
  low_risk: number[];
  average: number[];
}

interface RiskTrendChartProps {
  data: RiskTrendData;
}

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  // Transform data for Recharts
  const chartData = data.months.map((month, index) => ({
    month,
    "High Risk": data.high_risk[index],
    "Medium Risk": data.medium_risk[index],
    "Low Risk": data.low_risk[index],
    Average: data.average[index],
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <Calendar className="w-4 h-4 text-gray-500" />
            <p className="font-semibold text-gray-900">{label}</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
                <span className="font-bold text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div
              className="w-8 h-1 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Calculate trend direction
  const calculateTrend = () => {
    if (data.high_risk.length < 2) return null;
    const first = data.high_risk[0];
    const last = data.high_risk[data.high_risk.length - 1];
    const change = last - first;
    const percentage = first !== 0 ? ((change / first) * 100).toFixed(1) : "0";
    return { change, percentage, isIncreasing: change > 0 };
  };

  const trend = calculateTrend();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Risk Trend Over Time
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Number of banks in each risk category by reporting cycle
            </p>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                trend.isIncreasing
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${
                  trend.isIncreasing
                    ? "text-red-600 rotate-0"
                    : "text-green-600 rotate-180"
                }`}
              />
              <div className="text-right">
                <div
                  className={`text-xs font-medium ${
                    trend.isIncreasing ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {trend.isIncreasing ? "↑" : "↓"}{" "}
                  {Math.abs(parseFloat(trend.percentage))}%
                </div>
                <div className="text-xs text-gray-500">High Risk</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />

              {/* Lines with gradients */}
              <Line
                type="monotone"
                dataKey="High Risk"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 2 }}
                fill="url(#colorHigh)"
              />
              <Line
                type="monotone"
                dataKey="Medium Risk"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 2 }}
                fill="url(#colorMedium)"
              />
              <Line
                type="monotone"
                dataKey="Low Risk"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 2 }}
                fill="url(#colorLow)"
              />
              <Line
                type="monotone"
                dataKey="Average"
                stroke="#6366F1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {data.high_risk[data.high_risk.length - 1]}
            </div>
            <div className="text-xs text-gray-500 mt-1">Current High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {data.medium_risk[data.medium_risk.length - 1]}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Current Medium Risk
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.low_risk[data.low_risk.length - 1]}
            </div>
            <div className="text-xs text-gray-500 mt-1">Current Low Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.months.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Reporting Cycles</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
