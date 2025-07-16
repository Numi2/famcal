"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Caught!</h1>
          <div className="bg-white p-4 rounded border border-red-200">
            <p className="font-mono text-sm">{this.state.error?.message}</p>
            <pre className="mt-4 text-xs overflow-auto">
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function TestContent() {
  // This will run and might throw an error
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">If you see this, no error occurred</h1>
    </div>
  )
}

export default function ErrorTestPage() {
  return (
    <ErrorBoundary>
      <TestContent />
    </ErrorBoundary>
  )
}