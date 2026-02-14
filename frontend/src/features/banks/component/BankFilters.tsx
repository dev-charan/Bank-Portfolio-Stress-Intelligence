// src/components/banks/BankFilters.tsx
import { Search, Filter, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BankFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  riskLevel: "ALL" | "HIGH" | "MEDIUM" | "LOW";
  onRiskLevelChange: (value: "ALL" | "HIGH" | "MEDIUM" | "LOW") => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  totalResults?: number;
  onExport?: () => void;
  onReset?: () => void;
}

export function BankFilters({
  search,
  onSearchChange,
  riskLevel,
  onRiskLevelChange,
  pageSize,
  onPageSizeChange,
  totalResults,
  onExport,
  onReset,
}: BankFiltersProps) {
  const hasActiveFilters = search !== "" || riskLevel !== "ALL";

  return (
    <div className="space-y-4">
      {/* Top Row - Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left Side - Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search banks by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Right Side - Filters and Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={riskLevel}
              onValueChange={(value) =>
                onRiskLevelChange(value as "ALL" | "HIGH" | "MEDIUM" | "LOW")
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    High Risk
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    Medium Risk
                  </div>
                </SelectItem>
                <SelectItem value="LOW">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Low Risk
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Size Selector */}
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && onReset && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row - Active Filters and Results Count */}
      <div className="flex items-center justify-between">
        {/* Active Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: {search}
              <X
                className="h-3 w-3 cursor-pointer hover:text-gray-900"
                onClick={() => onSearchChange("")}
              />
            </Badge>
          )}
          {riskLevel !== "ALL" && (
            <Badge
              variant="secondary"
              className={`gap-1 ${
                riskLevel === "HIGH"
                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                  : riskLevel === "MEDIUM"
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    : "bg-green-100 text-green-800 hover:bg-green-100"
              }`}
            >
              Risk: {riskLevel}
              <X
                className="h-3 w-3 cursor-pointer hover:text-gray-900"
                onClick={() => onRiskLevelChange("ALL")}
              />
            </Badge>
          )}
        </div>

        {/* Results Count */}
        {totalResults !== undefined && (
          <p className="text-sm text-gray-600">
            {totalResults} {totalResults === 1 ? "bank" : "banks"} found
          </p>
        )}
      </div>
    </div>
  );
}
