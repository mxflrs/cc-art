import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'text' | 'icon' | 'outlined';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading,
    className,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} ${className || ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? '...' : children}
        </button>
    );
};
