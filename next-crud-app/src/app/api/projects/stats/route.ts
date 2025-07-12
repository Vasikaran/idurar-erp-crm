import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/lib/models/project";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalProjects,
      statusStats,
      priorityStats,
      budgetStats,
      upcomingDeadlines,
    ] = await Promise.all([
      Project.countDocuments(),

      Project.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Project.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),

      Project.aggregate([
        {
          $group: {
            _id: null,
            totalBudget: { $sum: "$budget" },
            averageBudget: { $avg: "$budget" },
            maxBudget: { $max: "$budget" },
            minBudget: { $min: "$budget" },
          },
        },
      ]),

      Project.find({
        endDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        status: { $in: ["planning", "in-progress"] },
      })
        .sort({ endDate: 1 })
        .limit(5)
        .lean(),
    ]);

    const projectsByStatus = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const projectsByPriority = priorityStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalProjects,
      projectsByStatus: {
        planning: projectsByStatus.planning || 0,
        "in-progress": projectsByStatus["in-progress"] || 0,
        completed: projectsByStatus.completed || 0,
        "on-hold": projectsByStatus["on-hold"] || 0,
        cancelled: projectsByStatus.cancelled || 0,
      },
      projectsByPriority: {
        low: projectsByPriority.low || 0,
        medium: projectsByPriority.medium || 0,
        high: projectsByPriority.high || 0,
        urgent: projectsByPriority.urgent || 0,
      },
      budget: budgetStats[0] || {
        totalBudget: 0,
        averageBudget: 0,
        maxBudget: 0,
        minBudget: 0,
      },
      upcomingDeadlines,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching project statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project statistics",
      },
      { status: 500 }
    );
  }
}
