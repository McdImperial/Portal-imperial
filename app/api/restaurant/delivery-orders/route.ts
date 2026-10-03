import { NextRequest, NextResponse } from "next/server";
import { getOrders, insertOrder, updateOrder } from "@/db/delivery-orders";
import type { DeliveryOrder } from "@/db/delivery-orders";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      date: searchParams.get("date") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      platform: searchParams.get("platform") || undefined,
      status: searchParams.get("status") || undefined,
    };

    const orders = await getOrders(filters);

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch delivery orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { date, orderId, platform, status } = body;

    if (!date || !orderId || !platform || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: date, orderId, platform, status",
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

    const order: DeliveryOrder = {
      date,
      orderId,
      platform,
      status,
      prepTime: body.prepTime || null,
      deliveryTime: body.deliveryTime || null,
      totalTime: body.totalTime || null,
      amount: body.amount || null,
      distance: body.distance || null,
      csat: body.csat || null,
      issues: body.issues || null,
    };

    const inserted = await insertOrder(order);

    return NextResponse.json(
      {
        success: true,
        data: inserted,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating delivery order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create delivery order" },
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
    const updated = await updateOrder(parseInt(id), body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating delivery order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update delivery order" },
      { status: 500 }
    );
  }
}
