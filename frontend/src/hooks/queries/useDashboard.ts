import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/api/dashboard.api";

interface UseDashboardOptions {
  cycle?: string;
  enabled?: boolean;
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const { cycle, enabled = true } = options;

  return useQuery({
    queryKey: ["dashboard", cycle],
    queryFn: async () => {
      const response = await dashboardAPI.getDashboard(cycle);
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
