import { useQuery } from "@tanstack/react-query";
import { metricsAPI } from "@/api/metrics.api";

export function useCalculationStatus(cycle: string, enabled = true) {
  return useQuery({
    queryKey: ["calculation-status", cycle],
    queryFn: async () => {
      const response = await metricsAPI.getCalculationStatus(cycle);
      return response.data;
    },
    enabled: enabled && !!cycle,
    refetchInterval: (data) => {
      // Auto-refetch every 5 seconds if not complete
      return data?.isComplete ? false : 5000;
    },
  });
}
