import { getProjects } from "@/actions/projects/get-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectsPage() {
  const projectsData = await getProjects({ limit: 10 });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectsData.projects.map((project) => (
          <Card key={project._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge variant="secondary">{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.description || "No description"}
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">{project.priority}</Badge>
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
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first project to get started
            </p>
            <Button asChild>
              <Link href="/projects/new">Create Project</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
