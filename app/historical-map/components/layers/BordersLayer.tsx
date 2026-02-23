'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { STYLES } from '../../utils/constants';
import { useTheme } from 'next-themes';

interface BordersLayerProps {
    map: L.Map;
    data: GeoJSON.FeatureCollection;
    layerGroup: L.LayerGroup;
}

/**
 * Renderless component that manages border line layers on the map.
 * Reactively updates border style when dark mode toggles.
 */
export function BordersLayer({ map, data, layerGroup }: BordersLayerProps) {
    const layerRef = useRef<L.GeoJSON | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Create the layer
    useEffect(() => {
        const geoJsonLayer = L.geoJson(data, {
            pane: 'bordersPane',
            style: () => isDark ? STYLES.DarkBorderStyle : STYLES.BaseBorderStyle,
        });

        layerRef.current = geoJsonLayer;
        layerGroup.addLayer(geoJsonLayer);

        return () => {
            layerGroup.removeLayer(geoJsonLayer);
            layerRef.current = null;
        };
    }, [map, data, layerGroup]);

    // Restyle when theme changes (without recreating the layer)
    useEffect(() => {
        if (!layerRef.current) return;
        layerRef.current.setStyle(() => isDark ? STYLES.DarkBorderStyle : STYLES.BaseBorderStyle);
    }, [isDark]);

    return null;
}
