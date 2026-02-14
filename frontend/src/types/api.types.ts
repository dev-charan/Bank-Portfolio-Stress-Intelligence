// src/types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  cycleId: string;
  totalRecords: number;
  successCount: number;
  failCount: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export interface CycleData {
  id: string;
  cycleName: string;
  fileName: string;
  recordCount: number;
  uploadDate: string;
  status: "processing" | "completed" | "error";
  errorMessage?: string;
}

export interface BankData {
  id: string;
  name: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    records: number;
    branches: number;
  };
}

export interface BankMetrics {
  id: string;
  name: string;
  code: string | null;
  compositeScore: number;
  riskCategory: string;
  totalExposure: number;
  exposureGrowth: number;
  escalationRate: number;
  persistenceRate: number;
  geoConcentration: number;
  suitFiledPercentage: number;
}

export interface BankBranch {
  id: string;
  name: string;
  state: string;
}

export interface BankInfo {
  id: string;
  name: string;
  code: string | null;
  totalBranches: number;
  branches: BankBranch[];
}

export interface BankMetricsDetail {
  compositeScore: number;
  riskCategory: string;
  totalExposure: number;
  totalBorrowers: number;
  exposureGrowth: number;
  borrowerGrowth: number;
  escalationRate: number;
  persistenceRate: number;
  geoConcentration: number;
  topState: string | null;
  suitFiledCount: number;
  suitFiledPercentage: number;
  stateDistribution: Record<string, number> | null;
  npaDistribution: Record<string, number> | null;
}

export interface HistoricalTrend {
  cycle: string;
  score: number;
  exposure: number;
  riskCategory: string;
}

export interface BankAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface TopBorrower {
  name: string;
  pan: string | null;
  outstandingAmount: number;
  suitFiled: boolean;
  assetClassification: string | null;
}

export interface BankDetailsData {
  bank: BankInfo;
  metrics: BankMetricsDetail;
  historicalTrend: HistoricalTrend[];
  alerts: BankAlert[];
  topBorrowers: TopBorrower[];
}