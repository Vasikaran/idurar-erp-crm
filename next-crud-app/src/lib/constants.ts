export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning", color: "bg-blue-100 text-blue-800" },
  {
    value: "in-progress",
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },
  { value: "on-hold", label: "On Hold", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
] as const;

export const PROJECT_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
