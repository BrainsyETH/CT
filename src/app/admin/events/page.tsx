"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { EVENT_TAGS, MODE_OPTIONS } from "@/lib/constants";
import { getLocalEvents, removeLocalEvent, saveLocalEvent } from "@/lib/local-events";
import { validateEvent } from "@/lib/validation";
import type { Event } from "@/lib/types";

const DEFAULT_MODE = "timeline";

const formatIssues = (issues: string[]) =>
  issues.length > 1 ? issues.map((issue) => `• ${issue}`).join("\n") : issues[0] ?? null;

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(() => getLocalEvents());
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [categoryInput, setCategoryInput] = useState("Other");
  const [tags, setTags] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([DEFAULT_MODE]);
  const [imageUrl, setImageUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      categoryInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [categoryInput],
  );

  const handleToggle = (value: string, current: string[], setter: (next: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const payload: Event = {
      id: customId.trim() || crypto.randomUUID(),
      date: date.trim(),
      title: title.trim(),
      summary: summary.trim(),
      category: categories.length > 0 ? categories : ["Other"],
      tags,
      mode: modes.length > 0 ? modes : [DEFAULT_MODE],
      image: imageUrl.trim() || undefined,
    };

    const { event: validated, errors } = validateEvent(payload);

    if (!validated || errors) {
      const issueMessages = errors?.issues.map((issue) => issue.message) ?? ["Invalid event details."];
      setError(formatIssues(issueMessages));
      return;
    }

    const updated = saveLocalEvent(validated);
    setEvents(updated);
    setNotice("Event saved locally. Refresh the main timeline to see it.");

    setTitle("");
    setDate("");
    setSummary("");
    setCategoryInput("Other");
    setTags([]);
    setModes([DEFAULT_MODE]);
    setImageUrl("");
    setCustomId("");
  };

  const handleRemove = (eventId: string) => {
    const updated = removeLocalEvent(eventId);
    setEvents(updated);
  };

  const handleCopy = async () => {
    setNotice(null);
    try {
      await navigator.clipboard.writeText(JSON.stringify(events, null, 2));
      setNotice("Copied local events JSON to clipboard.");
    } catch {
      setError("Unable to copy to clipboard in this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 pt-10 pb-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Admin / Dev</p>
          <h1 className="text-3xl font-semibold">Local Event Builder</h1>
          <p className="text-white/70">
            Add events without editing <code className="text-white">events.json</code>. Events
            are stored in your browser and will appear in the timeline on refresh.
          </p>
          <Link
            className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200"
            href="/"
          >
            ← Back to timeline
          </Link>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <form
            className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-white/80">Title</span>
                <input
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  value={title}
                  onChange={(eventInput) => setTitle(eventInput.target.value)}
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-white/80">Date (YYYY-MM-DD)</span>
                <input
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  value={date}
                  onChange={(eventInput) => setDate(eventInput.target.value)}
                  placeholder="2024-01-15"
                  required
                />
              </label>
            </div>

            <label className="space-y-2 text-sm block">
              <span className="text-white/80">Summary</span>
              <textarea
                className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                rows={5}
                value={summary}
                onChange={(eventInput) => setSummary(eventInput.target.value)}
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-white/80">Categories (comma-separated)</span>
                <input
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  value={categoryInput}
                  onChange={(eventInput) => setCategoryInput(eventInput.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-white/80">Image URL (optional)</span>
                <input
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  value={imageUrl}
                  onChange={(eventInput) => setImageUrl(eventInput.target.value)}
                  placeholder="https://"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm block">
              <span className="text-white/80">Custom ID (optional)</span>
              <input
                className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                value={customId}
                onChange={(eventInput) => setCustomId(eventInput.target.value)}
                placeholder="leave blank to auto-generate"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <span className="text-white/80">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TAGS.map((tag) => (
                    <label
                      key={tag}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                        tags.includes(tag)
                          ? "border-blue-400 text-blue-200"
                          : "border-white/10 text-white/70"
                      }`}
                    >
                      <input
                        className="accent-blue-400"
                        type="checkbox"
                        checked={tags.includes(tag)}
                        onChange={() => handleToggle(tag, tags, setTags)}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <span className="text-white/80">Modes</span>
                <div className="flex flex-wrap gap-2">
                  {MODE_OPTIONS.map((mode) => (
                    <label
                      key={mode}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                        modes.includes(mode)
                          ? "border-blue-400 text-blue-200"
                          : "border-white/10 text-white/70"
                      }`}
                    >
                      <input
                        className="accent-blue-400"
                        type="checkbox"
                        checked={modes.includes(mode)}
                        onChange={() => handleToggle(mode, modes, setModes)}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error ? (
              <p className="whitespace-pre-line rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                {notice}
              </p>
            ) : null}

            <button
              className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
              type="submit"
            >
              Save event locally
            </button>
          </form>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Saved local events</h2>
              <button
                className="rounded-md border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:text-white"
                type="button"
                onClick={handleCopy}
                disabled={events.length === 0}
              >
                Copy JSON
              </button>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-white/60">No local events saved yet.</p>
            ) : (
              <ul className="space-y-3">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-white/70">{event.date}</p>
                        <p className="text-base font-medium">{event.title}</p>
                      </div>
                      <button
                        className="text-xs text-red-300 hover:text-red-200"
                        type="button"
                        onClick={() => handleRemove(event.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-white/60">{event.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
