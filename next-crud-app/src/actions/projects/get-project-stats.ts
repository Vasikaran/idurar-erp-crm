"use server";

import { cache } from "react";
import { apiCall } from "@/lib/api-client";
import { ProjectStatsData } from "@/lib/types";

export const getProjectStats = cache(async (): Promise<ProjectStatsData> => {
  try {
    const response = await apiCall<ProjectStatsData>(
      "GET",
      "/api/projects/stats"
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch project statistics");
    }

    return response.data!;
  } catch (error) {
    console.error("Error in getProjectStats action:", error);
    return {
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
  }
});
