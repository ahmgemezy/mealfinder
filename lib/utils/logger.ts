/**
 * Development-only logging utility
 * Logs are only output in development mode to keep production console clean
 */

const isDev = process.env.NODE_ENV === 'development';

export const devLog = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },

    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },

    // Always log errors, even in production
    error: (...args: unknown[]) => {
        console.error(...args);
    },

    info: (...args: unknown[]) => {
        if (isDev) console.info(...args);
    },
};
