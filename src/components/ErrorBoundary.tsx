"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the
 * child component tree and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-xs text-left overflow-auto max-w-full">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized error boundary for timeline sections.
 */
export function TimelineErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4 opacity-30">&#x1F4C5;</div>
          <p className="text-lg font-medium text-gray-500">
            Unable to load timeline events
          </p>
          <p className="text-sm mt-1 text-gray-400">
            Please refresh the page to try again
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Specialized error boundary for modal components.
 */
export function ModalErrorBoundary({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50 bg-white dark:bg-gray-900 rounded-xl p-8 text-center shadow-xl">
          <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to display content
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading this content.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
