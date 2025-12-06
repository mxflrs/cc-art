import React from 'react';

interface GridProps {
    children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({ children }) => {
    return (
        <div className="grid-layout">
            {children}
        </div>
    );
};
