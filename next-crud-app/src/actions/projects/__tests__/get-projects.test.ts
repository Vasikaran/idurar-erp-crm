import { getProjects } from "../get-projects";
import { apiClient } from "@/lib/api-client";
import { ProjectsResponse } from "@/lib/types";

jest.mock("@/lib/api-client");
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("getProjects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch projects successfully", async () => {
    const mockResponse: ProjectsResponse = {
      projects: [
        {
          _id: "1",
          projectId: "proj_123",
          name: "Test Project",
          description: "Test Description",
          status: "planning",
          priority: "medium",
          tags: ["test"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    mockApiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: mockResponse,
      },
    });

    const result = await getProjects({ page: 1, limit: 10 });

    expect(mockApiClient.get).toHaveBeenCalledWith("/api/projects", {
      params: { page: 1, limit: 10 },
    });
    expect(result).toEqual(mockResponse);
  });

  it("should filter out undefined and empty parameters", async () => {
    mockApiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          projects: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      },
    });

    await getProjects({
      page: 1,
      status: "planning",
      priority: undefined,
      search: "",
    });

    expect(mockApiClient.get).toHaveBeenCalledWith("/api/projects", {
      params: { page: 1, status: "planning" },
    });
  });
});
