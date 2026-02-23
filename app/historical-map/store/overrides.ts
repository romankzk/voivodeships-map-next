'use client'

/**
 * In-memory store for GeoJSON feature property overrides.
 * Keyed by "{periodId}:{layerType}:{featureIndex}" for efficient lookup.
 * Persists only for the current browser session (not saved to disk).
 */

export type LayerType = 'areas' | 'borders' | 'points';

type OverrideKey = string;

/** Build a unique key for a feature override. */
function makeKey(periodId: string, layerType: LayerType, featureIndex: number): OverrideKey {
    return `${periodId}:${layerType}:${featureIndex}`;
}

/** Map of override keys to partial property objects. */
const overrides = new Map<OverrideKey, Record<string, unknown>>();

/** Listeners notified on any change. */
const listeners = new Set<() => void>();

function notify() {
    for (const fn of listeners) fn();
}

/** Subscribe to store changes. Returns an unsubscribe function. */
export function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/** Get the override for a specific feature, or undefined if none. */
export function getOverride(
    periodId: string,
    layerType: LayerType,
    featureIndex: number,
): Record<string, unknown> | undefined {
    return overrides.get(makeKey(periodId, layerType, featureIndex));
}

/** Set (merge) property overrides for a specific feature. */
export function setOverride(
    periodId: string,
    layerType: LayerType,
    featureIndex: number,
    properties: Record<string, unknown>,
): void {
    const key = makeKey(periodId, layerType, featureIndex);
    const existing = overrides.get(key) ?? {};
    overrides.set(key, { ...existing, ...properties });
    notify();
}

/** Remove all overrides for a specific feature. */
export function clearOverride(
    periodId: string,
    layerType: LayerType,
    featureIndex: number,
): void {
    overrides.delete(makeKey(periodId, layerType, featureIndex));
    notify();
}

/** Get all overrides (for debugging / export). */
export function getAllOverrides(): Map<OverrideKey, Record<string, unknown>> {
    return new Map(overrides);
}

/** Get the count of overrides. */
export function getOverrideCount(): number {
    return overrides.size;
}

/** Clear all overrides. */
export function clearAllOverrides(): void {
    overrides.clear();
    notify();
}

/**
 * Apply overrides to a FeatureCollection, returning a new one with merged properties.
 * Does not mutate the original.
 */
export function applyOverrides(
    periodId: string,
    layerType: LayerType,
    collection: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
    const hasAny = [...overrides.keys()].some(k => k.startsWith(`${periodId}:${layerType}:`));
    if (!hasAny) return collection;

    return {
        ...collection,
        features: collection.features.map((feature, index) => {
            const override = overrides.get(makeKey(periodId, layerType, index));
            if (!override) return feature;
            return {
                ...feature,
                properties: { ...feature.properties, ...override },
            };
        }),
    };
}
