import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
    return (
        <div className="input-wrapper">
            {label && <label className="input-label">{label}</label>}
            <input className={`input-field ${error ? 'input-field--error' : ''}`} {...props} />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};
