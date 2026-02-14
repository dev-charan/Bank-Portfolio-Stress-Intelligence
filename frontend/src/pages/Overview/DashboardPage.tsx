import { useDashboard } from "@/hooks/queries/useDashboard";
import { RiskDistributionChart } from "@/features/overview/components/RiskDistributionChart";
import { Top10BanksChart } from "@/features/overview/components/Top10BanksChart";
import { RiskTrendChart } from "@/features/overview/components/RiskTrendChart";
import { GeographicRiskMap } from "@/features/overview/components/GeographicRiskMap";
import { ExposureByRiskChart } from "@/features/overview/components/ExposureByRiskChart";
import { RiskMetricsMatrix } from "@/features/overview/components/RiskMetricsMatrix";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No dashboard data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Risk Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive risk overview and portfolio analysis
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="text-right">
              <div className="text-xs text-blue-600 font-medium">
                Reporting Cycle
              </div>
              <div className="text-sm font-bold text-blue-700">
                {data.reportingCycle}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row - Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart data={data.riskDistribution} />
        <Top10BanksChart data={data.top10Banks} />
      </div>

      {/* Second Row - Risk Trend (Full Width) */}
      <div className="grid grid-cols-1">
        <RiskTrendChart data={data.riskTrend} />
      </div>

      {/* Third Row - Exposure & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExposureByRiskChart data={data.exposureData} />
        <RiskMetricsMatrix data={data.riskMatrix} />
      </div>

      {/* Fourth Row - Geographic Map (Full Width) */}
      <div className="grid grid-cols-1">
        <GeographicRiskMap data={data.geoRisk} />
      </div>
    </div>
  );
}
