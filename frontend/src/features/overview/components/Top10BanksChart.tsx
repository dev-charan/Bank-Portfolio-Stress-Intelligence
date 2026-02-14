// src/features/dashboard/components/Top10BanksChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ChevronRight } from "lucide-react";

interface Bank {
  id: string;
  name: string;
  score: number;
}

interface Top10BanksChartProps {
  data: Bank[];
}

export function Top10BanksChart({ data }: Top10BanksChartProps) {
  const navigate = useNavigate();
  const maxScore = Math.max(...data.map((b) => b.score));

  const getBarColor = (score: number) => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-green-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Top 5 High-Risk Banks
            </CardTitle>
          </div>
          <TrendingUp className="w-4 h-4 text-red-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.slice(0, 5).map((bank, index) => (
          <div
            key={bank.id}
            className="group cursor-pointer"
            onClick={() => navigate(`/banks/${bank.id}`)}
          >
            <div className="flex items-center gap-3 mb-2">
              {/* Rank Badge */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {index + 1}
                </span>
              </div>

              {/* Bank Name */}
              <span className="flex-1 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {bank.name}
              </span>

              {/* Score */}
              <span
                className={`text-sm font-bold ${getScoreColor(bank.score)}`}
              >
                {bank.score}
              </span>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-10">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${getBarColor(bank.score)} transition-all duration-300 group-hover:opacity-90`}
                style={{ width: `${(bank.score / maxScore) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
