
export interface BankMetrics {
  id: string;
  name: string;
  code?: string;
  compositeScore: number;
  riskCategory: "HIGH" | "MEDIUM" | "LOW";
  exposureGrowth: number;
  escalationRate: number;
  persistenceRate: number;
  geoConcentration: number;
  totalExposure: number;
  totalRecords: number;
  suitFiledCount: number;
  branchCount: number;
  borrowerCount: number;
  topState?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BanksListParams {
  page?: number;
  limit?: number;
  search?: string;
  riskLevel?: "ALL" | "HIGH" | "MEDIUM" | "LOW";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BanksListResponse {
  banks: BankMetrics[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BankDetail extends BankMetrics {
  branches: Array<{
    id: string;
    name: string;
    state: string;
  }>;
  monthlyExposure: Array<{
    cycle: string;
    exposure: number;
    recordCount: number;
    suitFiledCount: number;
  }>;
  stateDistribution: Array<{
    state: string;
    exposure: number;
    percentage: number;
  }>;
  topBorrowers: Array<{
    id: string;
    name: string;
    pan?: string;
    totalExposure: number;
    cycleCount: number;
    suitFiled: boolean;
  }>;
  riskBreakdown: {
    exposureTrendScore: number;
    escalationScore: number;
    persistenceScore: number;
    geoConcentrationScore: number;
  };
}

export type SortDirection = "asc" | "desc" | false;

export interface TableSortState {
  column: string;
  direction: SortDirection;
}
