// src/components/data/ModelActions.tsx
import { Play, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface ModelActionsProps {
  lastRunDate: Date | null;
  cycleCount: number;
  onRunModel: () => void;
  onRecompute: () => void;
  isRunning: boolean;
}

export function ModelActions({
  lastRunDate,
  cycleCount,
  onRunModel,
  onRecompute,
  isRunning,
}: ModelActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Risk Model Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Model Status</p>
            <p className="text-sm text-gray-600 mt-1">
              {cycleCount} cycles available for analysis
            </p>
            {lastRunDate && (
              <p className="text-xs text-gray-500 mt-1">
                Last run {formatDistanceToNow(lastRunDate, { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onRunModel}
            disabled={cycleCount < 5 || isRunning}
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running Model..." : "Run Risk Model"}
          </Button>

          <Button
            variant="outline"
            onClick={onRecompute}
            disabled={!lastRunDate || isRunning}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recompute All Scores
          </Button>
        </div>

        {cycleCount < 5 && (
          <p className="text-xs text-amber-600 text-center">
            Upload at least 5 reporting cycles to run the model
          </p>
        )}
      </CardContent>
    </Card>
  );
}
