// src/types/index.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface BankStats {
  totalBanks: number;
  totalBranches: number;
  totalRecords: number;
  totalBorrowers: number;
}

export interface UploadResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsFailed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}
