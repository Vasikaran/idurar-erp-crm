import { createProject } from "../create-project";
import { apiClient } from "@/lib/api-client";

jest.mock("@/lib/api-client");
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("createProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create project successfully with FormData", async () => {
    const formData = new FormData();
    formData.append("name", "New Project");
    formData.append("description", "Test Description");
    formData.append("status", "planning");
    formData.append("priority", "medium");
    formData.append("tags", "test,project");
    formData.append("assignedTo", "user123");
    formData.append("startDate", "2025-01-01");
    formData.append("endDate", "2025-12-31");

    mockApiClient.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          project: {
            _id: "1",
            projectId: "proj_123",
            name: "New Project",
            description: "Test Description",
            status: "planning",
            priority: "medium",
            tags: ["test", "project"],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        message: "Project created successfully",
      },
    });

    await createProject(formData);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/api/projects",
      expect.any(Object)
    );
  });

  it("should handle validation errors", async () => {
    const formData = new FormData();
    formData.append("name", "");
    formData.append("description", "test");
    formData.append("status", "planning");
    formData.append("priority", "medium");
    formData.append("assignedTo", "user123");
    formData.append("startDate", "2025-01-01");
    formData.append("endDate", "2025-12-31");

    await expect(createProject(formData)).rejects.toThrow("Invalid form data");
  });

  it("should handle network errors", async () => {
    const formData = new FormData();
    formData.append("name", "New Project");
    formData.append("description", "Some description");
    formData.append("status", "planning");
    formData.append("priority", "medium");
    formData.append("assignedTo", "user123");
    formData.append("startDate", "2025-01-01");
    formData.append("endDate", "2025-12-31");

    mockApiClient.post.mockRejectedValue(new Error("Network error"));

    await expect(createProject(formData)).rejects.toThrow("Network error");
  });

  it("should handle optional fields correctly", async () => {
    const formData = new FormData();
    formData.append("name", "New Project");
    formData.append("description", "This is a project"); // ✅ Required
    formData.append("status", "planning");
    formData.append("priority", "medium");
    formData.append("budget", "5000");
    formData.append("assignedTo", "user123");
    formData.append("startDate", "2025-01-01");
    formData.append("endDate", "2025-12-31");

    mockApiClient.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          project: {
            _id: "1",
            projectId: "proj_123",
            name: "New Project",
            description: "This is a project",
            status: "planning",
            priority: "medium",
            budget: 5000,
            assignedTo: "user123",
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-12-31"),
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    await createProject(formData);

    expect(mockApiClient.post).toHaveBeenCalled();
  });
});
