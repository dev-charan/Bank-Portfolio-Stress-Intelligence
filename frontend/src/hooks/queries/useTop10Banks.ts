import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/api/dashboard.api";

export function useTop10Banks(cycle?: string) {
  return useQuery({
    queryKey: ["top10-banks", cycle],
    queryFn: async () => {
      const response = await dashboardAPI.getDashboard(cycle);
      return response.data?.top10Banks || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
