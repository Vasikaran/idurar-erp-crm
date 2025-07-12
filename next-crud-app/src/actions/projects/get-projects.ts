"use server";

import { cache } from "react";
import { apiClient } from "@/lib/api-client";
import { ProjectsResponse, GetProjectsParams } from "@/lib/types";

export const getProjects = cache(
  async (params: GetProjectsParams = {}): Promise<ProjectsResponse> => {
    try {
      const res = await apiClient.get<{
        data: ProjectsResponse;
        success: boolean;
      }>("/api/projects", {
        params,
      });

      return res.data.data;
    } catch (error) {
      console.error("Error in getProjects action:", error);
      throw new Error("Failed to fetch projects");
    }
  }
);
