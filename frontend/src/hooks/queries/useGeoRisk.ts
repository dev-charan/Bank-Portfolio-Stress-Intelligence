import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/api/dashboard.api";

export function useGeoRisk(cycle?: string) {
  return useQuery({
    queryKey: ["geo-risk", cycle],
    queryFn: async () => {
      const response = await dashboardAPI.getDashboard(cycle);
      return response.data?.geoRisk || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
