'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';

/**
 * Creates a Leaflet control at the given position and returns its container element.
 * Use with `createPortal` to render React content inside the Leaflet control.
 */
export function useLeafletControl(
    map: L.Map | null,
    position: L.ControlPosition,
    className?: string
): HTMLDivElement | null {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!map) return;

        let controlContainer: HTMLDivElement;

        const ControlClass = L.Control.extend({
            onAdd() {
                controlContainer = L.DomUtil.create('div', className ?? '') as HTMLDivElement;
                L.DomUtil.addClass(controlContainer, 'base-control');
                L.DomEvent.disableClickPropagation(controlContainer);
                setContainer(controlContainer);
                return controlContainer;
            },
            onRemove() {
                setContainer(null);
            }
        });

        const control = new ControlClass({ position });
        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [map, position, className]);

    return container;
}
