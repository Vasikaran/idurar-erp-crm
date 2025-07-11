import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/lib/models/project";
import { projectSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import {
  Project as ProjectType,
  ProjectFilter,
  ProjectSort,
} from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const skip = (page - 1) * limit;
    const filter: ProjectFilter = {};

    if (
      status &&
      ["planning", "in-progress", "completed", "on-hold", "cancelled"].includes(
        status
      )
    ) {
      filter.status = status as ProjectType["status"];
    }

    if (priority && ["low", "medium", "high", "urgent"].includes(priority)) {
      filter.priority = priority as ProjectType["priority"];
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { assignedTo: { $regex: search, $options: "i" } },
      ];
    }

    const sort: ProjectSort = {};
    const validSortFields = [
      "name",
      "createdAt",
      "updatedAt",
      "status",
      "priority",
      "budget",
      "startDate",
      "endDate",
    ];

    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sort["createdAt"] = -1;
    }

    const [projects, total] = await Promise.all([
      Project.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Project.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const validatedFields = projectSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const project = await Project.create({
      ...validatedFields.data,
      projectId: `proj_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      startDate: validatedFields.data.startDate
        ? new Date(validatedFields.data.startDate)
        : undefined,
      endDate: validatedFields.data.endDate
        ? new Date(validatedFields.data.endDate)
        : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: { project },
        message: "Project created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
      },
      { status: 500 }
    );
  }
}
