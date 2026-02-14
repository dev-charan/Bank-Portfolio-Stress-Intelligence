// src/hooks/mutations/useUploadData.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadAPI } from "@/api/upload.api";
import { CRIFRecord } from "@/types/data.types";

interface UploadVariables {
  records: CRIFRecord[];
  cycleName: string;
  fileName: string;
}

export function useUploadData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UploadVariables) =>
      uploadAPI.uploadRecords(variables),

    onMutate: async () => {
      toast.loading("Uploading data to server...", { id: "upload" });
    },

    onSuccess: (response) => {
      // Invalidate cycles query to refetch
      queryClient.invalidateQueries({ queryKey: ["cycles"] });

      const data = response.data;

      // Show success toast
      toast.success("Upload Successful", {
        id: "upload",
        description: `${data?.successCount || 0} records uploaded successfully`,
      });

      // Show warnings if any failures
      if (data?.failCount && data.failCount > 0) {
        toast.warning("Some records failed", {
          description: `${data.failCount} records could not be processed`,
        });
      }
    },

    onError: (error: any) => {
      toast.error("Upload Failed", {
        id: "upload",
        description:
          error.response?.data?.message || "Failed to upload data to server",
      });
    },
  });
}
