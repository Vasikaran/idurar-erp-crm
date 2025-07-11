// src/actions/projects/delete-project.ts
"use server";

import { apiCall } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteProject(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiCall<any>("DELETE", `/api/projects/${id}`);

    if (!response.success) {
      return {
        error: response.error || "Failed to delete project",
      };
    }

    // Revalidate paths
    revalidatePath("/projects");
    revalidatePath("/projects/stats");

    // Redirect to projects list
    redirect("/projects");
  } catch (error) {
    console.error("Error in deleteProject action:", error);
    return {
      error: "Failed to delete project",
    };
  }
}
