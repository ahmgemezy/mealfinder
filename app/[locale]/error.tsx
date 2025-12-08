'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error to error reporting service
        console.error('Global error boundary caught:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <svg
                        className="mx-auto h-16 w-16 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-4">
                    Oops! Something went wrong
                </h2>

                <p className="text-muted-foreground mb-8">
                    We encountered an unexpected error. Don't worry, we're working on it!
                </p>

                <div className="space-y-4">
                    <button
                        onClick={reset}
                        className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                        Try again
                    </button>

                    <a
                        href="/"
                        className="block w-full px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                        Go back home
                    </a>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-8 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            Error details (dev only)
                        </summary>
                        <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto">
                            {error.message}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    )
}
