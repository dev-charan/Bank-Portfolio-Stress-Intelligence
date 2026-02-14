import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/api/dashboard.api";

export function useExposureData(cycle?: string) {
  return useQuery({
    queryKey: ["exposure-data", cycle],
    queryFn: async () => {
      const response = await dashboardAPI.getDashboard(cycle);
      return response.data?.exposureData;
    },
    staleTime: 1000 * 60 * 5,
  });
}
