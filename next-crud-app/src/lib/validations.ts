import { z } from "zod";

export const projectSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
    description: z.string().optional(),
    status: z
      .enum(["planning", "in-progress", "completed", "on-hold", "cancelled"])
      .default("planning"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    startDate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      }, "Invalid start date"),
    endDate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      }, "Invalid end date"),
    budget: z.number().min(0, "Budget must be positive").optional(),
    assignedTo: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export const getProjectsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z
    .enum(["planning", "in-progress", "completed", "on-hold", "cancelled"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type GetProjectsData = z.infer<typeof getProjectsSchema>;
