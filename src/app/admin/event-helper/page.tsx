"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CATEGORIES, EVENT_TAGS, MODE_OPTIONS, CRIMELINE_TYPES, OUTCOME_STATUSES } from "@/lib/constants";
import type { Event, Mode } from "@/lib/types";

export default function EventHelperPage() {
  const [url, setUrl] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [mode, setMode] = useState<Mode | "">("");
  const [categories, setCategories] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [context, setContext] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Event | null>(null);
  const [rawJson, setRawJson] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCategoryToggle = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setRawJson("");
    setCopied(false);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!adminSecret.trim()) {
      setError("Please enter the admin secret");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/extract-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          url: url.trim(),
          hints: {
            mode: mode || undefined,
            categories: categories.length > 0 ? categories : undefined,
            date: date || undefined,
            context: context || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to extract event");
        if (data.raw) {
          setRawJson(data.raw);
        }
        return;
      }

      setResult(data.event);
      setRawJson(JSON.stringify(data.event, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const handleJsonEdit = (value: string) => {
    setRawJson(value);
    try {
      const parsed = JSON.parse(value);
      setResult(parsed);
      setError(null);
    } catch {
      // Don't update result if JSON is invalid
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 pt-10 pb-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Admin / Dev</p>
          <h1 className="text-3xl font-semibold">Event Schema Helper</h1>
          <p className="text-white/70">
            Paste a URL and get AI-extracted event data ready for Supabase.
          </p>
          <Link
            className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200"
            href="/"
          >
            &larr; Back to timeline
          </Link>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Form */}
          <form
            className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
            onSubmit={handleSubmit}
          >
            {/* Admin Secret */}
            <label className="space-y-2 text-sm block">
              <span className="text-white/80">Admin Secret</span>
              <input
                type="password"
                className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white font-mono"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter your ADMIN_SECRET"
                required
              />
            </label>

            {/* URL Input */}
            <label className="space-y-2 text-sm block">
              <span className="text-white/80">Source URL *</span>
              <input
                type="url"
                className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article-about-crypto-event"
                required
              />
              <p className="text-xs text-white/50">
                Note: Twitter/X links may not scrape well. Provide additional context below if needed.
              </p>
            </label>

            {/* Hints Section */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-white/80">Hints (Optional)</p>
                <p className="mt-1 text-xs text-white/50">
                  Help the AI by providing additional context about the event.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Mode Selection */}
                <label className="space-y-2 text-sm">
                  <span className="text-white/80">Mode</span>
                  <select
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as Mode | "")}
                  >
                    <option value="">Auto-detect</option>
                    {MODE_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Date Override */}
                <label className="space-y-2 text-sm">
                  <span className="text-white/80">Date (if known)</span>
                  <input
                    type="date"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
              </div>

              {/* Categories */}
              <div className="space-y-2 text-sm">
                <span className="text-white/80">Categories</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition cursor-pointer ${
                        categories.includes(category)
                          ? "border-blue-400 text-blue-200 bg-blue-500/10"
                          : "border-white/10 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Context */}
              <label className="space-y-2 text-sm block">
                <span className="text-white/80">Additional Context</span>
                <textarea
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any additional details about the event (e.g., 'This was the first Bitcoin transaction', '$450M was stolen')"
                />
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <p className="whitespace-pre-line rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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
                  Extracting...
                </>
              ) : (
                "Extract Event Data"
              )}
            </button>
          </form>

          {/* Results Section */}
          {rawJson && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Extracted Event JSON</h2>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`rounded-md border px-4 py-1.5 text-sm transition ${
                    copied
                      ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                      : "border-white/10 text-white/70 hover:text-white hover:border-white/20"
                  }`}
                >
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
              </div>

              {/* JSON Editor */}
              <div className="relative">
                <textarea
                  className="w-full h-[500px] rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-sm text-white font-mono resize-y"
                  value={rawJson}
                  onChange={(e) => handleJsonEdit(e.target.value)}
                  spellCheck={false}
                />
              </div>

              {/* Preview */}
              {result && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white/80">Preview</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-white/50 w-20">ID:</span>
                      <span className="font-mono text-blue-300">{result.id}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/50 w-20">Date:</span>
                      <span>{result.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/50 w-20">Title:</span>
                      <span className="font-medium">{result.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/50 w-20">Mode:</span>
                      <span>{result.mode?.join(", ")}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/50 w-20">Categories:</span>
                      <span>{result.category?.join(", ")}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/50 w-20">Tags:</span>
                      <span>{result.tags?.join(", ")}</span>
                    </div>
                    {result.crimeline && (
                      <div className="flex gap-2">
                        <span className="text-white/50 w-20">Crimeline:</span>
                        <span className="text-red-300">
                          {result.crimeline.type}
                          {result.crimeline.funds_lost_usd &&
                            ` - $${result.crimeline.funds_lost_usd.toLocaleString()} lost`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-white/70">{result.summary}</p>
                  </div>
                </div>
              )}

              {/* Quick Reference */}
              <details className="rounded-lg border border-white/10 bg-white/5">
                <summary className="px-4 py-3 text-sm font-semibold text-white/80 cursor-pointer hover:text-white">
                  Schema Reference
                </summary>
                <div className="px-4 pb-4 space-y-4 text-xs">
                  <div>
                    <p className="text-white/60 mb-1">Valid Tags:</p>
                    <p className="text-white/80">{EVENT_TAGS.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-white/60 mb-1">Valid Categories:</p>
                    <p className="text-white/80">{CATEGORIES.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-white/60 mb-1">Crimeline Types:</p>
                    <p className="text-white/80">{CRIMELINE_TYPES.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-white/60 mb-1">Outcome Statuses:</p>
                    <p className="text-white/80">{OUTCOME_STATUSES.join(", ")}</p>
                  </div>
                </div>
              </details>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
