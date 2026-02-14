// src/features/dashboard/components/GeographicRiskMap.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { MapPin, Building2, IndianRupee } from "lucide-react";

interface GeoRiskData {
  state: string;
  city: string;
  risk_score: number;
  exposure: number;
  banks: number;
  lat: number;
  lng: number;
}

interface GeographicRiskMapProps {
  data: GeoRiskData[];
}

export function GeographicRiskMap({ data }: GeographicRiskMapProps) {
  // Normalize and merge duplicate states (case-insensitive)
  const normalizedData = data.reduce(
    (acc, item) => {
      const normalizedState = item.state.trim().toLowerCase();

      // Skip empty states and international locations
      if (
        !normalizedState ||
        normalizedState === "london" ||
        normalizedState === "singapore" ||
        normalizedState === "united states of america" ||
        normalizedState === "hong kong" ||
        normalizedState === "japan" ||
        normalizedState === "overseas" ||
        normalizedState === "manchester"
      ) {
        return acc;
      }

      const existing = acc.find(
        (d) => d.name.toLowerCase() === normalizedState,
      );

      if (existing) {
        // Merge data
        existing.size += item.exposure;
        existing.banks += item.banks;
        existing.risk_score =
          (existing.risk_score * existing.count + item.risk_score) /
          (existing.count + 1);
        existing.count += 1;
      } else {
        // Add new entry with proper capitalization
        const properName = item.state
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        acc.push({
          name: properName,
          size: item.exposure,
          risk_score: item.risk_score,
          banks: item.banks,
          count: 1,
        });
      }

      return acc;
    },
    [] as Array<{
      name: string;
      size: number;
      risk_score: number;
      banks: number;
      count: number;
    }>,
  );

  // Sort by exposure and take top 15 for better visualization
  const treemapData = normalizedData
    .sort((a, b) => b.size - a.size)
    .slice(0, 15);

  const getRiskColor = (score: number) => {
    if (!score || isNaN(score)) return "#9CA3AF"; // Gray for undefined
    if (score >= 70) return "#DC2626";
    if (score >= 40) return "#F59E0B";
    return "#10B981";
  };

  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, risk_score, banks, size } = props;

    // Validate all required props
    if (!name || width < 60 || height < 45 || !risk_score || !banks) {
      return null;
    }

    const fontSize = width < 100 ? 11 : width < 150 ? 12 : 14;
    const safeRiskScore = risk_score || 0;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getRiskColor(safeRiskScore),
            stroke: "#fff",
            strokeWidth: 3,
            opacity: 1,
          }}
          className="hover:opacity-90 transition-opacity cursor-pointer"
        />

        {/* Dark overlay for better text contrast */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: "rgba(0, 0, 0, 0.15)",
            pointerEvents: "none",
          }}
        />

        {/* State name */}
        <text
          x={x + width / 2}
          y={y + height / 2 - 10}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={fontSize}
          fontWeight="700"
          style={{
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            paintOrder: "stroke fill",
            stroke: "rgba(0,0,0,0.3)",
            strokeWidth: "0.5px",
          }}
        >
          {name}
        </text>

        {/* Banks count */}
        {height > 60 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={fontSize - 2}
            fontWeight="600"
            style={{
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              paintOrder: "stroke fill",
              stroke: "rgba(0,0,0,0.3)",
              strokeWidth: "0.5px",
            }}
          >
            {banks} Banks
          </text>
        )}

        {/* Risk score */}
        {height > 75 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 24}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={fontSize - 1}
            fontWeight="700"
            style={{
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              paintOrder: "stroke fill",
              stroke: "rgba(0,0,0,0.3)",
              strokeWidth: "0.5px",
            }}
          >
            Risk: {safeRiskScore.toFixed(1)}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const safeRiskScore = data.risk_score || 0;

      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-blue-500" />
            <p className="font-bold text-gray-900">{data.name}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Risk Score:</span>
              <span
                className="font-bold"
                style={{ color: getRiskColor(safeRiskScore) }}
              >
                {safeRiskScore.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Banks:</span>
              <span className="font-semibold text-gray-900">
                {data.banks || 0}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Exposure:</span>
              <span className="font-semibold text-gray-900">
                ₹{((data.size || 0) / 1000).toFixed(0)}K Cr
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get top 3 states by risk
  const topRiskStates = [...treemapData]
    .filter((state) => state.risk_score)
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 3);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Geographic Risk Distribution
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Top 15 states by exposure (cell size = exposure amount)
            </p>
          </div>
          <MapPin className="w-4 h-4 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Top Risk States */}
        {topRiskStates.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Highest Risk States
            </div>
            {topRiskStates.map((state, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getRiskColor(state.risk_score) }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {state.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Building2 className="w-3 h-3" />
                    {state.banks}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <IndianRupee className="w-3 h-3" />
                    {(state.size / 1000).toFixed(0)}K
                  </div>
                  <div
                    className="text-sm font-bold min-w-[45px] text-right"
                    style={{ color: getRiskColor(state.risk_score) }}
                  >
                    {state.risk_score.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-xs text-gray-600">Critical (≥70)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs text-gray-600">High (40-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Moderate (&lt;40)</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {treemapData.length} states • Indian territories only
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
