'use client';

import { createContext, useContext } from 'react';
import type { MapContextValue } from '../types';

const MapContext = createContext<MapContextValue | null>(null);

export const MapProvider = MapContext.Provider;

export function useMapContext(): MapContextValue {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapProvider');
    }
    return context;
}
