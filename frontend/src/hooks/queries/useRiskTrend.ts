import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/api/dashboard.api";

export function useRiskTrend(cycle?: string) {
  return useQuery({
    queryKey: ["risk-trend", cycle],
    queryFn: async () => {
      const response = await dashboardAPI.getDashboard(cycle);
      return response.data?.riskTrend;
    },
    staleTime: 1000 * 60 * 5,
  });
}
