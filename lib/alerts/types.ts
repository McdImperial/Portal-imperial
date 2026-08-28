export type AlertType = "scheduled" | "conditional" | "anticipation";
export type AlertStatus = "draft" | "active" | "paused";
export type AlertChannel = "whatsapp" | "n8n" | "both";

export type TemplateVariables = Record<string, string | number | null | undefined>;

export type AlertPayload = {
  name: string; description?: string; type: AlertType; status?: AlertStatus; channel?: AlertChannel;
  templateId?: number | null; message: string; recipientIds?: number[]; groupIds?: number[];
  schedule?: { frequency?: string; scheduledAt?: string | null; timeOfDay?: string | null; weekDays?: number[]; monthDay?: number | null; anticipationMinutes?: number };
  condition?: { source?: string; field?: string; operator?: string; expectedValue?: string; payloadPath?: string };
};
