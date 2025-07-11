export interface Project {
  _id: string;
  projectId: string;
  name: string;
  description?: string;
  status: "planning" | "in-progress" | "completed" | "on-hold" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectStats {
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByPriority: Record<string, number>;
  averageBudget: number;
  upcomingDeadlines: Project[];
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string[]>;
}

export interface ProjectsApiResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectFilter {
  status?: Project["status"];
  priority?: Project["priority"];
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
    assignedTo?: { $regex: string; $options: string };
  }>;
  endDate?: {
    $gte?: Date;
    $lte?: Date;
  };
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface ProjectSort {
  [key: string]: 1 | -1;
}

export interface MongoAggregationResult {
  _id: string | null;
  count: number;
}

export interface BudgetStatsResult {
  _id: null;
  totalBudget: number;
  averageBudget: number;
  maxBudget: number;
  minBudget: number;
}

export interface ProjectStatsData {
  totalProjects: number;
  projectsByStatus: {
    planning: number;
    "in-progress": number;
    completed: number;
    "on-hold": number;
    cancelled: number;
  };
  projectsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  budget: {
    totalBudget: number;
    averageBudget: number;
    maxBudget: number;
    minBudget: number;
  };
  upcomingDeadlines: Project[];
}
