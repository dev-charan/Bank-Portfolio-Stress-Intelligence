import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";

export interface CalculateMetricsRequest {
  reportingCycle: string;
}

export interface CalculationResult {
  bankId: string;
  compositeScore: number;
  riskCategory: string;
}

export interface CalculateMetricsResponse {
  reportingCycle: string;
  banksProcessed: number;
  results: CalculationResult[];
}

export interface CalculationStatus {
  reportingCycle: string;
  totalRecords: number;
  totalBanks: number;
  calculatedBanks: number;
  isComplete: boolean;
  percentage: string;
}

export const metricsAPI = {
  // Calculate metrics for all banks in a cycle
  calculateMetrics: async (
    data: CalculateMetricsRequest,
  ): Promise<ApiResponse<CalculateMetricsResponse>> => {
    const response = await apiClient.post("/metrics/calculate", data);
    return response.data;
  },

  // Calculate metrics for specific bank
  calculateBankMetrics: async (
    bankId: string,
    reportingCycle: string,
  ): Promise<ApiResponse> => {
    const response = await apiClient.post(`/metrics/calculate/${bankId}`, {
      reportingCycle,
    });
    return response.data;
  },

  // Get calculation status
  getCalculationStatus: async (
    cycle: string,
  ): Promise<ApiResponse<CalculationStatus>> => {
    const response = await apiClient.get(`/metrics/status/${cycle}`);
    return response.data;
  },
};
