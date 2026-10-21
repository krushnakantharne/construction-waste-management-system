import React from 'react';

/**
 * A simple React Error Boundary that catches rendering errors in its child tree.
 * It displays a fallback UI with the error message and logs the error to the console.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // When an error is thrown in a descendant, set error state.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log error details for debugging.
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded">
          <h2 className="font-bold">Something went wrong.</h2>
          <pre className="mt-2 text-sm">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
