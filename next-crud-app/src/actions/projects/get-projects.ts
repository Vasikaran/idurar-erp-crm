"use server";

import { cache } from "react";
import { apiClient } from "@/lib/api-client";
import { ProjectsResponse, GetProjectsParams } from "@/lib/types";

const fallbackProjectsData: ProjectsResponse = {
  projects: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const getProjects = cache(
  async (params: GetProjectsParams = {}): Promise<ProjectsResponse> => {
    try {
      const res = await apiClient.get<{
        data: ProjectsResponse;
        success: boolean;
      }>("/api/projects", {
        params,
      });

      if (!res.data.success) {
        throw new Error("Failed to fetch projects from API");
      }

      return res.data.data;
    } catch (error) {
      console.error("Error in getProjects action:", error);

      if (process.env.NODE_ENV === "production") {
        console.log("Production error - returning fallback projects data");
        return fallbackProjectsData;
      }

      throw new Error("Failed to fetch projects");
    }
  }
);
