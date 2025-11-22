"use client";

import React from "react";
import { Link } from "@/navigation";
import { usePathname } from "next/navigation";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const pathname = usePathname();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden transform transition-all scale-100 opacity-100">
                {/* Decorative Header Background */}
                <div className="h-32 bg-gradient-to-br from-primary-500 to-accent-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
                    <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <span className="text-4xl">🔐</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="font-display text-2xl font-bold text-foreground">
                            Unlock Full Access
                        </h2>
                        <p className="text-muted-foreground">
                            Sign in to save your favorite recipes, create collections, and access them from any device.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/signin"
                            className="block w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={onClose}
                        >
                            Sign In
                        </Link>

                        <Link
                            href="/signup"
                            className="block w-full py-3.5 px-4 bg-card hover:bg-muted text-foreground font-bold rounded-xl border-2 border-border transition-all hover:border-primary-200"
                            onClick={onClose}
                        >
                            Create Account
                        </Link>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
