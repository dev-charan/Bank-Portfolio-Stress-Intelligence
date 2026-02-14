// src/features/dashboard/components/RiskMetricsMatrix.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface RiskMetric {
  bank: string;
  escalation: number;
  persistence: number;
  growth: number;
}

interface RiskMetricsMatrixProps {
  data: RiskMetric[];
}

export function RiskMetricsMatrix({ data }: RiskMetricsMatrixProps) {
  const getColorClass = (value: number, type: "rate" | "growth") => {
    if (type === "rate") {
      if (value >= 80) return "text-red-600 bg-red-50";
      if (value >= 60) return "text-amber-600 bg-amber-50";
      return "text-green-600 bg-green-50";
    } else {
      if (value > 10) return "text-red-600 bg-red-50";
      if (value > 5) return "text-amber-600 bg-amber-50";
      if (value > 0) return "text-blue-600 bg-blue-50";
      return "text-green-600 bg-green-50";
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Risk Metrics Matrix
          </CardTitle>
          <Activity className="w-4 h-4 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-xs text-gray-600">
                  Bank
                </th>
                <th className="text-center py-2 px-2 font-semibold text-xs text-gray-600">
                  Escalation
                </th>
                <th className="text-center py-2 px-2 font-semibold text-xs text-gray-600">
                  Persistence
                </th>
                <th className="text-center py-2 px-2 font-semibold text-xs text-gray-600">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 text-xs truncate">
                        {row.bank}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-1 rounded-md font-semibold text-xs ${getColorClass(row.escalation, "rate")}`}
                      >
                        {row.escalation.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-1 rounded-md font-semibold text-xs ${getColorClass(row.persistence, "rate")}`}
                      >
                        {row.persistence.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-1 rounded-md font-semibold text-xs flex items-center gap-1 ${getColorClass(row.growth, "growth")}`}
                      >
                        {row.growth > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {row.growth > 0 ? "+" : ""}
                        {row.growth.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compact Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Healthy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
