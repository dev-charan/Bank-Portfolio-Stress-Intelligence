import apiClient from "@/lib/axios";
import { ApiResponse, UploadResponse, CycleData } from "@/types/api.types";
import { CRIFRecord } from "@/types/data.types";

export const uploadAPI = {
  // Upload records
  uploadRecords: async (data: {
    records: CRIFRecord[];
    cycleName: string;
    fileName: string;
  }): Promise<ApiResponse<UploadResponse>> => {
    const response = await apiClient.post("/upload/records", data);
    return response.data;
  },

  // Get all cycles
  getCycles: async (): Promise<ApiResponse<CycleData[]>> => {
    const response = await apiClient.get("/upload/cycles");
    return response.data;
  },

  // Delete cycle
  deleteCycle: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/upload/cycles/${id}`);
    return response.data;
  },
};
