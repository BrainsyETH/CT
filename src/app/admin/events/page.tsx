"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  EVENT_TAGS,
  MODE_OPTIONS,
  CRIMELINE_TYPES,
  OUTCOME_STATUSES,
  VIDEO_PROVIDERS,
  VIDEO_ORIENTATIONS,
} from "@/lib/constants";
import type {
  Event,
  EventTag,
  Mode,
  MediaItem,
  CrimelineType,
  OutcomeStatus,
  VideoProvider,
  VideoOrientation,
} from "@/lib/types";

const DEFAULT_MODE: Mode = "timeline";

interface LinkItem {
  label: string;
  url: string;
}

interface TwitterItem {
  tweet_url: string;
  account_handle: string;
}

interface ImageItem {
  url: string;
  alt: string;
  caption: string;
}

interface VideoItem {
  provider: VideoProvider;
  url: string;
  embed_url: string;
  poster_url: string;
  caption: string;
  orientation: VideoOrientation;
}

const emptyTwitterItem = (): TwitterItem => ({ tweet_url: "", account_handle: "" });
const emptyLinkItem = (): LinkItem => ({ label: "", url: "" });
const emptyImageItem = (): ImageItem => ({ url: "", alt: "", caption: "" });
const emptyVideoItem = (): VideoItem => ({
  provider: "youtube",
  url: "",
  embed_url: "",
  poster_url: "",
  caption: "",
  orientation: "landscape",
});

export default function AdminEventsPage() {
  // Auth
  const [adminSecret, setAdminSecret] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Basic fields
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<EventTag[]>([]);
  const [modes, setModes] = useState<Mode[]>([DEFAULT_MODE]);
  const [imageUrl, setImageUrl] = useState("");

  // Links
  const [links, setLinks] = useState<LinkItem[]>([]);

  // Media - Twitter
  const [twitterItems, setTwitterItems] = useState<TwitterItem[]>([]);

  // Media - Images
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);

  // Media - Video
  const [videoItem, setVideoItem] = useState<VideoItem | null>(null);

  // Crimeline
  const [isCrimeline, setIsCrimeline] = useState(false);
  const [crimelineType, setCrimelineType] = useState<CrimelineType | "">("");
  const [fundsLostUsd, setFundsLostUsd] = useState("");
  const [victimsEstimated, setVictimsEstimated] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [aftermath, setAftermath] = useState("");
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus | "">("");

  // Metrics
  const [btcPriceUsd, setBtcPriceUsd] = useState("");
  const [marketCapUsd, setMarketCapUsd] = useState("");
  const [tvlUsd, setTvlUsd] = useState("");
  const [volumeUsd, setVolumeUsd] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search events
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/admin/get-event?search=${encodeURIComponent(searchQuery)}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.events || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeout);
  }, [handleSearch]);

  // Load event into editor
  const loadEvent = async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/get-event?id=${encodeURIComponent(eventId)}`);
      const data = await response.json();

      if (!data.success || !data.event) {
        setError(data.error || "Failed to load event");
        return;
      }

      const event: Event = data.event;
      populateForm(event);
      setEditingEventId(event.id);
      setIsEditing(true);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  // Populate form from event
  const populateForm = (event: Event) => {
    setId(event.id);
    setTitle(event.title);
    setDate(event.date);
    setSummary(event.summary);
    setCategories(event.category || []);
    setTags(event.tags || []);
    setModes(event.mode || [DEFAULT_MODE]);
    setImageUrl(event.image || "");

    // Links
    setLinks(event.links || []);

    // Media
    const twitterMedia: TwitterItem[] = [];
    const imageMedia: ImageItem[] = [];
    let video: VideoItem | null = null;

    (event.media || []).forEach((item) => {
      if (item.type === "twitter" && item.twitter) {
        twitterMedia.push({
          tweet_url: item.twitter.tweet_url || "",
          account_handle: item.twitter.account_handle || "",
        });
      } else if (item.type === "image" && item.image) {
        imageMedia.push({
          url: item.image.url,
          alt: item.image.alt || "",
          caption: item.image.caption || "",
        });
      } else if (item.type === "video" && item.video) {
        video = {
          provider: item.video.provider,
          url: item.video.url,
          embed_url: item.video.embed_url || "",
          poster_url: item.video.poster_url || "",
          caption: item.video.caption || "",
          orientation: item.video.orientation || "landscape",
        };
      }
    });

    setTwitterItems(twitterMedia);
    setImageItems(imageMedia);
    setVideoItem(video);

    // Crimeline
    if (event.crimeline) {
      setIsCrimeline(true);
      setCrimelineType(event.crimeline.type || "");
      setFundsLostUsd(event.crimeline.funds_lost_usd?.toString() || "");
      setVictimsEstimated(event.crimeline.victims_estimated || "");
      setRootCause(event.crimeline.root_cause?.join(", ") || "");
      setAftermath(event.crimeline.aftermath || "");
      setOutcomeStatus(event.crimeline.status || "");
    } else {
      setIsCrimeline(false);
      setCrimelineType("");
      setFundsLostUsd("");
      setVictimsEstimated("");
      setRootCause("");
      setAftermath("");
      setOutcomeStatus("");
    }

    // Metrics
    setBtcPriceUsd(event.metrics?.btc_price_usd?.toString() || "");
    setMarketCapUsd(event.metrics?.market_cap_usd?.toString() || "");
    setTvlUsd(event.metrics?.tvl_usd?.toString() || "");
    setVolumeUsd(event.metrics?.volume_usd?.toString() || "");
  };

  // Clear form
  const clearForm = () => {
    setId("");
    setTitle("");
    setDate("");
    setSummary("");
    setCategories([]);
    setTags([]);
    setModes([DEFAULT_MODE]);
    setImageUrl("");
    setLinks([]);
    setTwitterItems([]);
    setImageItems([]);
    setVideoItem(null);
    setIsCrimeline(false);
    setCrimelineType("");
    setFundsLostUsd("");
    setVictimsEstimated("");
    setRootCause("");
    setAftermath("");
    setOutcomeStatus("");
    setBtcPriceUsd("");
    setMarketCapUsd("");
    setTvlUsd("");
    setVolumeUsd("");
    setEditingEventId(null);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Build event from form
  const buildEventFromForm = (): Event => {
    // Build media array
    const media: MediaItem[] = [];

    // Add Twitter items
    twitterItems.forEach((item) => {
      if (item.tweet_url || item.account_handle) {
        media.push({
          type: "twitter",
          twitter: {
            tweet_url: item.tweet_url || undefined,
            account_handle: item.account_handle || undefined,
          },
        });
      }
    });

    // Add image items
    imageItems.forEach((item) => {
      if (item.url) {
        media.push({
          type: "image",
          image: {
            url: item.url,
            alt: item.alt || undefined,
            caption: item.caption || undefined,
          },
        });
      }
    });

    // Add video item
    if (videoItem && videoItem.url) {
      media.push({
        type: "video",
        video: {
          provider: videoItem.provider,
          url: videoItem.url,
          embed_url: videoItem.embed_url || undefined,
          poster_url: videoItem.poster_url || undefined,
          caption: videoItem.caption || undefined,
          orientation: videoItem.orientation || undefined,
        },
      });
    }

    // Build links array
    const validLinks = links.filter((l) => l.url.trim());

    // Build metrics
    const metrics: Event["metrics"] = {};
    if (btcPriceUsd) metrics.btc_price_usd = parseFloat(btcPriceUsd);
    if (marketCapUsd) metrics.market_cap_usd = parseFloat(marketCapUsd);
    if (tvlUsd) metrics.tvl_usd = parseFloat(tvlUsd);
    if (volumeUsd) metrics.volume_usd = parseFloat(volumeUsd);

    // Build crimeline
    let crimeline: Event["crimeline"] = undefined;
    if (isCrimeline && crimelineType) {
      crimeline = {
        type: crimelineType as CrimelineType,
        funds_lost_usd: fundsLostUsd ? parseFloat(fundsLostUsd) : undefined,
        victims_estimated: victimsEstimated || undefined,
        root_cause: rootCause
          ? rootCause.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        aftermath: aftermath || undefined,
        status: (outcomeStatus as OutcomeStatus) || undefined,
      };
    }

    return {
      id: id.trim(),
      date: date.trim(),
      title: title.trim(),
      summary: summary.trim(),
      category: categories.length > 0 ? categories : ["Other"],
      tags,
      mode: modes.length > 0 ? modes : [DEFAULT_MODE],
      image: imageUrl.trim() || undefined,
      media: media.length > 0 ? media : undefined,
      links: validLinks.length > 0 ? validLinks : undefined,
      metrics: Object.keys(metrics).length > 0 ? metrics : undefined,
      crimeline,
    };
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!adminSecret.trim()) {
      setError("Please enter the admin secret");
      return;
    }

    if (!id.trim() || !date.trim() || !title.trim() || !summary.trim()) {
      setError("Please fill in all required fields: ID, Date, Title, Summary");
      return;
    }

    setLoading(true);

    try {
      const event = buildEventFromForm();
      const isUpdate = editingEventId !== null;
      const endpoint = isUpdate ? "/api/admin/update-event" : "/api/admin/submit-event";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || `Failed to ${isUpdate ? "update" : "create"} event`);
        return;
      }

      setSuccess(`Event "${event.id}" ${isUpdate ? "updated" : "created"} successfully!`);

      if (!isUpdate) {
        clearForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Toggle helpers
  const handleToggle = <T extends string>(
    value: T,
    current: T[],
    setter: (next: T[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  // Array item helpers
  const updateArrayItem = <T,>(
    index: number,
    field: keyof T,
    value: string,
    array: T[],
    setter: (arr: T[]) => void
  ) => {
    const updated = [...array];
    updated[index] = { ...updated[index], [field]: value };
    setter(updated);
  };

  const removeArrayItem = <T,>(index: number, array: T[], setter: (arr: T[]) => void) => {
    setter(array.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 pt-10 pb-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Admin / Dev</p>
          <h1 className="text-3xl font-semibold">Event Editor</h1>
          <p className="text-white/70">
            Create new events or edit existing ones in Supabase.
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
              href="/admin/posts"
            >
              View Bot Posts
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

          {/* Search / Load Event */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Load Existing Event</h2>
              <p className="text-sm text-white/60 mt-1">
                Search for an event to edit, or leave blank to create a new one.
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or summary..."
              />
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-2 rounded-md border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition text-sm"
              >
                New Event
              </button>
            </div>

            {/* Search Results */}
            {searchLoading && (
              <p className="text-sm text-white/50">Searching...</p>
            )}

            {searchResults.length > 0 && (
              <div className="border border-white/10 rounded-lg divide-y divide-white/10 max-h-64 overflow-y-auto">
                {searchResults.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => loadEvent(event.id)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition"
                  >
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {event.date} &middot; {event.id}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {isEditing && editingEventId && (
              <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  Editing: <span className="font-mono">{editingEventId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Fields */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-white/80">
                    Event ID <span className="text-red-400">*</span>
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white font-mono"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="kebab-case-event-id"
                    disabled={isEditing}
                  />
                  <p className="text-xs text-white/40">
                    {isEditing ? "Cannot change ID when editing" : "Use kebab-case (lowercase, hyphens)"}
                  </p>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="text-white/80">
                    Date <span className="text-red-400">*</span>
                  </span>
                  <input
                    type="date"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm block">
                <span className="text-white/80">
                  Title <span className="text-red-400">*</span>
                </span>
                <input
                  type="text"
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                />
              </label>

              <label className="space-y-2 text-sm block">
                <span className="text-white/80">
                  Summary <span className="text-red-400">*</span>
                </span>
                <textarea
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  rows={5}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Event summary..."
                />
              </label>

              <label className="space-y-2 text-sm block">
                <span className="text-white/80">Main Image URL</span>
                <input
                  type="url"
                  className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </label>

              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-32 rounded-md border border-white/10"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Categories & Tags */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold">Categories, Tags & Modes</h3>

              <div className="space-y-2 text-sm">
                <span className="text-white/80">Categories</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition cursor-pointer ${
                        categories.includes(cat)
                          ? "border-blue-400 text-blue-200 bg-blue-500/10"
                          : "border-white/10 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={categories.includes(cat)}
                        onChange={() => handleToggle(cat, categories, setCategories)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <span className="text-white/80">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TAGS.map((tag) => (
                    <label
                      key={tag}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition cursor-pointer ${
                        tags.includes(tag)
                          ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                          : "border-white/10 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
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
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition cursor-pointer ${
                        modes.includes(mode)
                          ? "border-purple-400 text-purple-200 bg-purple-500/10"
                          : "border-white/10 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={modes.includes(mode)}
                        onChange={() => handleToggle(mode, modes, setModes)}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Reference Links</h3>
                <button
                  type="button"
                  onClick={() => setLinks([...links, emptyLinkItem()])}
                  className="px-3 py-1 text-xs rounded-md border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition"
                >
                  + Add Link
                </button>
              </div>

              {links.length === 0 ? (
                <p className="text-sm text-white/40">No links added.</p>
              ) : (
                <div className="space-y-3">
                  {links.map((link, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <input
                        type="text"
                        className="w-1/3 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                        value={link.label}
                        onChange={(e) =>
                          updateArrayItem(i, "label", e.target.value, links, setLinks)
                        }
                        placeholder="Label"
                      />
                      <input
                        type="url"
                        className="flex-1 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                        value={link.url}
                        onChange={(e) =>
                          updateArrayItem(i, "url", e.target.value, links, setLinks)
                        }
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(i, links, setLinks)}
                        className="px-2 py-2 text-red-400 hover:text-red-300"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Twitter/X Links */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Twitter/X Posts</h3>
                <button
                  type="button"
                  onClick={() => setTwitterItems([...twitterItems, emptyTwitterItem()])}
                  className="px-3 py-1 text-xs rounded-md border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition"
                >
                  + Add Tweet
                </button>
              </div>

              {twitterItems.length === 0 ? (
                <p className="text-sm text-white/40">No Twitter posts added.</p>
              ) : (
                <div className="space-y-3">
                  {twitterItems.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <input
                        type="url"
                        className="flex-1 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                        value={item.tweet_url}
                        onChange={(e) =>
                          updateArrayItem(i, "tweet_url", e.target.value, twitterItems, setTwitterItems)
                        }
                        placeholder="https://x.com/.../status/..."
                      />
                      <input
                        type="text"
                        className="w-32 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                        value={item.account_handle}
                        onChange={(e) =>
                          updateArrayItem(i, "account_handle", e.target.value, twitterItems, setTwitterItems)
                        }
                        placeholder="@handle"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(i, twitterItems, setTwitterItems)}
                        className="px-2 py-2 text-red-400 hover:text-red-300"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Additional Images</h3>
                <button
                  type="button"
                  onClick={() => setImageItems([...imageItems, emptyImageItem()])}
                  className="px-3 py-1 text-xs rounded-md border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition"
                >
                  + Add Image
                </button>
              </div>

              {imageItems.length === 0 ? (
                <p className="text-sm text-white/40">No additional images added.</p>
              ) : (
                <div className="space-y-4">
                  {imageItems.map((item, i) => (
                    <div key={i} className="p-4 border border-white/10 rounded-lg space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="url"
                          className="flex-1 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                          value={item.url}
                          onChange={(e) =>
                            updateArrayItem(i, "url", e.target.value, imageItems, setImageItems)
                          }
                          placeholder="Image URL"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem(i, imageItems, setImageItems)}
                          className="px-2 py-2 text-red-400 hover:text-red-300"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                          value={item.alt}
                          onChange={(e) =>
                            updateArrayItem(i, "alt", e.target.value, imageItems, setImageItems)
                          }
                          placeholder="Alt text"
                        />
                        <input
                          type="text"
                          className="rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                          value={item.caption}
                          onChange={(e) =>
                            updateArrayItem(i, "caption", e.target.value, imageItems, setImageItems)
                          }
                          placeholder="Caption"
                        />
                      </div>
                      {item.url && (
                        <img
                          src={item.url}
                          alt={item.alt || "Preview"}
                          className="max-h-24 rounded-md border border-white/10"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Video</h3>
                {!videoItem ? (
                  <button
                    type="button"
                    onClick={() => setVideoItem(emptyVideoItem())}
                    className="px-3 py-1 text-xs rounded-md border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition"
                  >
                    + Add Video
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVideoItem(null)}
                    className="px-3 py-1 text-xs text-red-400 hover:text-red-300"
                  >
                    Remove Video
                  </button>
                )}
              </div>

              {!videoItem ? (
                <p className="text-sm text-white/40">No video added.</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Provider</span>
                      <select
                        className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                        value={videoItem.provider}
                        onChange={(e) =>
                          setVideoItem({ ...videoItem, provider: e.target.value as VideoProvider })
                        }
                      >
                        {VIDEO_PROVIDERS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Orientation</span>
                      <select
                        className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                        value={videoItem.orientation}
                        onChange={(e) =>
                          setVideoItem({
                            ...videoItem,
                            orientation: e.target.value as VideoOrientation,
                          })
                        }
                      >
                        {VIDEO_ORIENTATIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <input
                    type="url"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                    value={videoItem.url}
                    onChange={(e) => setVideoItem({ ...videoItem, url: e.target.value })}
                    placeholder="Video URL"
                  />
                  <input
                    type="url"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                    value={videoItem.embed_url}
                    onChange={(e) => setVideoItem({ ...videoItem, embed_url: e.target.value })}
                    placeholder="Embed URL (optional)"
                  />
                  <input
                    type="url"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                    value={videoItem.poster_url}
                    onChange={(e) => setVideoItem({ ...videoItem, poster_url: e.target.value })}
                    placeholder="Poster/Thumbnail URL (optional)"
                  />
                  <input
                    type="text"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                    value={videoItem.caption}
                    onChange={(e) => setVideoItem({ ...videoItem, caption: e.target.value })}
                    placeholder="Caption (optional)"
                  />
                </div>
              )}
            </div>

            {/* Crimeline Section */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Crimeline Data</h3>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCrimeline}
                    onChange={(e) => setIsCrimeline(e.target.checked)}
                    className="accent-red-400"
                  />
                  <span className="text-white/70">This is a crimeline event</span>
                </label>
              </div>

              {isCrimeline && (
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Crimeline Type</span>
                      <select
                        className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                        value={crimelineType}
                        onChange={(e) => setCrimelineType(e.target.value as CrimelineType | "")}
                      >
                        <option value="">Select type...</option>
                        {CRIMELINE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Outcome Status</span>
                      <select
                        className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                        value={outcomeStatus}
                        onChange={(e) => setOutcomeStatus(e.target.value as OutcomeStatus | "")}
                      >
                        <option value="">Select status...</option>
                        {OUTCOME_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Funds Lost (USD)</span>
                      <input
                        type="number"
                        className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                        value={fundsLostUsd}
                        onChange={(e) => setFundsLostUsd(e.target.value)}
                        placeholder="e.g. 450000000"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Victims Estimated</span>
                      <input
                        type="text"
                        className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                        value={victimsEstimated}
                        onChange={(e) => setVictimsEstimated(e.target.value)}
                        placeholder="e.g. 10,000+ users"
                      />
                    </label>
                  </div>

                  <label className="space-y-2 text-sm block">
                    <span className="text-white/60">Root Cause (comma-separated)</span>
                    <input
                      type="text"
                      className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                      value={rootCause}
                      onChange={(e) => setRootCause(e.target.value)}
                      placeholder="e.g. Smart contract vulnerability, Flash loan attack"
                    />
                  </label>

                  <label className="space-y-2 text-sm block">
                    <span className="text-white/60">Aftermath</span>
                    <textarea
                      className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                      rows={3}
                      value={aftermath}
                      onChange={(e) => setAftermath(e.target.value)}
                      placeholder="What happened after the incident..."
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold">Market Metrics (Optional)</h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <label className="space-y-2 text-sm">
                  <span className="text-white/60">BTC Price (USD)</span>
                  <input
                    type="number"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                    value={btcPriceUsd}
                    onChange={(e) => setBtcPriceUsd(e.target.value)}
                    placeholder="e.g. 42000"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-white/60">Market Cap (USD)</span>
                  <input
                    type="number"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                    value={marketCapUsd}
                    onChange={(e) => setMarketCapUsd(e.target.value)}
                    placeholder="e.g. 1700000000000"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-white/60">TVL (USD)</span>
                  <input
                    type="number"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                    value={tvlUsd}
                    onChange={(e) => setTvlUsd(e.target.value)}
                    placeholder="e.g. 50000000000"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-white/60">Volume (USD)</span>
                  <input
                    type="number"
                    className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
                    value={volumeUsd}
                    onChange={(e) => setVolumeUsd(e.target.value)}
                    placeholder="e.g. 100000000"
                  />
                </label>
              </div>
            </div>

            {/* Error / Success Messages */}
            {error && (
              <p className="whitespace-pre-line rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {success}
              </p>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
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
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-md border border-white/10 px-6 py-2.5 text-sm text-white/70 transition hover:text-white hover:border-white/20"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
