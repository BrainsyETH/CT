"use client";

import { useModeStore } from "@/store/mode-store";

export function Footer() {
  const { mode, openFeedbackModal } = useModeStore();
  const isCrimeline = mode === "crimeline";

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-950 border-purple-900/30"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3
              className={`text-lg font-bold ${
                isCrimeline ? "text-white" : "text-gray-900"
              }`}
            >
              Chain of Events
            </h3>
            <p
              className={`text-sm mt-1 ${
                isCrimeline ? "text-gray-400" : "text-gray-600"
              }`}
            >
              The History of Cryptocurrency
            </p>
          </div>

          {/* Feedback Links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openFeedbackModal("new_event")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCrimeline
                  ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30"
                  : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Submit Event
            </button>
            <button
              onClick={() => openFeedbackModal("general")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCrimeline
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Send Feedback
            </button>
          </div>

          {/* Copyright */}
          <div
            className={`text-xs ${
              isCrimeline ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {new Date().getFullYear()} Chain of Events
          </div>
        </div>
      </div>
    </footer>
  );
}
