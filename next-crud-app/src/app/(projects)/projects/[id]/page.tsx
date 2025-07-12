import { getProject } from "@/actions/projects/get-project";
import { deleteProject } from "@/actions/projects/delete-project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const paramsResolved = await params;
  const project = await getProject(paramsResolved.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/projects/${project._id}/edit`}>Edit</Link>
          </Button>
          <form
            action={deleteProject.bind(null, project._id)}
            className="inline"
          >
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge>{project.status}</Badge>
              <Badge variant="outline">{project.priority}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Project Details</h3>
              <div className="space-y-2">
                <p>
                  <strong>Project ID:</strong> {project.projectId}
                </p>
                {project.assignedTo && (
                  <p>
                    <strong>Assigned To:</strong> {project.assignedTo}
                  </p>
                )}
                {project.budget && (
                  <p>
                    <strong>Budget:</strong> ${project.budget.toLocaleString()}
                  </p>
                )}
                {project.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Timeline</h3>
              <div className="space-y-2">
                {project.startDate && (
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                )}
                {project.endDate && (
                  <p>
                    <strong>End Date:</strong>{" "}
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                )}
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
