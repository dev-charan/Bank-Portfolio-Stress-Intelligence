import apiClient from "@/lib/axios";
import {
  ApiResponse,
  DashboardData,
  DashboardKPIs,
  RiskDistribution,
  Top10Bank,
  RiskTrend,
  GeoRisk,
  ExposureData,
  RiskMetric,
} from "@/types/api.types";

export const dashboardAPI = {
  // Get complete dashboard data
  getDashboard: async (cycle?: string): Promise<ApiResponse<DashboardData>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(`/dashboard?${params.toString()}`);
    return response.data;
  },

  // Get KPIs only
  getKPIs: async (cycle?: string): Promise<ApiResponse<DashboardKPIs>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(
      `/dashboard/kpis?${params.toString()}`,
    );
    return response.data;
  },

  // Get risk distribution
  getRiskDistribution: async (
    cycle?: string,
  ): Promise<ApiResponse<RiskDistribution>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(`/dashboard?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data?.riskDistribution,
    };
  },

  // Get top 10 high-risk banks
  getTop10Banks: async (cycle?: string): Promise<ApiResponse<Top10Bank[]>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(`/dashboard?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data?.top10Banks || [],
    };
  },

  // Get risk trend over time
  getRiskTrend: async (cycle?: string): Promise<ApiResponse<RiskTrend>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(`/dashboard?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data?.riskTrend,
    };
  },

  // Get geographic risk data
  getGeoRisk: async (cycle?: string): Promise<ApiResponse<GeoRisk[]>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(`/dashboard?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data?.geoRisk || [],
    };
  },

  // Get exposure by risk category
  getExposureData: async (
    cycle?: string,
  ): Promise<ApiResponse<ExposureData>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(`/dashboard?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data?.exposureData,
    };
  },

  // Get risk metrics matrix
  getRiskMatrix: async (cycle?: string): Promise<ApiResponse<RiskMetric[]>> => {
    const params = new URLSearchParams();
    if (cycle) params.append("cycle", cycle);

    const response = await apiClient.get(`/dashboard?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data?.riskMatrix || [],
    };
  },
};
