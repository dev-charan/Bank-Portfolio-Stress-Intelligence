import { useMutation, useQueryClient } from "@tanstack/react-query";
import { metricsAPI } from "@/api/metrics.api";
import { toast } from "sonner";

export function useCalculateMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportingCycle: string) =>
      metricsAPI.calculateMetrics({ reportingCycle }),
    onSuccess: (data) => {
      toast.success(
        `Metrics calculated for ${data.data?.banksProcessed} banks`,
      );
      // Invalidate dashboard queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to calculate metrics: ${error.message}`);
    },
  });
}
