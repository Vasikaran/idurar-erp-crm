"use server";

import { cache } from "react";
import { apiCall } from "@/lib/api-client";
import { Project } from "@/lib/types";

export const searchProjects = cache(
  async (query: string, limit: number = 10): Promise<Project[]> => {
    try {
      if (!query.trim()) {
        return [];
      }

      const response = await apiCall<{ projects: Project[] }>(
        "GET",
        "/api/projects/search",
        null,
        { q: query, limit }
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to search projects");
      }

      return response.data!.projects;
    } catch (error) {
      console.error("Error in searchProjects action:", error);
      return [];
    }
  }
);
