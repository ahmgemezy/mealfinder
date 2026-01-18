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
                // Re-access window.ezstandalone to ensure we have the loaded library with methods, 
                // in case the initial stub object was replaced or not yet augmented.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const actualEz = (window as any).ezstandalone;
                if (actualEz && typeof actualEz.showAds === 'function') {
                    actualEz.showAds();
                } else if (actualEz && typeof actualEz.refresh === 'function') {
                    // Fallback or alternative method if showAds isn't there
                    actualEz.refresh();
                }
            });
        }
    }, [pathname]);

    return null;
}
