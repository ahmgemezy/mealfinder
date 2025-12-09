"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PullToRefresh() {
    const router = useRouter();
    const [startY, setStartY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const THRESHOLD = 150;

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                setStartY(e.touches[0].clientY);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0 && startY > 0) {
                const currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                if (diff > 0) {
                    setPullDistance(diff);
                    // Prevent default pull-to-refresh behavior of browser
                    if (diff < THRESHOLD) {
                        e.preventDefault();
                    }
                }
            }
        };

        const handleTouchEnd = () => {
            if (pullDistance > THRESHOLD && !refreshing) {
                setRefreshing(true);
                router.refresh();
                setTimeout(() => {
                    setRefreshing(false);
                    setPullDistance(0);
                }, 1000);
            } else {
                setPullDistance(0);
            }
            setStartY(0);
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [startY, pullDistance, refreshing, router]);

    if (pullDistance === 0 && !refreshing) return null;

    return (
        <div
            className="fixed top-0 left-0 w-full flex justify-center items-center pointer-events-none z-50 transition-all duration-300"
            style={{
                height: refreshing ? '60px' : `${Math.min(pullDistance * 0.4, 80)}px`,
                opacity: Math.min(pullDistance / THRESHOLD, 1)
            }}
        >
            <div className="bg-background/80 backdrop-blur-md rounded-full p-2 shadow-lg border border-border">
                {refreshing ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                ) : (
                    <svg
                        className="w-6 h-6 text-primary-500 transition-transform duration-300"
                        style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                )}
            </div>
        </div>
    );
}
