// src/hooks/mutations/useDeleteCycle.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadAPI } from "@/api/upload.api";

export function useDeleteCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => uploadAPI.deleteCycle(id),

    onMutate: async () => {
      toast.loading("Deleting cycle...", { id: "delete-cycle" });
    },

    onSuccess: () => {
      // Invalidate cycles query
      queryClient.invalidateQueries({ queryKey: ["cycles"] });

      toast.success("Cycle Deleted", {
        id: "delete-cycle",
        description: "The reporting cycle has been removed",
      });
    },

    onError: (error: any) => {
      toast.error("Delete Failed", {
        id: "delete-cycle",
        description: error.response?.data?.message || "Failed to delete cycle",
      });
    },
  });
}
