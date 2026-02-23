'use client';

import { createPortal } from 'react-dom';
import { useLeafletControl } from '../../hooks/useLeafletControl';
import { useMapContext } from '../../context/MapContext';
import { useOverrideCount } from '../../hooks/useOverrides';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

/**
 * A small map control button that navigates to the editor page.
 * Shows a badge when there are active overrides.
 */
export function EditButtonControl() {
    const { map, currentPeriod } = useMapContext();
    const container = useLeafletControl(map, 'topright');
    const overrideCount = useOverrideCount();

    if (!container) return null;

    return createPortal(
        <Link
            className="flex items-center text-sm gap-2 p-2 sm:p-3 border-none rounded-lg bg-white !text-slate-900 cursor-pointer shadow-lg transition-colors duration-200 hover:bg-slate-900 hover:!text-white dark:!text-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
            href={`/historical-map/editor?period=${currentPeriod}&layer=areas`}
            title="Редагувати метадані"
        >
            <Pencil size={16} />
            <span className="hidden sm:inline">Редагувати</span>
            {overrideCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-px rounded-full min-w-4 text-center">{overrideCount}</span>
            )}
        </Link>,
        container,
    );
}
