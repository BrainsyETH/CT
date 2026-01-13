"use client";

import { CATEGORIES, EVENT_TAGS, MODE_OPTIONS } from "@/lib/constants";

interface EventFieldsProps {
  eventTitle: string;
  eventDate: string;
  eventSummary: string;
  eventCategory: string;
  eventTags: string[];
  eventMode: string;
  eventImageUrl: string;
  eventSourceUrl: string;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTagToggle: (tag: string) => void;
  onModeChange: (value: string) => void;
  onImageUrlChange: (value: string) => void;
  onSourceUrlChange: (value: string) => void;
  inputClassName: string;
  labelClassName: string;
  isCrimeline: boolean;
}

export function EventFields({
  eventTitle,
  eventDate,
  eventSummary,
  eventCategory,
  eventTags,
  eventMode,
  eventImageUrl,
  eventSourceUrl,
  onTitleChange,
  onDateChange,
  onSummaryChange,
  onCategoryChange,
  onTagToggle,
  onModeChange,
  onImageUrlChange,
  onSourceUrlChange,
  inputClassName,
  labelClassName,
  isCrimeline,
}: EventFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventTitle" className={labelClassName}>
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="eventTitle"
            required
            value={eventTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Bitcoin Pizza Day"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="eventDate" className={labelClassName}>
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="eventDate"
            required
            value={eventDate}
            onChange={(e) => onDateChange(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="eventSummary" className={labelClassName}>
          Summary <span className="text-red-500">*</span>
        </label>
        <textarea
          id="eventSummary"
          required
          rows={3}
          value={eventSummary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Describe the event..."
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventCategory" className={labelClassName}>
            Category
          </label>
          <select
            id="eventCategory"
            value={eventCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={inputClassName}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="eventMode" className={labelClassName}>
            Mode
          </label>
          <select
            id="eventMode"
            value={eventMode}
            onChange={(e) => onModeChange(e.target.value)}
            className={inputClassName}
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClassName}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                eventTags.includes(tag)
                  ? isCrimeline
                    ? "bg-purple-600 text-white"
                    : "bg-teal-600 text-white"
                  : isCrimeline
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventImageUrl" className={labelClassName}>
            Image URL
          </label>
          <input
            type="url"
            id="eventImageUrl"
            value={eventImageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="eventSourceUrl" className={labelClassName}>
            Source URL
          </label>
          <input
            type="url"
            id="eventSourceUrl"
            value={eventSourceUrl}
            onChange={(e) => onSourceUrlChange(e.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
        </div>
      </div>
    </>
  );
}
