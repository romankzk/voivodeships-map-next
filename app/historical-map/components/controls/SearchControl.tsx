'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { useLeafletControl } from '../../hooks/useLeafletControl';
import { useDebounce } from '../../hooks/useDebounce';
import { useMapContext } from '../../context/MapContext';
import type { SearchResultFeature } from '../../types';
import { Search } from 'lucide-react';

/**
 * Provides a search input that queries OpenStreetMap Nominatim for locations within Ukraine.
 * Displays results in a dropdown and places a marker on the selected location.
 */
export function SearchControl() {
    const { map, searchLayer } = useMapContext();
    const container = useLeafletControl(map, 'topright', 'search-control');

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultFeature[]>([]);
    const [showResults, setShowResults] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        let cancelled = false;

        searchOSM(debouncedQuery).then(features => {
            if (cancelled) return;
            setResults(features);
            setShowResults(features.length > 0);
        });

        return () => { cancelled = true; };
    }, [debouncedQuery]);

    const handleSelection = useCallback((feature: SearchResultFeature) => {
        if (!map || !searchLayer) return;

        searchLayer.clearLayers();

        const [lng, lat] = feature.geometry.coordinates;

        const marker = L.marker([lat, lng], {
            icon: new L.Icon({
                iconUrl: './marker-icon.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -24],
            })
        }).bindPopup(`<span class="font-bold font-[Inter,sans-serif]">${feature.properties.name}</span>`);

        searchLayer.addLayer(marker);
        marker.openPopup();
        map.flyTo([lat, lng], 14);

        setQuery('');
        setShowResults(false);
    }, [map, searchLayer]);

    if (!container) return null;

    return createPortal(
        <div className="relative w-40 sm:w-60 flex flex-row items-center text-sm p-1 bg-white dark:bg-slate-900 dark:text-white rounded-lg shadow-lg">
            <Search size={18} className="text-gray-400 dark:text-slate-600 ml-2"/>
            <input
                type="text"
                className="w-full p-2 text-sm border-none rounded box-border focus:outline-none placeholder-gray-400 dark:placeholder-slate-600"
                placeholder="Шукати на карті..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {showResults && (
                <ul className="absolute top-full left-0 right-0 bg-white list-none mt-1 p-0 border border-slate-300 max-h-[200px] overflow-y-auto z-[1000] shadow-md rounded dark:bg-slate-900 dark:border-slate-800">
                    {results.map((feature, i) => (
                        <li
                            key={i}
                            className="px-3 py-2 cursor-pointer border-b border-slate-100 flex flex-col hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                            onClick={() => handleSelection(feature)}
                        >
                            <span className="font-medium text-sm">{feature.properties.name}</span>
                            <span className="text-[10px] text-slate-500">{feature.properties.higherDivision}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>,
        container
    );
}

async function searchOSM(query: string): Promise<SearchResultFeature[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ua`;

    try {
        const response = await fetch(url, {
            headers: { 'Accept-Language': 'uk, en' }
        });
        const data = await response.json();

        return data.map((item: { display_name: string; lon: string; lat: string }) => ({
            properties: {
                name: item.display_name.split(',')[0],
                higherDivision: item.display_name.split(',').slice(1, 3).join(','),
                isOSM: true,
            },
            geometry: {
                coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
            },
        }));
    } catch (error) {
        console.error('OSM Search failed:', error);
        return [];
    }
}
