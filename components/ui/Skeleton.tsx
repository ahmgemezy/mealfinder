import React from "react";

export interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
}

export default function Skeleton({
    className = "",
    variant = "rectangular",
}: SkeletonProps) {
    const baseStyles = "shimmer bg-muted rounded animate-pulse";

    const variants = {
        text: "h-4 w-full rounded",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };

    return <div className={`${baseStyles} ${variants[variant]} ${className}`} />;
}

export function RecipeCardSkeleton() {
    return (
        <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-5 space-y-3">
                <Skeleton variant="text" className="h-6 w-3/4" />
                <Skeleton variant="text" className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>
        </div>
    );
}
