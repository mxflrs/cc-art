import React, { useState } from 'react';

interface SplitLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({ sidebar, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="split-layout">
            <div className={`split-layout-sidebar-wrapper ${!sidebarOpen ? 'hidden' : ''}`}>
                {sidebar}
            </div>
            <div className="split-layout-main">
                {children}
            </div>
            <button
                className={`split-layout-toggle-btn ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
                {sidebarOpen ? '‹' : '›'}
            </button>
        </div>
    );
};
