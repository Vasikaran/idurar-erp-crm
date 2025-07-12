"use server";

import { apiCall } from "@/lib/api-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteProject(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiCall<any>("DELETE", `/api/projects/${id}`);

    if (!response.success) {
      throw new Error(response.error || "Failed to delete project");
    }

    revalidatePath("/projects");
    revalidatePath("/projects/stats");
  } catch (error) {
    console.error("Error in deleteProject action:", error);
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
  redirect("/projects");
}
