import SidebarContent from "./sidebar";
import React, { ReactNode } from "react";
import { useState } from "react";
import { cn } from '@/lib/utils';

type LayoutProps = {
    children: ReactNode;
};

export default function LayoutTeacher({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false); // Assuming you have a dark mode state

    return (
        <div className={cn("min-h-screen bg-background", isDarkMode ? 'dark' : '')}>
            {/* Navbar with high z-index */}
            <Navbar className="fixed top-0 left-0 right-0 z-50" /> {/* Ensure Navbar is on top */}

            <div className="flex pt-16"> {/* Add padding-top to push content below Navbar */}
                {/* Sidebar */}
                <aside className={cn(
                    "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform",
                    !isSidebarOpen && "-translate-x-full",
                    "hidden md:block"
                )}>
                    <SidebarContent />
                </aside>

                {/* Main Content */}
                <main className={cn(
                    "flex-1 p-6 transition-all",
                    isSidebarOpen ? "md:ml-64" : "",
                )}>
                    <div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}