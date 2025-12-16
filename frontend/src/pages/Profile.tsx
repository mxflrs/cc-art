import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Text } from '../components/Text';

export const Profile: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const updatedUser = await authService.updateProfile({
                firstName,
                lastName,
                email
            });
            updateUser(updatedUser);
            setMessage('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile', error);
            setMessage('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', paddingTop: '80px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button variant="secondary" onClick={() => navigate('/')} style={{ width: 'auto' }}>Back to Dashboard</Button>
                <Text variant="h1">Profile Settings</Text>
            </div>

            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        color: '#666'
                    }}>
                        {firstName?.[0] || email?.[0]?.toUpperCase() || <span className="material-icons" style={{ fontSize: '40px' }}>person</span>}
                    </div>
                    <div>
                        <Text variant="h3">{firstName} {lastName}</Text>
                        <Text variant="body" color="#666">{email}</Text>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <Input
                            label="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <Input
                            label="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {message && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: message.includes('success') ? '#e8f5e9' : '#ffebee',
                            color: message.includes('success') ? '#2e7d32' : '#c62828'
                        }}>
                            {message}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" isLoading={isLoading} style={{ width: 'auto' }}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
