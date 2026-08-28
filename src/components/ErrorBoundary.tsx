import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level crash guard: renders a friendly full-page fallback instead of a
 * white screen. Uses plain HTML elements on purpose — a UI-kit crash must not
 * break the fallback itself.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[LessonPlanner] Render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <h1 className="text-lg font-bold text-red-800 dark:text-red-200">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            An unexpected error occurred. Your lesson data is safe on this
            device — reload to continue.
          </p>
          <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-white/70 p-2 text-left text-xs text-red-900 dark:bg-red-900/40 dark:text-red-200">
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 min-h-[44px] rounded-lg bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}