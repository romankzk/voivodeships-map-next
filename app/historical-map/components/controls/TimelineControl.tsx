import { createPortal } from 'react-dom';
import { useLeafletControl } from '../../hooks/useLeafletControl';
import { useMapContext } from '../../context/MapContext';
import { TIME_PERIODS } from '../../utils/constants';

/**
 * Provides buttons for switching between historical time periods.
 * Disables buttons during data loading.
 */
export function TimelineControl() {
    const { map, currentPeriod, setCurrentPeriod, isLoading } = useMapContext();
    const container = useLeafletControl(map, 'topright', 'timeline-control');

    if (!container) return null;

    return createPortal(
        <div className="flex gap-1 p-1 text-xs sm:text-sm bg-white dark:bg-slate-900 rounded-lg shadow-lg">
            {Object.values(TIME_PERIODS).map(period => (
                <button
                    key={period.id}
                    className={`px-2 py-1.5 sm:px-3 sm:py-2 border-none cursor-pointer rounded transition-all duration-200
                        ${period.id === currentPeriod
                            ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
                            : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isLoading}
                    onClick={() => setCurrentPeriod(period.id)}
                >
                    {period.label}
                </button>
            ))}
        </div>,
        container
    );
}
