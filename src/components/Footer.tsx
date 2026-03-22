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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand + Community Callout */}
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
            <p
              className={`text-xs mt-3 ${
                isCrimeline ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Powered by community submissions. Help us document crypto history.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
              <a
                href="https://twitter.com/chainofeventsxyz"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  isCrimeline
                    ? "text-gray-500 hover:text-white hover:bg-purple-900/40"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Follow on X/Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                </svg>
              </a>
              <a
                href="https://warpcast.com/chainofevents"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  isCrimeline
                    ? "text-gray-500 hover:text-white hover:bg-purple-900/40"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Follow on Farcaster"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M5.32 3h13.36l1.32 5.3h-1.06l-.66-2.65A1.33 1.33 0 0016.99 4.4H7.01a1.33 1.33 0 00-1.29 1.25L5.06 8.3H4L5.32 3zM4 9.63h16V21H4V9.63zm3.33 2.65v2.65a2.67 2.67 0 005.34 0v-2.65h-1.34v2.65a1.33 1.33 0 01-2.66 0v-2.65H7.33zm6.67 0v2.65a1.33 1.33 0 002.66 0v-2.65H18v2.65a2.67 2.67 0 01-5.34 0v-2.65H14z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Feedback Links */}
          <div className="flex flex-col items-center gap-3">
            <p
              className={`text-xs font-bold uppercase tracking-widest ${
                isCrimeline ? "text-purple-400" : "text-teal-600"
              }`}
            >
              Contribute
            </p>
            <button
              onClick={() => openFeedbackModal("new_event")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full max-w-[200px] justify-center ${
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
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full max-w-[200px] justify-center ${
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

          {/* API + Copyright */}
          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-3">
            <p
              className={`text-xs font-bold uppercase tracking-widest ${
                isCrimeline ? "text-purple-400" : "text-teal-600"
              }`}
            >
              For Developers
            </p>
            <a
              href="/api/v1/events"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isCrimeline
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Open API
            </a>
            <p
              className={`text-xs ${
                isCrimeline ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Free REST API for crypto history data
            </p>
            <div
              className={`text-xs mt-2 ${
                isCrimeline ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {new Date().getFullYear()} Chain of Events
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
