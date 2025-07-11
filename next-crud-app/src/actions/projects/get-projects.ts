"use server";

import { cache } from "react";
import { apiCall } from "@/lib/api-client";
import { ProjectsResponse, GetProjectsParams } from "@/lib/types";

export const getProjects = cache(
  async (params: GetProjectsParams = {}): Promise<ProjectsResponse> => {
    try {
      const response = await apiCall<ProjectsResponse>(
        "GET",
        "/api/projects",
        null,
        params
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch projects");
      }

      return response.data!;
    } catch (error) {
      console.error("Error in getProjects action:", error);
      throw new Error("Failed to fetch projects");
    }
  }
);
