'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { STYLES, DIVISION_COLOR_MAP } from '../../utils/constants';
import type { AreaFeatureProperties } from '../../types';
import { useTheme } from 'next-themes';

interface RegionsLayerProps {
    map: L.Map;
    data: GeoJSON.FeatureCollection;
    layerGroup: L.LayerGroup;
    onHover: (props: AreaFeatureProperties) => void;
    onHoverEnd: () => void;
}

/**
 * Renderless component that manages region polygon layers on the map.
 * Applies color-coded fills by division, hover highlighting, and click-to-zoom.
 * Reactively updates stroke/fill styles when dark mode toggles.
 */
export function RegionsLayer({ map, data, layerGroup, onHover, onHoverEnd }: RegionsLayerProps) {
    const layerRef = useRef<L.GeoJSON | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const isDarkRef = useRef(isDark);
    isDarkRef.current = isDark;

    useEffect(() => {
        let highlightedLayer: L.Path | null = null;

        const geoJsonLayer = L.geoJson(data, {
            pane: 'regionsPane',
            style: (feature) => {
                const base = (isDarkRef.current ? STYLES.DarkFeatureStyle : STYLES.BaseFeatureStyle);
                const fill = DIVISION_COLOR_MAP[feature?.properties?.higherDivision];
                return {
                    ...base,
                    ...(typeof fill === 'string' ? { fillColor: fill } : { fillPattern: fill }),
                } as any;
            },
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: (e) => {
                        const target = e.target as L.Path;
                        // Reset the previously highlighted layer first
                        if (highlightedLayer && highlightedLayer !== target) {
                            geoJsonLayer.resetStyle(highlightedLayer);
                        }
                        highlightedLayer = target;
                        target.setStyle(isDarkRef.current ? STYLES.DarkHoverFeatureStyle : STYLES.HoverFeatureStyle);
                        target.bringToFront();
                        onHover(feature.properties as AreaFeatureProperties);
                    },
                    mouseout: (e) => {
                        const target = e.target as L.Path;
                        geoJsonLayer.resetStyle(target);
                        if (highlightedLayer === target) {
                            highlightedLayer = null;
                        }
                        onHoverEnd();
                    },
                    click: (e) => {
                        const target = e.target as L.Polygon;
                        map.fitBounds(target.getBounds());
                    },
                });
            },
        });

        layerRef.current = geoJsonLayer;
        layerGroup.addLayer(geoJsonLayer);

        return () => {
            layerGroup.removeLayer(geoJsonLayer);
            layerRef.current = null;
        };
    }, [map, data, layerGroup, onHover, onHoverEnd]);

    // Restyle when theme changes (without recreating the layer)
    useEffect(() => {
        if (!layerRef.current) return;
        layerRef.current.setStyle((feature) => {
            const base = (isDark ? STYLES.DarkFeatureStyle : STYLES.BaseFeatureStyle);
            const fill = DIVISION_COLOR_MAP[feature?.properties?.higherDivision];
            return {
                ...base,
                ...(typeof fill === 'string' ? { fillColor: fill } : { fillPattern: fill }),
            } as any;
        });
    }, [isDark]);

    return null;
}
