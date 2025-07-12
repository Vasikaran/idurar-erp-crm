"use server";

import { apiClient } from "@/lib/api-client";
import { projectSchema } from "@/lib/validations";
import { Project } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData): Promise<void> {
  let projectId: string | undefined;
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

    const response = await apiClient.post<{
      project: Project;
      success: true;
      error: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details: any;
    }>("/api/projects", validatedFields.data);

    if (!response.data.success) {
      console.error("API error:", response.data.error);
      throw new Error(response.data.error || "Failed to create project");
    }

    projectId = response.data.project._id;

    revalidatePath("/projects");
    revalidatePath("/projects/stats");
  } catch (error) {
    console.error("Error in createProject action:", error);
    throw error;
  }
  if (!projectId) {
    throw new Error("Project ID is undefined after creation");
  }
  redirect(`/projects/${projectId}`);
}
