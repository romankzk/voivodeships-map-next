'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { STYLES } from '../../utils/constants';

interface CitiesLayerProps {
    map: L.Map;
    data: GeoJSON.FeatureCollection;
    layerGroup: L.LayerGroup;
    filterFn: (feature: GeoJSON.Feature) => boolean;
}

/**
 * Renderless component that manages city circle marker layers on the map.
 * Marker size and label class vary by admin level.
 * Level 2/3 labels are hidden initially and revealed by zoom.
 */
export function CitiesLayer({ map, data, layerGroup, filterFn }: CitiesLayerProps) {
    useEffect(() => {
        const geoJsonLayer = L.geoJson(data, {
            pane: 'citiesPane',
            filter: filterFn,
            pointToLayer: (feature, coords) => {
                const adminLevel = feature.properties!.adminLevel as number;
                let labelClass = '';
                let radius: number;
                let fillColor: string;

                if (adminLevel === 1) {
                    labelClass = 'level1-city-label';
                    radius = 8;
                    fillColor = STYLES.MarkerFillColors.LEVEL1;
                } else if (adminLevel === 2) {
                    labelClass = 'level2-city-label';
                    radius = 4;
                    fillColor = STYLES.MarkerFillColors.LEVEL2;
                } else {
                    labelClass = 'level3-city-label';
                    radius = 3;
                    fillColor = STYLES.MarkerFillColors.LEVEL3;
                }

                return L.circleMarker(coords, {
                    ...STYLES.BaseMarkerStyle,
                    radius,
                    fillColor,
                    pane: 'citiesPane',
                }).bindTooltip(feature.properties!.name as string, {
                    permanent: true,
                    className: labelClass,
                });
            },
        });

        layerGroup.addLayer(geoJsonLayer);

        // Hide level 2/3 labels initially (zoom handler in useMap will show them)
        document.querySelectorAll<HTMLElement>('.level2-city-label').forEach(el => {
            el.style.opacity = '0';
        });
        document.querySelectorAll<HTMLElement>('.level3-city-label').forEach(el => {
            el.style.opacity = '0';
        });

        return () => {
            layerGroup.removeLayer(geoJsonLayer);
        };
    }, [map, data, layerGroup, filterFn]);

    return null;
}
