import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/api/dashboard.api";

export function useDashboardKPIs(cycle?: string) {
  return useQuery({
    queryKey: ["dashboard-kpis", cycle],
    queryFn: async () => {
      const response = await dashboardAPI.getKPIs(cycle);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
