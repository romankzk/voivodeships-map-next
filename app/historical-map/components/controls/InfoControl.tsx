'use client';

import { createPortal } from 'react-dom';
import { useLeafletControl } from '../../hooks/useLeafletControl';
import { useMapContext } from '../../context/MapContext';
import { FLAG_ICONS } from '../../utils/constants';

/**
 * Displays detailed information about a hovered map region.
 * Shows region name, division, country with flag, original/Latin names,
 * administrative center, years, and notes.
 * On mobile, renders as a compact bottom sheet.
 */
export function InfoControl() {
    const { map, hoveredRegion } = useMapContext();
    const container = useLeafletControl(map, 'bottomleft');

    if (!container) return null;

    return createPortal(
        hoveredRegion ? <RegionInfo props={hoveredRegion} /> : <DefaultHint />,
        container
    );
}

function DefaultHint() {
    const isTouchDevice = 'ontouchstart' in window;
    const hint = isTouchDevice
        ? 'Натисніть на область на карті, щоб переглянути детальну інформацію'
        : 'Наведіть курсор на область на карті, щоб переглянути детальну інформацію';

    return <div className="p-3 sm:p-4 text-slate-500 dark:text-slate-600 md:text-sm text-xs sm:text-base">{hint}</div>;
}

function RegionInfo({ props }: { props: NonNullable<ReturnType<typeof useMapContext>['hoveredRegion']> }) {
    const countryInfo = FLAG_ICONS.find(i => i.name === props.country);
    const showDivision = props.higherDivision !== props.name && props.higherDivision !== props.country;

    return (
        <div className="p-3 sm:p-4 max-w-[100vw] sm:max-w-none">
            <h2 className="m-0 text-lg sm:text-xl text-slate-900 dark:text-slate-200 font-bold">{props.name}</h2>
            <h3 className="font-normal text-xs sm:text-sm mt-0.5 sm:mt-1 mb-1.5 sm:mb-2 text-slate-600 dark:text-slate-400">{showDivision ? props.higherDivision : ''}</h3>
            {countryInfo && (
                <h4 className="font-normal mt-0.5 sm:mt-1 mb-1.5 sm:mb-2 text-slate-600 dark:text-slate-400 flex items-center gap-2 text-sm">
                    <img
                        src={countryInfo.iconUrl}
                        className="h-2.5 object-contain shrink-0 [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] align-middle"
                        alt={countryInfo.name}
                        loading="lazy"
                    />
                    {props.country}
                </h4>
            )}
            {!countryInfo && props.country && <h4 className="font-normal mt-0.5 sm:mt-1 mb-1.5 sm:mb-2 text-slate-600 dark:text-slate-400 flex items-center gap-2 text-sm">{props.country}</h4>}
            <dl className="grid grid-cols-[fit-content(200px)_1fr] gap-x-2 gap-y-0.5 sm:gap-y-1 mt-1.5 sm:mt-2 content-start text-sm">
                {props.nameOriginal && countryInfo && <InfoRow label={`Назва ${countryInfo.lang}`} value={props.nameOriginal} />}
                {props.nameLatin && <InfoRow label="Назва латиною" value={props.nameLatin} />}
                {props.center && <InfoRow label="Центр" value={props.center} />}
                {props.years && <InfoRow label="Роки існування" value={props.years} />}
                {props.description && <InfoRow label="Додатково" value={props.description} />}
            </dl>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <>
            <dt className="p-0.5 sm:p-1 ms-0 text-slate-900 dark:text-slate-200 font-semibold">{label}:</dt>
            <dd className="p-0.5 sm:p-1 ms-0 text-slate-800 dark:text-slate-400">{value}</dd>
        </>
    );
}
