"use client";

import { Link } from "@/navigation";
import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/auth/GoogleButton";
import { useTranslations } from "next-intl";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function SignUpPage() {
    const t = useTranslations('Auth');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");

    const handleGoogleLogin = async () => {
        if (!isSupabaseConfigured()) {
            alert(
                "Supabase is not configured yet.\n\nPlease add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
            );
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error logging in with Google:", error);
            alert("Failed to redirect to Google. See console for details.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isSupabaseConfigured()) {
            setError("Supabase is not configured. Please add credentials to .env.local");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                // Check if email confirmation is required
                if (data.user.identities && data.user.identities.length === 0) {
                    setError("An account with this email already exists.");
                } else if (data.user.confirmed_at) {
                    // User is confirmed, redirect to home
                    window.location.href = "/";
                } else {
                    // Email confirmation required
                    alert("Success! Please check your email to confirm your account.");
                    window.location.href = "/signin";
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error signing up:", error);
            setError(error.message || "An error occurred during sign up. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={t('createAccount')}
            subtitle={t('signUpSubtitle')}
        >
            <div className="space-y-6">
                <GoogleButton onClick={handleGoogleLogin}>
                    {t('signUpGoogle')}
                </GoogleButton>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-card px-2 text-muted-foreground">
                            {t('orContinueWith')}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <Input
                        label={t('fullName')}
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                    <Input
                        label={t('emailAddress')}
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label={t('password')}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        {t('createAccount')}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    {t('alreadyHaveAccount')}{" "}
                    <Link
                        href="/signin"
                        className="font-medium text-primary-600 hover:text-primary-500"
                    >
                        {t('signIn')}
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
