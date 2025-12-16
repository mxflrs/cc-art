import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import logo from '../assets/logo.svg';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={logo} alt="Logo" style={{ height: '32px', marginRight: '8px' }} /> <span>ACC - Toolkit</span>
            </div>

            <div className="navbar-actions">
                <div className="navbar-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                    <div className="navbar-avatar">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || <span className="material-icons" style={{ fontSize: '20px' }}>person</span>}
                    </div>
                    <div className="navbar-user-info">
                        <div className="navbar-user-name">
                            {user?.firstName || 'User'}
                        </div>
                        <div className="navbar-user-email">
                            {user?.email || ''}
                        </div>
                    </div>
                </div>

                <Button
                    variant="text"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>
        </nav>
    );
};
