"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function Header() {
    const { theme, setTheme } = useTheme();

    return (
        <header className="bg-white dark:bg-[#111827] border-b border-gray-300 dark:border-[#374151]">
            <div className="flex items-center justify-between gap-[15px] md:gap-[20px] lg:gap-[30px] px-4 md:px-8 lg:px-[50px] py-[15px] lg:py-[20px]">
                {/* Logo */}
                <Link className="flex items-center gap-[12px] md:gap-[15px] lg:gap-[20px] flex-shrink-0" href="/">
                    <div className="hidden sm:block">
                        <h1 className="text-gray-900 dark:text-[#F3F4F6] text-[18px] md:text-[20px] lg:text-[24px] font-bold leading-tight">
                            Інвентаріум
                        </h1>
                        <p className="text-gray-700 dark:text-white text-[11px] md:text-[12px] lg:text-[13px] opacity-80 leading-tight mt-[2px]">Реєстр інвентарних описів</p>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav className="flex xl:hidden items-center gap-[12px] md:gap-[15px]">
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[13px] md:text-[14px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap" href="/">Головна</Link>
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[13px] md:text-[14px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap" href="/map">Карта</Link>
                    <Link className="hidden md:block text-gray-900 dark:text-[#F3F4F6] text-[14px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap" href="/add_inventory">Додати інвентар</Link>
                </nav>
                <nav className="hidden xl:flex items-center gap-[25px] flex-grow justify-center">
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[15px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors" href="/">Головна</Link>
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[15px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors" href="/map">Карта</Link>
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[15px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors" href="/add_inventory">Додати інвентар</Link>
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[15px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors" href="/stats">Мій внесок</Link>
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[15px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors" href="/help">Посібники</Link>
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[15px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors" href="/about">Про проєкт</Link>
                    <Link className="text-gray-900 dark:text-[#F3F4F6] text-[15px] font-medium hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors" href="/historical-map">Карта адмінустрою</Link>
                </nav>

                <div className="flex items-center gap-[10px] md:gap-[12px] lg:gap-[15px]">
                    {/* Theme Toggle */}
                    {theme === 'light' ?
                        <button
                            aria-label="Перемкнути тему"
                            className="hidden xl:block p-[8px] rounded-lg hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors"
                            onClick={() => setTheme('dark')}
                        >

                            <Moon className="w-5 h-5 text-gray-900 dark:text-[#F3F4F6] cursor-pointer" />
                        </button>
                        :
                        <button
                            aria-label="Перемкнути тему"
                            className="hidden xl:block p-[8px] rounded-lg hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors"
                            onClick={() => setTheme('light')}
                        >

                            <Sun className="w-5 h-5 text-gray-900 dark:text-[#F3F4F6] cursor-pointer" />
                        </button>
                    }

                    {/* Messages Link */}
                    <Link
                        className="xl:hidden relative p-[8px] rounded-lg hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors"
                        href="/messages"
                    >
                        <Bell className="w-5 h-5 text-gray-900 dark:text-[#F3F4F6]" aria-hidden="true" />
                    </Link>
                    <div className="hidden xl:flex items-center gap-[12px]">
                        <Link
                            className="relative p-[8px] rounded-lg hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors"
                            href="/messages"
                        >
                            <Bell className="lucide lucide-bell w-5 h-5 text-gray-900 dark:text-[#F3F4F6]" aria-hidden="true" />
                        </Link>
                        <span className="text-gray-900 dark:text-[#F3F4F6] text-[14px] font-medium max-w-[150px] truncate">
                            romankozak97.ua@gmail.com
                        </span>
                        <button className="px-[12px] h-[36px] rounded-lg border border-gray-300 dark:border-[#374151] bg-gray-100 dark:bg-[#1F2937] text-gray-900 dark:text-[#F3F4F6] text-[14px] font-medium hover:bg-gray-200 dark:hover:bg-[#374151] transition-colors">
                            Вийти
                        </button>
                    </div>
                    <button aria-label="Меню" className="xl:hidden p-[8px] rounded-lg hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors">
                        <Menu className="lucide lucide-menu w-6 h-6 text-gray-900 dark:text-[#F3F4F6]" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
    );
}