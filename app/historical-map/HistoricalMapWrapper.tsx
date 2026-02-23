'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client-side root, disabling SSR
export const HistoricalMapWrapper = dynamic(
    () => import('./HistoricalMap'),
    { 
        ssr: false, 
        loading: () => (
            <div className="w-full h-screen flex items-center justify-center bg-stone-900 text-stone-200">
                Завантаження карти...
            </div>
        )
    }
);