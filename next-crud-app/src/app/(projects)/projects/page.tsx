import { getProjects } from "@/actions/projects/get-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectFilters } from "@/components/projects/project-filters";
import { Pagination } from "@/components/projects/pagination";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProjectsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
  };
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = {
    page: parseInt(searchParams.page || "1"),
    limit: parseInt(searchParams.limit || "10"),
    status: searchParams.status,
    priority: searchParams.priority,
    search: searchParams.search,
    sortBy: searchParams.sortBy,
    order: searchParams.order,
  };

  const projectsData = await getProjects(params);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProjectFilters />

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {projectsData.projects.length} of{" "}
          {projectsData.pagination.total} projects
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectsData.projects.map((project) => (
          <Card key={project._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.description || "No description"}
              </p>
              <div className="flex justify-between items-center mb-2">
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
                {project.budget && (
                  <span className="text-sm text-gray-500">
                    ${project.budget.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${project._id}`}>View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projectsData.projects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchParams.search ||
              searchParams.status ||
              searchParams.priority
                ? "Try adjusting your filters"
                : "Create your first project to get started"}
            </p>
            <div className="flex gap-2 justify-center">
              {(searchParams.search ||
                searchParams.status ||
                searchParams.priority) && (
                <Button variant="outline" asChild>
                  <Link href="/projects">Clear Filters</Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/projects/new">Create Project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination
        currentPage={projectsData.pagination.page}
        totalPages={projectsData.pagination.totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
