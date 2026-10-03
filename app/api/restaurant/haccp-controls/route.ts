import { NextRequest, NextResponse } from "next/server";
import { getControls, insertControl, updateControl } from "@/db/haccp-controls";
import type { HaccpControl } from "@/db/haccp-controls";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      date: searchParams.get("date") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      checkpoint: searchParams.get("checkpoint") || undefined,
      status: searchParams.get("status") || undefined,
    };

    const controls = await getControls(filters);

    return NextResponse.json({
      success: true,
      count: controls.length,
      data: controls,
    });
  } catch (error) {
    console.error("Error fetching HACCP controls:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch HACCP controls" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { date, checkpoint, parameter } = body;

    if (!date || !checkpoint || !parameter) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: date, checkpoint, parameter",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const control: HaccpControl = {
      date,
      time: body.time || null,
      checkpoint,
      parameter,
      value: body.value || null,
      unit: body.unit || null,
      critical_limit: body.criticalLimit || null,
      corrective_action: body.correctiveAction || null,
      status: body.status || null,
      recorded_by: body.recordedBy || null,
    };

    const inserted = await insertControl(control);

    return NextResponse.json(
      {
        success: true,
        data: inserted,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating HACCP control:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create HACCP control" },
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
    const updated = await updateControl(parseInt(id), body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating HACCP control:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update HACCP control" },
      { status: 500 }
    );
  }
}
