"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function EzoicAdsHandler() {
    const pathname = usePathname();

    useEffect(() => {
        // wait for Ezoic to be available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ez = (window as any).ezstandalone;
        if (ez && ez.cmd) {
            ez.cmd.push(() => {
                // Refresh all ads on page navigation
                // Calling showAds() without arguments refreshes all defined placeholders
                ez.showAds();
            });
        }
    }, [pathname]);

    return null;
}
