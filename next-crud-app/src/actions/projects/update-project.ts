"use server";

import { apiClient } from "@/lib/api-client";
import { projectSchema } from "@/lib/validations";
import { Project } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProject(
  id: string,
  formData: FormData
): Promise<void> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      budget: formData.get("budget")
        ? Number(formData.get("budget"))
        : undefined,
      assignedTo: formData.get("assignedTo") as string,
      tags: formData.get("tags")
        ? (formData.get("tags") as string)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    };

    const validatedFields = projectSchema.safeParse(rawData);

    if (!validatedFields.success) {
      console.error(
        "Validation error:",
        validatedFields.error.flatten().fieldErrors
      );
      throw new Error("Invalid form data");
    }

    const response = (
      await apiClient.put<{
        data: { project: Project };
        success: boolean;
        error: string;
      }>(`/api/projects/${id}`, validatedFields.data)
    ).data;

    if (!response.success) {
      console.error("API error:", response.error);
      throw new Error(response.error || "Failed to update project");
    }

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath(`/projects/${id}/edit`);
    revalidatePath("/projects/stats");
  } catch (error) {
    console.error("Error in updateProject action:", error);
    throw error;
  }
  redirect(`/projects/${id}`);
}
