// src/features/dashboard/components/RiskDistributionChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface RiskDistributionData {
  high: number;
  medium: number;
  low: number;
}

interface RiskDistributionChartProps {
  data: RiskDistributionData;
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const chartData = [
    {
      name: "High Risk",
      value: data.high,
      color: "#EF4444",
      icon: AlertTriangle,
    },
    {
      name: "Medium Risk",
      value: data.medium,
      color: "#F59E0B",
      icon: TrendingUp,
    },
    { name: "Low Risk", value: data.low, color: "#10B981", icon: TrendingDown },
  ];

  const total = data.high + data.medium + data.low;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p
            className="text-2xl font-bold"
            style={{ color: data.payload.color }}
          >
            {data.value}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {((data.value / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Risk Distribution
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">Portfolio risk breakdown</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Chart */}
          <div className="relative">
            <div className="h-[240px] w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-4xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-500 font-medium">
                Total Banks
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 w-full space-y-3">
            {chartData.map((item) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              const Icon = item.icon;

              return (
                <div
                  key={item.name}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: item.color }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">
                          {item.name}
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-bold text-gray-900">
                            {item.value}
                          </span>
                          <span className="text-sm text-gray-500">banks</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: item.color }}
                      >
                        {percentage}%
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        of portfolio
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-90"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
