'use client'

import { useEffect, useRef, type RefObject } from 'react';
import L from 'leaflet';
import 'leaflet.pattern';
import { stripePattern } from '../utils/constants';
import { useTheme } from 'next-themes';

const LEVEL2_ZOOM = 7;
const LEVEL3_ZOOM = 8;

const DARK_TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png';
const LIGHT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * Apply zoom-based opacity to city labels
 */
export function applyLabelOpacity(zoom: number) {
    document.querySelectorAll<HTMLElement>('.level2-city-label').forEach(el => {
        el.style.opacity = zoom < LEVEL2_ZOOM ? '0' : '1';
    });

    document.querySelectorAll<HTMLElement>('.level3-city-label').forEach(el => {
        el.style.opacity = zoom < LEVEL3_ZOOM ? '0' : '1';
    });
}

const TILE_OPTIONS: L.TileLayerOptions = {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

/**
 * Initializes a Leaflet map on the given container ref.
 * Sets up tile layer, custom panes, zoom-based label visibility, and zoom control.
 * Swaps tile layer when dark mode toggles.
 */
export function useMap(containerRef: RefObject<HTMLDivElement | null>): L.Map | null {
    const mapRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    // Initialize map once
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [48.88, 30.81],
            zoom: 6,
            zoomControl: false
        });

        // Custom panes with z-index ordering: regions < borders < cities
        const panes: Array<[string, number]> = [
            ['regionsPane', 450],
            ['bordersPane', 550],
            ['citiesPane', 620],
        ];

        for (const [name, zIndex] of panes) {
            map.createPane(name);
            const pane = map.getPane(name)!;
            pane.style.zIndex = String(zIndex);
            pane.style.pointerEvents = 'none';
        }

        // Zoom-dependent label visibility
        map.on('zoomend', () => {
            applyLabelOpacity(map.getZoom());
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);      
        stripePattern.addTo(map); // Add stripePattern to be used in the fillPattern

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            tileLayerRef.current = null;
        };
    }, [containerRef]);

    // Swap tile layer when dark mode changes (or on first render after map init)
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }

        const url = isDark ? DARK_TILE_URL : LIGHT_TILE_URL;
        tileLayerRef.current = L.tileLayer(url, TILE_OPTIONS).addTo(map);
        tileLayerRef.current.setZIndex(0);
    }, [isDark]);

    return mapRef.current;
}
