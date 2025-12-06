import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Text } from '../components/Text';

export const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:3000/auth/register', formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <Text variant="h1" align="center" style={{ marginBottom: '0.5rem' }}>Create account</Text>
                <Text variant="body" align="center" color="var(--text-secondary)">Start your journey with us today</Text>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                    />
                </div>

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                />

                {error && (
                    <div style={{
                        color: 'var(--error-color)',
                        backgroundColor: 'rgba(242, 184, 181, 0.1)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <Text variant="caption" color="var(--error-color)">{error}</Text>
                    </div>
                )}

                <div style={{ marginTop: '0.5rem' }}>
                    <Button type="submit" isLoading={isLoading}>
                        Create account
                    </Button>
                </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Text variant="caption" align="center" color="var(--text-secondary)">
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Sign in</Link>
                </Text>
            </div>
        </div>
    );
};
