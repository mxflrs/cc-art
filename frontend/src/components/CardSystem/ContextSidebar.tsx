import React from 'react';
import { Card } from './Card';
import type { Topic, Style, Place } from '../../types/card';

interface ContextSidebarProps {
    currentTopic: Topic | null;
    currentStyle: Style | null;
    currentPlace: Place | null;
    onNavigate: (level: 'TOPIC' | 'STYLE' | 'PLACE') => void;
    onCreateTopic: () => void;
}

export const ContextSidebar: React.FC<ContextSidebarProps> = ({
    currentTopic,
    currentStyle,
    currentPlace,
    onNavigate,
    onCreateTopic
}) => {
    return (
        <div className="context-sidebar">
            <div className="context-sidebar-stack">
                {/* Topic Level */}
                <div className={`context-sidebar-stack-item ${!currentTopic ? 'active' : ''}`}>
                    <div className="context-sidebar-label">Topic</div>
                    {currentTopic ? (
                        <Card
                            title={currentTopic.name}
                            alias={currentTopic.alias}
                            subtitle="Selected Topic"
                            className="context-sidebar-card"
                        />
                    ) : (
                        <div className="context-sidebar-placeholder" onClick={onCreateTopic}>
                            + Create Topic
                        </div>
                    )}
                </div>

                {/* Style Level */}
                {currentTopic && (
                    <div className={`context-sidebar-stack-item ${!currentStyle ? 'active' : ''}`} onClick={() => onNavigate('STYLE')}>
                        <div className="context-sidebar-line"></div>
                        <div className="context-sidebar-label">Style</div>
                        {currentStyle ? (
                            <Card
                                title={currentStyle.name}
                                alias={currentStyle.alias}
                                subtitle="Selected Style"
                                className="context-sidebar-card"
                            />
                        ) : (
                            <div className="context-sidebar-placeholder">Select a Style</div>
                        )}
                    </div>
                )}

                {/* Place Level */}
                {currentStyle && (
                    <div className={`context-sidebar-stack-item ${!currentPlace ? 'active' : ''}`} onClick={() => onNavigate('PLACE')}>
                        <div className="context-sidebar-line"></div>
                        <div className="context-sidebar-label">Place</div>
                        {currentPlace ? (
                            <Card
                                title={currentPlace.name}
                                alias={currentPlace.alias}
                                subtitle="Selected Place"
                                className="context-sidebar-card"
                            />
                        ) : (
                            <div className="context-sidebar-placeholder">Select a Place</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
