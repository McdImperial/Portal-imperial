import { getDb } from "./index";
import { staff, schedules, trainingCourses, trainingProgress } from "./schema";
import { eq, and } from "drizzle-orm";

export type Staff = typeof staff.$inferInsert;
export type StaffSelect = typeof staff.$inferSelect;
export type Schedule = typeof schedules.$inferInsert;
export type ScheduleSelect = typeof schedules.$inferSelect;
export type TrainingCourse = typeof trainingCourses.$inferInsert;
export type TrainingCourseSelect = typeof trainingCourses.$inferSelect;
export type TrainingProgress = typeof trainingProgress.$inferInsert;
export type TrainingProgressSelect = typeof trainingProgress.$inferSelect;

// Staff
export async function getStaff(filters?: {
  role?: string;
  department?: string;
  status?: string;
}): Promise<StaffSelect[]> {
  const db = getDb();
  let query = db.select().from(staff);

  const conditions = [];
  if (filters?.role) conditions.push(eq(staff.role, filters.role));
  if (filters?.department) conditions.push(eq(staff.department, filters.department));
  if (filters?.status) conditions.push(eq(staff.status, filters.status));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(staff.name);
}

export async function insertStaff(member: Staff): Promise<StaffSelect> {
  const db = getDb();
  const [inserted] = await db.insert(staff).values(member).returning();
  return inserted;
}

export async function updateStaff(id: number, updates: Partial<Staff>): Promise<StaffSelect> {
  const db = getDb();
  const [updated] = await db
    .update(staff)
    .set(updates)
    .where(eq(staff.id, id))
    .returning();
  return updated;
}

// Schedules
export async function getSchedules(filters?: {
  date?: string;
  staffId?: number;
  shift?: string;
}): Promise<ScheduleSelect[]> {
  const db = getDb();
  let query = db.select().from(schedules);

  const conditions = [];
  if (filters?.date) conditions.push(eq(schedules.date, filters.date));
  if (filters?.staffId) conditions.push(eq(schedules.staffId, filters.staffId));
  if (filters?.shift) conditions.push(eq(schedules.shift, filters.shift));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(schedules.date);
}

export async function insertSchedule(schedule: Schedule): Promise<ScheduleSelect> {
  const db = getDb();
  const [inserted] = await db.insert(schedules).values(schedule).returning();
  return inserted;
}

export async function updateSchedule(
  id: number,
  updates: Partial<Schedule>
): Promise<ScheduleSelect> {
  const db = getDb();
  const [updated] = await db
    .update(schedules)
    .set(updates)
    .where(eq(schedules.id, id))
    .returning();
  return updated;
}

// Training Courses
export async function getCourses(filters?: { category?: string }): Promise<TrainingCourseSelect[]> {
  const db = getDb();
  let query = db.select().from(trainingCourses);

  if (filters?.category) {
    query = query.where(eq(trainingCourses.category, filters.category));
  }

  return query.orderBy(trainingCourses.name);
}

export async function insertCourse(course: TrainingCourse): Promise<TrainingCourseSelect> {
  const db = getDb();
  const [inserted] = await db.insert(trainingCourses).values(course).returning();
  return inserted;
}

// Training Progress
export async function getProgress(filters?: {
  staffId?: number;
  status?: string;
}): Promise<TrainingProgressSelect[]> {
  const db = getDb();
  let query = db.select().from(trainingProgress);

  const conditions = [];
  if (filters?.staffId) conditions.push(eq(trainingProgress.staffId, filters.staffId));
  if (filters?.status) conditions.push(eq(trainingProgress.status, filters.status));

  if (conditions.length > 0) query = query.where(and(...conditions));
  return query;
}

export async function insertProgress(
  progress: TrainingProgress
): Promise<TrainingProgressSelect> {
  const db = getDb();
  const [inserted] = await db.insert(trainingProgress).values(progress).returning();
  return inserted;
}

export async function updateProgress(
  id: number,
  updates: Partial<TrainingProgress>
): Promise<TrainingProgressSelect> {
  const db = getDb();
  const [updated] = await db
    .update(trainingProgress)
    .set(updates)
    .where(eq(trainingProgress.id, id))
    .returning();
  return updated;
}
