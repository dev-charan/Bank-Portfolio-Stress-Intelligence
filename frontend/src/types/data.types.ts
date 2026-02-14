
export interface CRIFRecord {
  bankName: string;
  borrowerName: string;
  outstandingAmount: number;
  suitFiled: "Y" | "N";
  state: string;
  reportingCycle: string;
}

export interface UploadedCycle {
  id: string;
  cycleName: string;
  fileName: string;
  recordCount: number;
  uploadDate: Date;
  status: "processing" | "completed" | "error";
  errorMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
}
