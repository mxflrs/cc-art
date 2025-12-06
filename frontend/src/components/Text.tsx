import React from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';
type TextWeight = 'regular' | 'medium' | 'bold';
type TextAlign = 'left' | 'center' | 'right';

interface TextProps {
    children: React.ReactNode;
    variant?: TextVariant;
    weight?: TextWeight;
    align?: TextAlign;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
    as?: any;
}

export const Text: React.FC<TextProps> = ({
    children,
    variant = 'body',
    weight = 'regular',
    align = 'left',
    color,
    className = '',
    style,
    as,
}) => {
    const Component = as || (variant.startsWith('h') ? variant : 'p');

    return (
        <Component
            className={`text text--${variant} text--${weight} text--${align} ${className}`}
            style={{ color, ...style }}
        >
            {children}
        </Component>
    );
};
