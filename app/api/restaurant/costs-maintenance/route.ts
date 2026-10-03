import { NextRequest, NextResponse } from "next/server";
import {
  getCosts,
  insertCost,
  updateCost,
  getMaintenance,
  insertMaintenance,
  updateMaintenance,
} from "@/db/costs-and-maintenance";
import type { Cost, Maintenance } from "@/db/costs-and-maintenance";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "costs"; // costs | maintenance

    if (type === "maintenance") {
      const records = await getMaintenance({
        date: searchParams.get("date") || undefined,
        status: searchParams.get("status") || undefined,
        equipmentId: searchParams.get("equipmentId") || undefined,
        area: searchParams.get("area") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "maintenance",
        count: records.length,
        data: records,
      });
    } else {
      const records = await getCosts({
        month: searchParams.get("month") || undefined,
        startMonth: searchParams.get("startMonth") || undefined,
        endMonth: searchParams.get("endMonth") || undefined,
        category: searchParams.get("category") || undefined,
        status: searchParams.get("status") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "costs",
        count: records.length,
        data: records,
      });
    }
  } catch (error) {
    console.error("Error fetching costs/maintenance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch costs/maintenance data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "maintenance") {
      const { date, equipmentName, type: maintenanceType, description, status } = body;

      if (!date || !equipmentName || !maintenanceType || !description || !status) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields: date, equipmentName, type, description, status",
          },
          { status: 400 }
        );
      }

      const record: Maintenance = {
        date,
        equipmentName,
        equipmentId: body.equipmentId || null,
        area: body.area || null,
        type: maintenanceType,
        description,
        technician: body.technician || null,
        status,
        cost: body.cost || null,
        nextScheduled: body.nextScheduled || null,
        notes: body.notes || null,
      };

      const inserted = await insertMaintenance(record);
      return NextResponse.json(
        {
          success: true,
          data: inserted,
        },
        { status: 201 }
      );
    } else {
      const { date, month, category, amount } = body;

      if (!date || !month || !category || amount === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields: date, month, category, amount",
          },
          { status: 400 }
        );
      }

      const record: Cost = {
        date,
        month,
        category,
        description: body.description || null,
        amount,
        budget: body.budget || null,
        variance: body.variance || null,
        status: body.status || "actual",
        notes: body.notes || null,
      };

      const inserted = await insertCost(record);
      return NextResponse.json(
        {
          success: true,
          data: inserted,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating cost/maintenance record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create cost/maintenance record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "costs";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const numId = parseInt(id);

    if (type === "maintenance") {
      const updated = await updateMaintenance(numId, body);
      return NextResponse.json({ success: true, data: updated });
    } else {
      const updated = await updateCost(numId, body);
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    console.error("Error updating cost/maintenance record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cost/maintenance record" },
      { status: 500 }
    );
  }
}
