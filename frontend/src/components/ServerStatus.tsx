import React, { useState, useEffect } from 'react';

export const ServerStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/`); // Root endpoint for health check
                if (response.ok) {
                    setIsOnline(true);
                } else {
                    setIsOnline(false);
                }
            } catch (error) {
                setIsOnline(false);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    if (isOnline === null) return null; // Loading state (invisible)

    return (
        <div
            title={isOnline ? "Server Online" : "Server Offline"}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: isOnline ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                border: `1px solid ${isOnline ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                marginRight: '12px',
                fontSize: '12px',
                color: isOnline ? '#4caf50' : '#f44336',
                transition: 'all 0.3s ease'
            }}
        >
            <div
                style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#4caf50' : '#f44336',
                    marginRight: '6px',
                    boxShadow: isOnline ? '0 0 4px #4caf50' : 'none'
                }}
            />
            {isOnline ? 'Online' : 'Offline'}
        </div>
    );
};
