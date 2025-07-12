"use server";

import { cache } from "react";
import { apiClient } from "@/lib/api-client";
import { Project } from "@/lib/types";

export const getProject = cache(async (id: string): Promise<Project | null> => {
  try {
    const response = await apiClient.get<{
      data: { project: Project };
      success: boolean;
      error: string;
    }>(`/api/projects/${id}`);

    if (!response.data.success) {
      if (response.data.error === "Project not found") {
        return null;
      }
      throw new Error(response.data.error || "Failed to fetch project");
    }

    return response.data.data.project;
  } catch (error) {
    console.error("Error in getProject action:", error);
    return null;
  }
});
