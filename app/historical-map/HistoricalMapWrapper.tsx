'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client-side map, disabling SSR
export const HistoricalMapWrapper = dynamic(
    () => import('./HistoricalMap'),
    { 
        ssr: false, 
        loading: () => (
            <div className="w-full h-screen flex items-center justify-center bg-white-900 dark:bg-slate-900 text-slate-400">
                Завантаження карти...
            </div>
        )
    }
);