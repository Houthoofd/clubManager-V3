import React from "react";
import type { StoreAnalyticsResponse } from "@clubmanager/types";
import { StatCard } from "./StatCard";

export interface StoreStatsProps {
  data?: StoreAnalyticsResponse;
  isLoading?: boolean;
  error?: Error | null;
  isCompact?: boolean;
}

export const StoreStats: React.FC<StoreStatsProps> = ({ data, isLoading, error, isCompact }) => {
  return (
    <div className="p-6">
      <p className="text-gray-600">Statistiques du magasin - En cours de développement</p>
    </div>
  );
};

export default StoreStats;
