'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
    subscribe,
    getOverrideCount,
    applyOverrides,
    type LayerType,
} from '../store/overrides';

/** Returns the current override count — triggers re-render when overrides change. */
export function useOverrideCount(): number {
    return useSyncExternalStore(subscribe, getOverrideCount);
}

/**
 * Returns a stable function that applies overrides to a FeatureCollection.
 * Re-renders when the override store changes.
 */
export function useApplyOverrides(periodId: string, layerType: LayerType) {
    // Subscribe so component re-renders when overrides change
    const _version = useSyncExternalStore(subscribe, getOverrideCount);
    void _version;

    return useCallback(
        (collection: GeoJSON.FeatureCollection) =>
            applyOverrides(periodId, layerType, collection),
        [periodId, layerType, _version],
    );
}
