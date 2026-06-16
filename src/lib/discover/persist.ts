/**
 * Persistence for discovered events.
 *
 * Auto-approves each event: sanitizes media, inserts into the `events` table,
 * then records an `approved` row in `event_submissions` for audit trail.
 * Failures are isolated per-event so one bad row doesn't block the rest.
 * Shared by the historical and recent-news discovery crons.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeEventMedia } from "@/lib/event-sanitize";
import type { Event } from "@/lib/types";

export interface InsertedEvent {
  id: string;
  title: string;
  date: string;
  warnings?: string[];
}

export interface FailedEvent {
  id: string;
  reason: string;
}

export interface PersistResult {
  inserted: InsertedEvent[];
  failed: FailedEvent[];
}

export interface PersistOptions {
  /** Value written to event_submissions.submitted_by_email (identifies the cron). */
  submitter: string;
  /** Value written to event_submissions.reviewed_by (the auto-approval reviewer). */
  reviewer: string;
}

/**
 * Sanitize, insert, and audit a batch of discovered events.
 */
export async function insertApprovedEvents(
  supabase: SupabaseClient,
  events: Event[],
  options: PersistOptions
): Promise<PersistResult> {
  const reviewedAt = new Date().toISOString();
  const inserted: InsertedEvent[] = [];
  const failed: FailedEvent[] = [];

  for (const event of events) {
    // sanitizeEventMedia only touches image/media; id/title/date/summary
    // come from the validated `event` object.
    const { event: sanitized, warnings } = sanitizeEventMedia(event);

    const insertData = {
      id: event.id,
      date: event.date,
      title: event.title,
      summary: event.summary,
      category: event.category || [],
      tags: event.tags || [],
      mode: event.mode || ["timeline"],
      image: sanitized.image || null,
      media: sanitized.media || [],
      links: event.links || [],
      metrics: event.metrics || {},
      crimeline: event.crimeline || null,
    };

    const { error: eventInsertError } = await supabase
      .from("events")
      .insert([insertData]);

    if (eventInsertError) {
      console.error(`Failed to insert event "${event.id}":`, eventInsertError);
      failed.push({ id: event.id, reason: eventInsertError.message });
      continue;
    }

    const { error: submissionInsertError } = await supabase
      .from("event_submissions")
      .insert({
        status: "approved" as const,
        submitted_by_email: options.submitter,
        event_data: { ...event, ...sanitized },
        reviewed_by: options.reviewer,
        reviewed_at: reviewedAt,
        created_event_id: event.id,
      });

    if (submissionInsertError) {
      // Audit-record failure shouldn't fail the run — the event is live.
      console.error(
        `Event "${event.id}" inserted but submission audit row failed:`,
        submissionInsertError
      );
    }

    inserted.push({
      id: event.id,
      title: event.title,
      date: event.date,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  }

  return { inserted, failed };
}
