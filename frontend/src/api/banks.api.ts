import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  BankMetrics,
  BanksListParams,
  BanksListResponse,
  BankDetail,
} from "@/types/bank.types";

export const banksAPI = {
  // Get all banks with analytics (paginated, searchable, filterable)
  getBanks: async (
    params: BanksListParams = {},
  ): Promise<ApiResponse<BanksListResponse>> => {
    const response = await apiClient.get("/analytics/banks", {
      params: {
        page: params.page || 1,
        limit: params.limit || 25,
        search: params.search || undefined,
        riskLevel:
          params.riskLevel && params.riskLevel !== "ALL"
            ? params.riskLevel
            : undefined,
        sortBy: params.sortBy || "compositeScore",
        sortOrder: params.sortOrder || "desc",
      },
    });
    return response.data;
  },

  // Get bank by ID with detailed analytics
  getBankById: async (id: string): Promise<ApiResponse<BankDetail>> => {
    const response = await apiClient.get(`/banks/${id}`);
    return response.data;
  },

  // Get bank statistics
  getBankStats: async (
    id: string,
    cycle?: string,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/banks/${id}/stats`, {
      params: { cycle },
    });
    return response.data;
  },

  // Get all banks (simple list without analytics - for dropdowns)
  getAllBanksSimple: async (): Promise<
    ApiResponse<Array<{ id: string; name: string }>>
  > => {
    const response = await apiClient.get("/banks");
    return response.data;
  },
};
