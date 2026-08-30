"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (retry: () => void, error: Error) => React.ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Isolates failures per report block / visualization so one broken chart
 * cannot take down an entire page or report.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", this.props.label ?? "", error, info.componentStack);
  }

  retry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(this.retry, error);

    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-negative/30 bg-negative/5 p-6 text-center">
        <AlertTriangle className="h-5 w-5 text-negative" />
        <p className="text-sm text-foreground">
          Unable to load {this.props.label ?? "this component"}
        </p>
        <Button size="sm" variant="outline" onClick={this.retry}>
          Retry
        </Button>
      </div>
    );
  }
}
