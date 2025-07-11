"use server";

import { apiCall } from "@/lib/api-client";
import { projectSchema } from "@/lib/validations";
import { Project } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
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
      return {
        error: "Invalid form data",
        details: validatedFields.error.flatten().fieldErrors,
      };
    }

    const response = await apiCall<{ project: Project }>(
      "POST",
      "/api/projects",
      validatedFields.data
    );

    if (!response.success) {
      return {
        error: response.error || "Failed to create project",
        details: response.details,
      };
    }

    revalidatePath("/projects");
    revalidatePath("/projects/stats");

    redirect(`/projects/${response.data!.project._id}`);
  } catch (error) {
    console.error("Error in createProject action:", error);
    return {
      error: "Failed to create project",
    };
  }
}
