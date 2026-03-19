"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Event, EventSubmission } from "@/lib/types";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

export default function SubmissionsPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [submissions, setSubmissions] = useState<EventSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const fetchSubmissions = useCallback(async () => {
    if (!adminSecret.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await fetch(`/api/admin/submissions${params}`, {
        headers: { "x-admin-secret": adminSecret },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || "Failed to fetch submissions");
        return;
      }

      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [adminSecret, statusFilter]);

  useEffect(() => {
    if (adminSecret.trim()) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, adminSecret]);

  const handleAction = async (
    submissionId: string,
    action: "approve" | "reject"
  ) => {
    setActionLoading(submissionId);
    setError(null);
    setSuccess(null);

    try {
      // If there's edited JSON, use that as the override
      let eventDataOverride: Event | undefined;
      if (editingJson[submissionId]) {
        try {
          eventDataOverride = JSON.parse(editingJson[submissionId]);
        } catch {
          setError("Invalid JSON in editor. Fix it before approving.");
          setActionLoading(null);
          return;
        }
      }

      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          submission_id: submissionId,
          action,
          review_notes: reviewNotes[submissionId] || undefined,
          event_data_override: action === "approve" ? eventDataOverride : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const debugInfo = data.debug ? `\n\nDebug: ${JSON.stringify(data.debug, null, 2)}` : "";
        const details = data.details ? `\nDetails: ${data.details}` : "";
        const code = data.code ? ` (code: ${data.code})` : "";
        setError(`${data.error || `Failed to ${action} submission`}${code}${details}${debugInfo}`);
        return;
      }

      setSuccess(data.message);

      // Refresh the list to show updated status
      fetchSubmissions();
      setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Initialize the JSON editor with the submission's event data
      const submission = submissions.find((s) => s.id === id);
      if (submission && !editingJson[id]) {
        setEditingJson((prev) => ({
          ...prev,
          [id]: JSON.stringify(submission.event_data, null, 2),
        }));
      }
    }
  };

  const eventData = (sub: EventSubmission): Partial<Event> => sub.event_data;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 pt-10 pb-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Admin / Dev
          </p>
          <h1 className="text-3xl font-semibold">Event Submissions</h1>
          <p className="text-white/70">
            Review, approve, or reject AI-discovered and community-submitted
            events.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200"
              href="/"
            >
              &larr; Back to timeline
            </Link>
            <Link
              className="inline-flex items-center text-sm text-white/60 hover:text-white"
              href="/admin/events"
            >
              Event Editor
            </Link>
            <Link
              className="inline-flex items-center text-sm text-white/60 hover:text-white"
              href="/admin/posts"
            >
              Bot Posts
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Admin Secret */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <label className="space-y-2 text-sm block">
              <span className="text-white/80">Admin Secret</span>
              <input
                type="password"
                className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white font-mono"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter your ADMIN_SECRET"
              />
            </label>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    statusFilter === status
                      ? status === "pending"
                        ? "border-amber-400 text-amber-200 bg-amber-500/10"
                        : status === "approved"
                          ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                          : status === "rejected"
                            ? "border-red-400 text-red-200 bg-red-500/10"
                            : "border-blue-400 text-blue-200 bg-blue-500/10"
                      : "border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}

            <button
              type="button"
              onClick={fetchSubmissions}
              disabled={loading || !adminSecret.trim()}
              className="ml-auto rounded-md border border-white/10 px-4 py-1.5 text-xs text-white/70 hover:text-white hover:border-white/20 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {success}
            </p>
          )}

          {/* Submissions List */}
          {!adminSecret.trim() ? (
            <p className="text-sm text-white/40 text-center py-8">
              Enter your admin secret to view submissions.
            </p>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <svg
                className="animate-spin h-6 w-6 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">
              No {statusFilter !== "all" ? statusFilter : ""} submissions found.
            </p>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const ev = eventData(sub);
                const isExpanded = expandedId === sub.id;
                const isActioning = actionLoading === sub.id;
                const twitterCount =
                  (ev.media || []).filter((m) => m.type === "twitter").length;

                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                  >
                    {/* Card Header */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(sub.id)}
                      className="w-full px-6 py-4 text-left hover:bg-white/[0.02] transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* Image thumbnail */}
                        {ev.image && (
                          <img
                            src={ev.image}
                            alt=""
                            className="w-16 h-16 rounded-lg border border-white/10 object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                sub.status === "pending"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : sub.status === "approved"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-xs text-white/40 font-mono">
                              {ev.date}
                            </span>
                            {sub.submitted_by_email === "cron:discover-events" && (
                              <span className="inline-block rounded-full bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                Auto-discovered
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-semibold truncate">
                            {ev.title || "Untitled"}
                          </h3>

                          <p className="text-xs text-white/50 mt-1 line-clamp-2">
                            {ev.summary}
                          </p>

                          {/* Tags row */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(ev.category || []).map((cat) => (
                              <span
                                key={cat}
                                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300"
                              >
                                {cat}
                              </span>
                            ))}
                            {(ev.tags || []).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {(ev.mode || []).map((m) => (
                              <span
                                key={m}
                                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                                  m === "crimeline"
                                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                                    : "border-purple-500/30 bg-purple-500/10 text-purple-300"
                                }`}
                              >
                                {m}
                              </span>
                            ))}
                            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
                              {twitterCount} tweet{twitterCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {/* Expand indicator */}
                        <span className="text-white/30 text-lg shrink-0">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-white/10 px-6 py-5 space-y-5">
                        {/* Full Preview */}
                        <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-3">
                          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                            Event Preview
                          </h4>

                          {/* Image */}
                          {ev.image && (
                            <img
                              src={ev.image}
                              alt="Event"
                              className="max-h-48 rounded-md border border-white/10 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}

                          <div className="grid gap-2 text-sm">
                            <div className="flex gap-2">
                              <span className="text-white/50 w-24 shrink-0">
                                ID:
                              </span>
                              <span className="font-mono text-blue-300">
                                {ev.id}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/50 w-24 shrink-0">
                                Date:
                              </span>
                              <span>{ev.date}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/50 w-24 shrink-0">
                                Title:
                              </span>
                              <span className="font-medium">{ev.title}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/50 w-24 shrink-0">
                                Categories:
                              </span>
                              <span>{(ev.category || []).join(", ")}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/50 w-24 shrink-0">
                                Tags:
                              </span>
                              <span>{(ev.tags || []).join(", ")}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/50 w-24 shrink-0">
                                Mode:
                              </span>
                              <span>{(ev.mode || []).join(", ")}</span>
                            </div>
                            {ev.crimeline && (
                              <div className="flex gap-2">
                                <span className="text-white/50 w-24 shrink-0">
                                  Crimeline:
                                </span>
                                <span className="text-red-300">
                                  {ev.crimeline.type}
                                  {ev.crimeline.funds_lost_usd &&
                                    ` — $${ev.crimeline.funds_lost_usd.toLocaleString()} lost`}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Summary */}
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-sm text-white/70 whitespace-pre-line">
                              {ev.summary}
                            </p>
                          </div>

                          {/* Links */}
                          {ev.links && ev.links.length > 0 && (
                            <div className="pt-2 border-t border-white/10">
                              <p className="text-xs text-white/50 mb-1">
                                Links:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {ev.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                  >
                                    {link.label || link.url}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Twitter Media */}
                          {ev.media && ev.media.filter((m) => m.type === "twitter").length > 0 && (
                            <div className="pt-2 border-t border-white/10">
                              <p className="text-xs text-white/50 mb-1">
                                Twitter Embeds:
                              </p>
                              <div className="space-y-1">
                                {ev.media
                                  .filter((m) => m.type === "twitter")
                                  .map((m, i) => {
                                    const twitter = m.type === "twitter" ? m.twitter : null;
                                    return twitter ? (
                                      <div key={i} className="text-xs">
                                        <a
                                          href={twitter.tweet_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-400 hover:text-blue-300 underline"
                                        >
                                          @{twitter.account_handle}
                                        </a>
                                        <span className="text-white/30 ml-2 font-mono">
                                          {twitter.tweet_url}
                                        </span>
                                      </div>
                                    ) : null;
                                  })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* JSON Editor */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                            Event JSON (editable before approving)
                          </h4>
                          <textarea
                            className="w-full h-64 rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-xs text-white font-mono resize-y"
                            value={editingJson[sub.id] || ""}
                            onChange={(e) =>
                              setEditingJson((prev) => ({
                                ...prev,
                                [sub.id]: e.target.value,
                              }))
                            }
                            spellCheck={false}
                          />
                        </div>

                        {/* Review Notes */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                            Review Notes (optional)
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                            value={reviewNotes[sub.id] || ""}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({
                                ...prev,
                                [sub.id]: e.target.value,
                              }))
                            }
                            placeholder="Optional notes about your review decision..."
                          />
                        </div>

                        {/* Submission Metadata */}
                        <div className="text-xs text-white/30 space-y-0.5">
                          <p>
                            Submitted:{" "}
                            {new Date(sub.submitted_at).toLocaleString()}
                          </p>
                          <p>By: {sub.submitted_by_email || "Unknown"}</p>
                          {sub.reviewed_at && (
                            <p>
                              Reviewed:{" "}
                              {new Date(sub.reviewed_at).toLocaleString()} by{" "}
                              {sub.reviewed_by}
                            </p>
                          )}
                          {sub.review_notes && (
                            <p>Notes: {sub.review_notes}</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {(sub.status === "pending" ||
                          sub.status === "needs_review") && (
                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => handleAction(sub.id, "approve")}
                              disabled={isActioning}
                              className="inline-flex items-center rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isActioning ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                "Approve & Create Event"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(sub.id, "reject")}
                              disabled={isActioning}
                              className="rounded-md border border-red-500/40 px-5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {/* Re-create button for approved submissions missing their event */}
                        {sub.status === "approved" && (
                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => handleAction(sub.id, "approve")}
                              disabled={isActioning}
                              className="inline-flex items-center rounded-md bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isActioning ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                "Re-create Event in DB"
                              )}
                            </button>
                            <p className="text-xs text-white/40 self-center">
                              Use this if the event was approved but never inserted into the events table.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
