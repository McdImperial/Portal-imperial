import { NextRequest, NextResponse } from "next/server";
import {
  getAudits,
  insertAudit,
  updateAudit,
  getOpportunities,
  insertOpportunity,
  updateOpportunity,
  getPacActions,
  insertPacAction,
  updatePacAction,
} from "@/db/audits";
import type { Audit, AuditOpportunity, PacAction } from "@/db/audits";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "audits"; // audits | opportunities | pac

    if (type === "opportunities") {
      const opportunities = await getOpportunities({
        date: searchParams.get("date") || undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        severity: searchParams.get("severity") || undefined,
        status: searchParams.get("status") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "audit_opportunities",
        count: opportunities.length,
        data: opportunities,
      });
    } else if (type === "pac") {
      const actions = await getPacActions({
        date: searchParams.get("date") || undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        status: searchParams.get("status") || undefined,
        priority: searchParams.get("priority") ? parseInt(searchParams.get("priority")!) : undefined,
      });

      return NextResponse.json({
        success: true,
        type: "pac_actions",
        count: actions.length,
        data: actions,
      });
    } else {
      const audits = await getAudits({
        date: searchParams.get("date") || undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        category: searchParams.get("category") || undefined,
        status: searchParams.get("status") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "audits",
        count: audits.length,
        data: audits,
      });
    }
  } catch (error) {
    console.error("Error fetching audits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "audit") {
      const { date, auditType, category, score } = body;

      if (!date || !auditType || !category) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for audit" },
          { status: 400 }
        );
      }

      const audit: Audit = {
        date,
        auditType,
        category,
        score: score || null,
        maxScore: body.maxScore || 100,
        percentage: score ? (score / (body.maxScore || 100)) * 100 : null,
        status: body.status || null,
        auditedBy: body.auditedBy || null,
        notes: body.notes || null,
      };

      const inserted = await insertAudit(audit);
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } else if (type === "opportunity") {
      const { date, description, severity } = body;

      if (!date || !description || !severity) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for opportunity" },
          { status: 400 }
        );
      }

      const opportunity: AuditOpportunity = {
        auditId: body.auditId || null,
        date,
        description,
        severity,
        category: body.category || null,
        priority: body.priority || null,
        status: body.status || "open",
        assignedTo: body.assignedTo || null,
        dueDate: body.dueDate || null,
        resolution: null,
        closedAt: null,
      };

      const inserted = await insertOpportunity(opportunity);
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } else if (type === "pac") {
      const { date, description } = body;

      if (!date || !description) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for PAC action" },
          { status: 400 }
        );
      }

      const action: PacAction = {
        date,
        description,
        source: body.source || null,
        source_id: body.sourceId || null,
        priority: body.priority || null,
        deadline: body.deadline || null,
        assigned_to: body.assignedTo || null,
        status: body.status || "open",
        progress: body.progress || 0,
        notes: body.notes || null,
        completed_at: null,
      };

      const inserted = await insertPacAction(action);
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid type. Use 'audit', 'opportunity', or 'pac'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating audit record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create audit record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "audit";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const numId = parseInt(id);

    if (type === "opportunity") {
      const updated = await updateOpportunity(numId, body);
      return NextResponse.json({ success: true, data: updated });
    } else if (type === "pac") {
      const updated = await updatePacAction(numId, body);
      return NextResponse.json({ success: true, data: updated });
    } else {
      const updated = await updateAudit(numId, body);
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    console.error("Error updating audit record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update audit record" },
      { status: 500 }
    );
  }
}
