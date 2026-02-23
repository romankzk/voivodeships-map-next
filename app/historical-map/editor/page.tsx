'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TIME_PERIODS } from '../utils/constants';
import {
    getOverride,
    setOverride,
    clearOverride,
    getOverrideCount,
    clearAllOverrides,
    subscribe,
    type LayerType,
} from '../store/overrides';
import type { PeriodData } from '../types/index.ts';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

type FeatureEntry = {
    index: number;
    properties: Record<string, unknown>;
    hasOverride: boolean;
};

const LAYER_TYPES: { value: LayerType; label: string }[] = [
    { value: 'areas', label: 'Регіони (areas)' },
    { value: 'borders', label: 'Кордони (borders)' },
    { value: 'points', label: 'Міста (points)' },
];

/**
 * Admin page for editing GeoJSON feature properties.
 * Loads features from the same data files as the map, allows inline editing,
 * and stores overrides in browser memory.
 */
export default function EditorPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const periodId = searchParams.get('period') ?? Object.values(TIME_PERIODS)[0].id;
    const layerType = (searchParams.get('layer') ?? 'areas') as LayerType;

    const [data, setData] = useState<PeriodData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
    const [overrideVersion, setOverrideVersion] = useState(0);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    )

    // Subscribe to override store changes
    useEffect(() => {
        return subscribe(() => setOverrideVersion(v => v + 1));
    }, []);

    // Fetch GeoJSON data for the selected period
    useEffect(() => {
        const periodConfig = Object.values(TIME_PERIODS).find(p => p.id === periodId);
        if (!periodConfig) return;

        const controller = new AbortController();
        setIsLoading(true);
        setData(null);
        setExpandedFeature(null);

        Promise.all([
            fetch(`/data/${periodConfig.areasFile}.geojson`, { signal: controller.signal }).then(r => r.json()),
            fetch(`/data/${periodConfig.bordersFile}.geojson`, { signal: controller.signal }).then(r => r.json()),
            fetch(`/data/${periodConfig.pointsFile}.geojson`, { signal: controller.signal }).then(r => r.json()),
        ])
            .then(([areas, borders, points]) => {
                setData({ areas, borders, points });
                setIsLoading(false);
            })
            .catch(error => {
                if (error.name === 'AbortError') return;
                console.error('Failed to load geojson:', error);
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [periodId]);

    // Build the feature list for the selected layer
    const features: FeatureEntry[] = useMemo(() => {
        if (!data) return [];
        const collection = data[layerType];
        return collection.features.map((feature, index) => ({
            index,
            properties: { ...(feature.properties ?? {}) },
            hasOverride: !!getOverride(periodId, layerType, index),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, layerType, periodId, overrideVersion]);

    const overrideCount = useMemo(() => getOverrideCount(), [overrideVersion]);

    const updateParam = (key: string, value: string) => {
        router.push(`${pathname}?${createQueryString(key, value)}`);
    };

    /** Get the display name for a feature (for the list). */
    const featureLabel = (entry: FeatureEntry): string => {
        const p = entry.properties;
        const override = getOverride(periodId, layerType, entry.index);
        const merged = override ? { ...p, ...override } : p;

        const name = merged.name as string | undefined;
        if (name) return name;
        return `Feature #${entry.index}`;
    };

    return (
        <div className="font-[Inter,sans-serif] w-full bg-white dark:bg-[#111827]">
            <div className=" max-w-[900px] mx-auto px-3 py-4 sm:p-5 min-h-screen box-border dark:bg-[#111827]">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/historical-map" className="flex items-center gap-2 text-xs text-[#2c3e50] no-underline px-3 py-1.5 rounded-md bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 whitespace-nowrap">
                            <ArrowLeft size={14} /> На карту
                        </Link>
                        <h1 className="m-0 text-xl sm:text-2xl text-slate-900 dark:text-slate-100 font-semibold">Редактор метаданих</h1>
                    </div>
                    <div className="flex items-center gap-2.5">
                        {overrideCount > 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-700 whitespace-nowrap">
                                {overrideCount} {overrideCount === 1 ? 'зміна' : 'змін'}
                            </span>
                        )}
                        {overrideCount > 0 && (
                            <button
                                className="px-3 py-1.5 border border-red-500 rounded-md bg-white text-red-500 dark:bg-red-900 dark:text-white dark:border-red-900 text-xs cursor-pointer transition-all hover:bg-red-500 hover:text-white"
                                onClick={() => {
                                    if (confirm('Скинути всі зміни?')) clearAllOverrides();
                                }}
                            >
                                Скинути все
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 my-2">
                    <TriangleAlert size={14} /> Працює в тестовому режимі: зміни збережуться лише в цьому браузері і не будуть видимі іншим користувачам
                </div>


                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[13px] font-medium text-slate-600 dark:text-slate-100">Період:</label>
                        <select
                            className="flex-1 sm:flex-none px-3 py-1.5 border border-slate-300 dark:border-slate-800 dark:bg-slate-700 dark:text-white rounded-md bg-white font-[inherit] text-[13px]"
                            value={periodId}
                            onChange={e => updateParam('period', e.target.value)}
                        >
                            {Object.values(TIME_PERIODS).map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-[13px] font-medium text-slate-600 dark:text-slate-100">Шар:</label>
                        <select
                            className="flex-1 sm:flex-none px-3 py-1.5 border border-slate-300 dark:border-slate-800 dark:bg-slate-700 dark:text-white rounded-md bg-white font-[inherit] text-[13px]"
                            value={layerType}
                            onChange={e => updateParam('layer', e.target.value)}
                        >
                            {LAYER_TYPES.map(lt => (
                                <option key={lt.value} value={lt.value}>{lt.label}</option>
                            ))}
                        </select>
                    </div>

                    <span className="text-[13px] text-gray-400 sm:ml-auto">
                        {features.length} об'єктів
                    </span>
                </div>

                {isLoading && <div className="text-center py-10 text-slate-400 text-[15px]">Завантаження...</div>}

                {!isLoading && features.length > 0 && (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        {features.map(entry => (
                            <FeatureRow
                                key={`${periodId}-${layerType}-${entry.index}`}
                                entry={entry}
                                periodId={periodId}
                                layerType={layerType}
                                isExpanded={expandedFeature === entry.index}
                                onToggle={() =>
                                    setExpandedFeature(
                                        expandedFeature === entry.index ? null : entry.index,
                                    )
                                }
                                label={featureLabel(entry)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Feature Row ────────────────────────────────────────────────────────────

interface FeatureRowProps {
    entry: FeatureEntry;
    periodId: string;
    layerType: LayerType;
    isExpanded: boolean;
    onToggle: () => void;
    label: string;
}

function FeatureRow({ entry, periodId, layerType, isExpanded, onToggle, label }: FeatureRowProps) {
    const override = getOverride(periodId, layerType, entry.index);
    const merged = override ? { ...entry.properties, ...override } : entry.properties;

    return (
        <div className={`border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${entry.hasOverride ? 'bg-amber-50 dark:bg-amber-900' : ''}`}>
            <button
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 border-none bg-transparent cursor-pointer font-[inherit] text-sm text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={onToggle}
            >
                <span className="text-xs text-slate-400 min-w-8 tabular-nums">#{entry.index}</span>
                <span className="flex-1 font-medium dark:text-slate-100 truncate">{label}</span>
                {entry.hasOverride && <span className="size-2 rounded-full bg-amber-400 shrink-0" title="Змінено" />}
                <span className={`text-[10px] text-slate-400 shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
            </button>

            {isExpanded && (
                <FeatureEditor
                    properties={merged}
                    originalProperties={entry.properties}
                    periodId={periodId}
                    layerType={layerType}
                    featureIndex={entry.index}
                />
            )}
        </div>
    );
}

// ─── Feature Editor (expanded property form) ────────────────────────────────

interface FeatureEditorProps {
    properties: Record<string, unknown>;
    originalProperties: Record<string, unknown>;
    periodId: string;
    layerType: LayerType;
    featureIndex: number;
}

function FeatureEditor({
    properties,
    originalProperties,
    periodId,
    layerType,
    featureIndex,
}: FeatureEditorProps) {
    const propKeys = Object.keys(properties);
    const override = getOverride(periodId, layerType, featureIndex);

    const handleChange = (key: string, value: string) => {
        const original = originalProperties[key];
        // Parse back to number if original was number
        let parsed: unknown = value;
        if (typeof original === 'number') {
            const num = Number(value);
            if (!isNaN(num)) parsed = num;
        }
        // If empty string and original was null/undefined, store null
        if (value === '' && (original === null || original === undefined)) {
            parsed = null;
        }

        setOverride(periodId, layerType, featureIndex, { [key]: parsed });
    };

    const handleRevert = (key: string) => {
        if (!override) return;
        const { [key]: _, ...rest } = override;
        if (Object.keys(rest).length === 0) {
            clearOverride(periodId, layerType, featureIndex);
        } else {
            // Replace the entire override (remove one key)
            clearOverride(periodId, layerType, featureIndex);
            if (Object.keys(rest).length > 0) {
                setOverride(periodId, layerType, featureIndex, rest);
            }
        }
    };

    const handleRevertAll = () => {
        clearOverride(periodId, layerType, featureIndex);
    };

    const isModified = (key: string): boolean => {
        if (!override) return false;
        return key in override;
    };

    return (
        <div className="py-2 px-3 sm:pr-3 sm:pl-14 flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800">
            {propKeys.map(key => {
                const value = properties[key];
                const displayValue = value === null || value === undefined ? '' : String(value);
                const modified = isModified(key);

                return (
                    <div key={key} className="flex items-center gap-2">
                        <label
                            className={`text-xs min-w-20 max-w-20 sm:min-w-30 sm:max-w-30 truncate ${modified ? 'text-amber-600 font-semibold' : 'text-slate-500 dark:text-slate-300'}`}
                            title={key}
                        >
                            {key}
                        </label>
                        <input
                            className={`flex-1 px-2 py-1 border border-slate-200 dark:border-slate-700 dark:text-white rounded font-[inherit] text-[13px] transition-colors focus:outline-none focus:border-slate-400
                                ${modified ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-800/50 dark:border-amber-900' : 'border-slate-300'}`}
                            type="text"
                            value={displayValue}
                            onChange={e => handleChange(key, e.target.value)}
                        />
                        {modified && (
                            <button
                                className="px-1.5 py-0.5 border-none bg-transparent cursor-pointer text-base text-slate-400 leading-none rounded transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900"
                                onClick={() => handleRevert(key)}
                                title="Скасувати зміну"
                            >
                                &#8634;
                            </button>
                        )}
                    </div>
                );
            })}

            {override && Object.keys(override).length > 0 && (
                <div className="mt-1.5 pt-2 border-t border-dashed border-gray-300">
                    <button
                        className="px-3 py-1 border border-slate-300 rounded bg-white dark:bg-slate-800 dark:text-slate-100 font-[inherit] text-xs text-gray-500 cursor-pointer transition-all hover:border-red-500 hover:text-red-500"
                        onClick={handleRevertAll}
                    >
                        Скасувати всі зміни для цього об'єкту
                    </button>
                </div>
            )}
        </div>
    );
}