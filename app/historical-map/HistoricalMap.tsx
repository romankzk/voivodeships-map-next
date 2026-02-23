'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useMap, applyLabelOpacity } from './hooks/useMap';
import { usePeriodData } from './hooks/usePeriodData';
import { useApplyOverrides } from './hooks/useOverrides';
import { MapProvider } from './context/MapContext';
import { TIME_PERIODS } from './utils/constants';
import type { AreaFeatureProperties, MapContextValue } from './types';

import { RegionsLayer } from './components/layers/RegionsLayer';
import { BordersLayer } from './components/layers/BordersLayer';
import { CitiesLayer } from './components/layers/CitiesLayer';

import { InfoControl } from './components/controls/InfoControl';
import { TitleControl } from './components/controls/TitleControl';
import { TimelineControl } from './components/controls/TimelineControl';
import { SearchControl } from './components/controls/SearchControl';
import { EditButtonControl } from './components/controls/EditButtonControl';

const filterPrimary = (f: GeoJSON.Feature) => f.properties!.adminLevel !== 3;
const filterSecondary = (f: GeoJSON.Feature) => f.properties!.adminLevel === 3;

export default function HistoricalMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    const [currentPeriod, setCurrentPeriod] = useState(TIME_PERIODS.PERIOD_1640.id);
    const { data, isLoading } = usePeriodData(currentPeriod);

    const [hoveredRegion, setHoveredRegion] = useState<AreaFeatureProperties | null>(null);

    const [searchLayer] = useState(() => L.layerGroup());
    const [dataGroup] = useState(() => L.layerGroup());

    // Apply in-memory overrides to each layer's data
    const applyAreasOverrides = useApplyOverrides(currentPeriod, 'areas');
    const applyBordersOverrides = useApplyOverrides(currentPeriod, 'borders');
    const applyPointsOverrides = useApplyOverrides(currentPeriod, 'points');

    const effectiveData = useMemo(() => {
        if (!data) return null;
        return {
            areas: applyAreasOverrides(data.areas),
            borders: applyBordersOverrides(data.borders),
            points: applyPointsOverrides(data.points),
        };
    }, [data, applyAreasOverrides, applyBordersOverrides, applyPointsOverrides]);

    // Add layer groups to map once
    useEffect(() => {
        if (!map) return;
        dataGroup.addTo(map);
        searchLayer.addTo(map);

        return () => {
            dataGroup.remove();
            searchLayer.remove();
        };
    }, [map, dataGroup, searchLayer]);

    // Apply zoom-based opacity when data changes (e.g., period switch)
    useEffect(() => {
        if (!map || !effectiveData) return;

        // Small delay to ensure labels are rendered before applying opacity
        const timer = setTimeout(() => {
            applyLabelOpacity(map.getZoom());
        }, 100);

        return () => clearTimeout(timer);
    }, [map, effectiveData]);

    const handleHover = useCallback((props: AreaFeatureProperties) => {
        setHoveredRegion(props);
    }, []);

    const handleHoverEnd = useCallback(() => {
        setHoveredRegion(null);
    }, []);

    const contextValue = useMemo<MapContextValue>(() => ({
        map,
        currentPeriod,
        setCurrentPeriod,
        isLoading,
        hoveredRegion,
        setHoveredRegion,
        searchLayer,
    }), [map, currentPeriod, isLoading, hoveredRegion, searchLayer]);

    return (
        <MapProvider value={contextValue}>
            <div id="historical-map" ref={mapContainerRef} />
            {map && effectiveData && (
                <>
                    <RegionsLayer
                        map={map}
                        data={effectiveData.areas}
                        layerGroup={dataGroup}
                        onHover={handleHover}
                        onHoverEnd={handleHoverEnd}
                    />
                    <BordersLayer
                        map={map}
                        data={effectiveData.borders}
                        layerGroup={dataGroup}
                    />
                    <CitiesLayer
                        map={map}
                        data={effectiveData.points}
                        layerGroup={dataGroup}
                        filterFn={filterPrimary}
                    />
                    <CitiesLayer
                        map={map}
                        data={effectiveData.points}
                        layerGroup={dataGroup}
                        filterFn={filterSecondary}
                    />
                </>
            )}
   
            <TitleControl />
            <InfoControl />  
            <TimelineControl /> 
            <SearchControl />
            <EditButtonControl />
        </MapProvider>
    );
}