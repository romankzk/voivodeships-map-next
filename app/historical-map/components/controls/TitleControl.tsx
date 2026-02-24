'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLeafletControl } from '../../hooks/useLeafletControl';
import { useMapContext } from '../../context/MapContext';
import { SOURCES } from '../../utils/constants';
import { BookOpenText, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, MapPinned } from 'lucide-react';

/**
 * Displays the map title, disclaimer, legend, and a collapsible list of academic sources.
 * On mobile the body is collapsed by default behind a toggle.
 */
export function TitleControl() {
    const { map } = useMapContext();
    const container = useLeafletControl(map, 'topleft');
    const [sourcesHidden, setSourcesHidden] = useState(true);
    const [bodyExpanded, setBodyExpanded] = useState(
        () => window.innerWidth >= 640
    );

    if (!container) return null;

    return createPortal(
        <div className="p-2.5 sm:p-4 max-w-[48vw] sm:max-w-[500px]">
            {/* Heading — tappable on mobile to expand/collapse */}
            <button
                className="flex flex-row items-center gap-2 w-full bg-transparent border-none cursor-pointer p-0 sm:cursor-default"
                onClick={() => setBodyExpanded(!bodyExpanded)}
            >
                <h1 className="text-base sm:text-2xl font-bold m-0 text-slate-900 dark:text-slate-200 text-left leading-tight">
                    Українські землі у XVII-XVIII ст.
                </h1>
                <span className="sm:hidden text-slate-400 shrink-0 ml-auto">
                    {bodyExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
            </button>

            {/* Content — collapsed on mobile by default */}
            {bodyExpanded && (
                <div className="text-slate-700 dark:text-slate-400 mt-2">
                    <p className="mt-1 mb-2 break-words text-xs sm:text-sm">
                        Дана карта є лише реконструкцією на основі аналізу доступних джерел.
                        Якщо помітили помилку або маєте що додати, <a href="mailto:roman.k@inventarium.org.ua" className="!text-blue-600 hover:!text-blue-400 transition-colors">повідомте про це автора.</a>
                    </p>
                    <h2 className="flex flex-row items-center gap-1.5 text-sm sm:text-base text-slate-900 dark:text-slate-200 font-bold mt-2 mb-2">
                        <MapPinned size={16}/>
                        Умовні позначення
                    </h2>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-full border border-black bg-orange-600 w-[1em] h-[1em]"></span>
                        <span>Центри воєводств, комітатів, цинутів</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-full border border-black bg-orange-600 w-[0.75em] h-[0.75em]"></span>
                        <span>Центри повітів, полків</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-full border border-black bg-orange-300 w-[0.5em] h-[0.5em]"></span>
                        <span>Центри староств</span>
                    </div>
                    <h2 className="flex flex-row items-center gap-1.5 text-sm sm:text-base text-slate-900 dark:text-slate-200 font-bold mt-2 mb-2">
                        <BookOpenText size={16}/>
                        Джерела
                    </h2>
                    <a
                        href="#"
                        className="flex flex-row items-center gap-1 w-fit !text-slate-900 bg-slate-50 px-2 py-1 hover:bg-slate-200 rounded-md transition-colors dark:!text-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            setSourcesHidden(!sourcesHidden);
                        }}
                    >
                        {sourcesHidden ?
                        <><span>показати список</span> <ChevronsDown size={14}/></>
                        :
                        <><span>приховати</span> <ChevronsUp size={14}/></>}
                    </a>
                    <ol className={`mt-3 list-decimal text-xs ${sourcesHidden ? 'hidden' : ''}`} id="sources">
                        {SOURCES.map((source, i) => (
                            <li key={i} className="ml-4 my-1 min-w-0">
                                <a target="_blank" rel="noopener noreferrer" href={source.link} className="!text-slate-700 dark:!text-slate-400 hover:!text-blue-600 transition-colors">
                                    {source.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>,
        container
    );
}
