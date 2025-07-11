"use server";

import { cache } from "react";
import { apiCall } from "@/lib/api-client";
import { Project } from "@/lib/types";

export const getProject = cache(async (id: string): Promise<Project | null> => {
  try {
    const response = await apiCall<{ project: Project }>(
      "GET",
      `/api/projects/${id}`
    );

    if (!response.success) {
      if (response.error === "Project not found") {
        return null;
      }
      throw new Error(response.error || "Failed to fetch project");
    }

    return response.data!.project;
  } catch (error) {
    console.error("Error in getProject action:", error);
    return null;
  }
});
