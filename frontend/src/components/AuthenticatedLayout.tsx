import React from 'react';
import { Navbar } from './Navbar';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    );
};
