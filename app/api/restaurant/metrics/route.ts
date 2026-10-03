import { NextRequest, NextResponse } from "next/server";
import { getMetrics, insertMetric, updateMetric } from "@/db/restaurant-metrics";
import type { RestaurantMetric } from "@/db/restaurant-metrics";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      date: searchParams.get("date") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      period: searchParams.get("period") || undefined,
      shift: searchParams.get("shift") || undefined,
      metricKey: searchParams.get("metricKey") || undefined,
      managerId: searchParams.get("managerId") ? parseInt(searchParams.get("managerId")!) : undefined,
    };

    const metrics = await getMetrics(filters);

    return NextResponse.json({
      success: true,
      count: metrics.length,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { date, period, metricKey, metricLabel, value } = body;

    if (!date || !period || !metricKey || !metricLabel || value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: date, period, metricKey, metricLabel, value",
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const metric: RestaurantMetric = {
      date,
      period,
      shift: body.shift || null,
      daypart: body.daypart || null,
      managerId: body.managerId || null,
      area: body.area || null,
      metricKey,
      metricLabel,
      value,
      target: body.target || null,
      variance: body.variance || null,
      unit: body.unit || null,
      status: body.status || null,
    };

    const inserted = await insertMetric(metric);

    return NextResponse.json(
      {
        success: true,
        data: inserted,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating metric:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create metric" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await updateMetric(parseInt(id), body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating metric:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update metric" },
      { status: 500 }
    );
  }
}
