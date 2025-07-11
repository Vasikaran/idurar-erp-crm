import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/lib/models/project";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json({
        success: true,
        data: { projects: [] },
      });
    }

    const projects = await Project.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { assignedTo: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    console.error("Error searching projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search projects",
      },
      { status: 500 }
    );
  }
}
