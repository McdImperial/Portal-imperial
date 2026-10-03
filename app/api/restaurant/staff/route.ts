import { NextRequest, NextResponse } from "next/server";
import {
  getStaff,
  insertStaff,
  updateStaff,
  getSchedules,
  insertSchedule,
  updateSchedule,
  getCourses,
  insertCourse,
  getProgress,
  insertProgress,
  updateProgress,
} from "@/db/staff";
import type {
  Staff,
  Schedule,
  TrainingCourse,
  TrainingProgress,
} from "@/db/staff";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "staff"; // staff | schedules | courses | progress

    if (type === "schedules") {
      const schedules = await getSchedules({
        date: searchParams.get("date") || undefined,
        staffId: searchParams.get("staffId") ? parseInt(searchParams.get("staffId")!) : undefined,
        shift: searchParams.get("shift") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "schedules",
        count: schedules.length,
        data: schedules,
      });
    } else if (type === "courses") {
      const courses = await getCourses({
        category: searchParams.get("category") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "training_courses",
        count: courses.length,
        data: courses,
      });
    } else if (type === "progress") {
      const progress = await getProgress({
        staffId: searchParams.get("staffId") ? parseInt(searchParams.get("staffId")!) : undefined,
        status: searchParams.get("status") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "training_progress",
        count: progress.length,
        data: progress,
      });
    } else {
      const staff = await getStaff({
        role: searchParams.get("role") || undefined,
        department: searchParams.get("department") || undefined,
        status: searchParams.get("status") || undefined,
      });

      return NextResponse.json({
        success: true,
        type: "staff",
        count: staff.length,
        data: staff,
      });
    }
  } catch (error) {
    console.error("Error fetching staff data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "staff") {
      const { name, role } = body;

      if (!name || !role) {
        return NextResponse.json(
          { success: false, error: "Missing required fields: name, role" },
          { status: 400 }
        );
      }

      const member: Staff = {
        name,
        email: body.email || null,
        phone: body.phone || null,
        role,
        department: body.department || null,
        status: body.status || "active",
        hireDate: body.hireDate || null,
        manager: body.manager || null,
        certifications: body.certifications || null,
        notes: body.notes || null,
      };

      const inserted = await insertStaff(member);
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } else if (type === "schedule") {
      const { staffId, date } = body;

      if (!staffId || !date) {
        return NextResponse.json(
          { success: false, error: "Missing required fields: staffId, date" },
          { status: 400 }
        );
      }

      const schedule: Schedule = {
        staffId,
        date,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        shift: body.shift || null,
        daypart: body.daypart || null,
        area: body.area || null,
        notes: body.notes || null,
      };

      const inserted = await insertSchedule(schedule);
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } else if (type === "course") {
      const { name } = body;

      if (!name) {
        return NextResponse.json(
          { success: false, error: "Missing required field: name" },
          { status: 400 }
        );
      }

      const course: TrainingCourse = {
        name,
        description: body.description || null,
        category: body.category || null,
        duration: body.duration || null,
        mandatory: body.mandatory ? 1 : 0,
        expiryMonths: body.expiryMonths || null,
      };

      const inserted = await insertCourse(course);
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } else if (type === "progress") {
      const { staffId, courseId } = body;

      if (!staffId || !courseId) {
        return NextResponse.json(
          { success: false, error: "Missing required fields: staffId, courseId" },
          { status: 400 }
        );
      }

      const progress: TrainingProgress = {
        staffId,
        courseId,
        startDate: body.startDate || null,
        completionDate: body.completionDate || null,
        status: body.status || "in_progress",
        score: body.score || null,
        certificationExpiry: body.certificationExpiry || null,
        notes: body.notes || null,
      };

      const inserted = await insertProgress(progress);
      return NextResponse.json({ success: true, data: inserted }, { status: 201 });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid type. Use 'staff', 'schedule', 'course', or 'progress'",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating staff record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create staff record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "staff";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const numId = parseInt(id);

    if (type === "schedule") {
      const updated = await updateSchedule(numId, body);
      return NextResponse.json({ success: true, data: updated });
    } else if (type === "progress") {
      const updated = await updateProgress(numId, body);
      return NextResponse.json({ success: true, data: updated });
    } else {
      const updated = await updateStaff(numId, body);
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    console.error("Error updating staff record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update staff record" },
      { status: 500 }
    );
  }
}
