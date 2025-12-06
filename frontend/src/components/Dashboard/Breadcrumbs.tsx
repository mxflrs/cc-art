import React from 'react';

interface BreadcrumbItem {
    label: string;
    onClick: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <div className="breadcrumbs">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <React.Fragment key={index}>
                        <div className="breadcrumbs-item">
                            <span
                                onClick={!isLast ? item.onClick : undefined}
                                className={isLast ? 'breadcrumbs-link--active' : 'breadcrumbs-link'}
                            >
                                {item.label}
                            </span>
                            {!isLast && <span className="breadcrumbs-separator">/</span>}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
