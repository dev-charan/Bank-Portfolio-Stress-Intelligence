// src/features/dashboard/components/ExposureByRiskChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, AlertTriangle, Activity, CheckCircle } from "lucide-react";

interface ExposureData {
  categories: string[];
  high_risk: number[];
  medium_risk: number[];
  low_risk: number[];
}

interface ExposureByRiskChartProps {
  data: ExposureData;
}

export function ExposureByRiskChart({ data }: ExposureByRiskChartProps) {
  // Transform data for Recharts
  const chartData = data.categories.map((category, index) => ({
    category,
    "High Risk": data.high_risk[index],
    "Medium Risk": data.medium_risk[index],
    "Low Risk": data.low_risk[index],
    total:
      data.high_risk[index] + data.medium_risk[index] + data.low_risk[index],
  }));

  // Calculate totals
  const totalExposure = chartData.reduce((sum, item) => sum + item.total, 0);
  const highRiskTotal = data.high_risk.reduce((sum, val) => sum + val, 0);
  const mediumRiskTotal = data.medium_risk.reduce((sum, val) => sum + val, 0);
  const lowRiskTotal = data.low_risk.reduce((sum, val) => sum + val, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0,
      );
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
          <div className="font-bold text-gray-900 mb-2 pb-2 border-b border-gray-100">
            {label}
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
                <span className="font-bold text-gray-900">
                  ₹{entry.value.toFixed(0)}K Cr
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="font-bold text-gray-900">
                ₹{total.toFixed(0)}K Cr
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-3 h-3 rounded"
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

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Exposure by Risk Category
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Total exposure breakdown across NPA categories
            </p>
          </div>
          <TrendingUp className="w-4 h-4 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="highRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id="mediumRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id="lowRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="category"
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
                tickFormatter={(value) => `₹${value}K`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
              />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="High Risk"
                stackId="a"
                fill="url(#highRisk)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Medium Risk"
                stackId="a"
                fill="url(#mediumRisk)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Low Risk"
                stackId="a"
                fill="url(#lowRisk)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

       
      </CardContent>
    </Card>
  );
}
