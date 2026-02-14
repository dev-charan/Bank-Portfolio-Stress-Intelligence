import { useState } from "react";

import { useBanks } from "@/hooks/queries/useBanks";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BankFilters } from "@/features/banks/component/BankFilters";
import { BanksTable } from "@/features/banks/component/BanksTable";

export default function BanksListPage() {
  // Filter states
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Fetch banks data with filters
  const { data, isLoading, error } = useBanks({
    page,
    limit: pageSize,
    search: search || undefined,
    riskLevel: riskLevel !== "ALL" ? riskLevel : undefined,
  });

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleRiskLevelChange = (value: "ALL" | "HIGH" | "MEDIUM" | "LOW") => {
    setRiskLevel(value);
    setPage(1); // Reset to first page on filter
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1); // Reset to first page on page size change
  };

  const handleReset = () => {
    setSearch("");
    setRiskLevel("ALL");
    setPage(1);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting banks data...");
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (data?.pagination && page < data.pagination.pages) {
      setPage((prev) => prev + 1);
    }
  };

  const goToPage = (pageNum: number) => {
    setPage(pageNum);
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive risk assessment and portfolio analysis
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              Failed to load banks
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bank Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive risk assessment and portfolio analysis across all banks
        </p>
      </div>

      {/* Filters */}
      <BankFilters
        search={search}
        onSearchChange={handleSearchChange}
        riskLevel={riskLevel}
        onRiskLevelChange={handleRiskLevelChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        totalResults={data?.pagination?.total}
        onExport={handleExport}
        onReset={handleReset}
      />

      {/* Table */}
      <BanksTable data={data?.banks || []} isLoading={isLoading} />

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          {/* Left - Info */}
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, data.pagination.total)}
            </span>{" "}
            of <span className="font-medium">{data.pagination.total}</span>{" "}
            results
          </p>

          {/* Right - Pagination Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              {page > 3 && (
                <>
                  <Button
                    variant={page === 1 ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => goToPage(1)}
                  >
                    1
                  </Button>
                  {page > 4 && <span className="px-2 text-gray-400">...</span>}
                </>
              )}

              {/* Current and nearby pages */}
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  return (
                    pageNum === page ||
                    pageNum === page - 1 ||
                    pageNum === page + 1 ||
                    pageNum === page - 2 ||
                    pageNum === page + 2
                  );
                })
                .map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}

              {/* Last Page */}
              {page < data.pagination.pages - 2 && (
                <>
                  {page < data.pagination.pages - 3 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <Button
                    variant={
                      page === data.pagination.pages ? "default" : "outline"
                    }
                    size="sm"
                    className="w-9"
                    onClick={() => goToPage(data.pagination.pages)}
                  >
                    {data.pagination.pages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page === data.pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
