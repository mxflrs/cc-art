import React from 'react';
import { Button } from '../Button';

interface CardProps {
    title: string;
    alias: string;
    subtitle?: string;
    onClick?: () => void;
    onDelete?: (e: React.MouseEvent) => void;
    onEdit?: (e: React.MouseEvent) => void;
    image?: string;
    footer?: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, alias, subtitle, onClick, onDelete, onEdit, image, footer, className }) => {
    return (
        <div
            className={`card ${onClick ? 'card--clickable' : ''} ${className || ''}`}
            onClick={onClick}
        >
            <div className="card-delete-btn-wrapper" style={{ display: 'flex', gap: '4px' }}>
                {onEdit && (
                    <Button
                        variant="icon"
                        onClick={onEdit}
                    >
                        ✎
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="icon"
                        onClick={onDelete}
                    >
                        &times;
                    </Button>
                )}
            </div>

            <div className="card-header">
                <div className="card-alias">
                    {alias}
                </div>
                <div>
                    <h3 className="card-title">{title}</h3>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            </div>

            {image && (
                <div className="card-image-container">
                    <img src={image} alt={title} />
                </div>
            )}

            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
};
