"use server";

import { cache } from "react";
import { apiClient } from "@/lib/api-client";
import { ProjectStatsData } from "@/lib/types";

const fallbackStats: ProjectStatsData = {
  totalProjects: 0,
  projectsByStatus: {
    planning: 0,
    "in-progress": 0,
    completed: 0,
    "on-hold": 0,
    cancelled: 0,
  },
  projectsByPriority: {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  },
  budget: {
    totalBudget: 0,
    averageBudget: 0,
    maxBudget: 0,
    minBudget: 0,
  },
  upcomingDeadlines: [],
};

export const getProjectStats = cache(async (): Promise<ProjectStatsData> => {
  try {
    const response = (
      await apiClient<{ data: ProjectStatsData; success: boolean }>(
        "/api/projects/stats"
      )
    ).data;

    if (!response.success) {
      throw new Error("Failed to fetch project statistics");
    }

    return response.data!;
  } catch (error) {
    console.error("Error in getProjectStats action:", error);

    if (process.env.NODE_ENV === "production") {
      console.log("Production error - returning fallback stats data");
      return fallbackStats;
    }

    console.warn("Development error - returning fallback stats data");
    return fallbackStats;
  }
});
