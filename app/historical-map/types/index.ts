import type L from 'leaflet';

/** GeoJSON feature properties for region/area polygons. */
export interface AreaFeatureProperties {
    name: string;
    nameOriginal?: string;
    nameLatin?: string;
    higherDivision: string;
    country: string;
    center?: string;
    years?: string;
    description?: string;
}

/** GeoJSON feature properties for city point markers. */
export interface PointFeatureProperties {
    name: string;
    adminLevel: number;
}

/** Configuration for a historical time period. */
export interface TimePeriodConfig {
    id: string;
    label: string;
    areasFile: string;
    bordersFile: string;
    pointsFile: string;
}

/** Academic source reference. */
export interface Source {
    title: string;
    link: string;
}

/** Country flag/coat-of-arms icon with language label. */
export interface FlagIcon {
    name: string;
    lang: string;
    iconUrl: string;
}

/** Search result feature from OSM Nominatim. */
export interface SearchResultFeature {
    properties: {
        name: string;
        higherDivision: string;
        isOSM: boolean;
    };
    geometry: {
        coordinates: [number, number];
    };
}

/** GeoJSON data loaded for a time period. */
export interface PeriodData {
    areas: GeoJSON.FeatureCollection;
    borders: GeoJSON.FeatureCollection;
    points: GeoJSON.FeatureCollection;
}

/** Shared map state provided via React context. */
export interface MapContextValue {
    map: L.Map | null;
    currentPeriod: string;
    setCurrentPeriod: (id: string) => void;
    isLoading: boolean;
    hoveredRegion: AreaFeatureProperties | null;
    setHoveredRegion: (props: AreaFeatureProperties | null) => void;
    searchLayer: L.LayerGroup | null;
}
