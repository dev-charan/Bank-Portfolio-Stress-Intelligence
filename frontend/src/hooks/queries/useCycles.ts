// src/hooks/queries/useCycles.ts
import { useQuery } from "@tanstack/react-query";
import { uploadAPI } from "@/api/upload.api";

export function useCycles() {
  return useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const response = await uploadAPI.getCycles();
      return response.data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
