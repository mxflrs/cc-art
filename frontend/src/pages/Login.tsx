import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { Text } from '../components/Text';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Breadcrumbs } from '../components/CardSystem/Breadcrumbs';
import styles from './Login.module.scss';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                email,
                password,
            });

            const token = response.data.access_token;

            // Fetch profile
            const profileResponse = await axios.get('http://localhost:3000/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            login(token, profileResponse.data);
            navigate('/');
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Breadcrumb items for login page (showing the app structure)
    const breadcrumbs = [
        { label: 'ACC Art Planner', onClick: () => {} },
        { label: 'Login', onClick: () => {} }
    ];

    return (
        <div className={styles.container}>
            <Breadcrumbs items={breadcrumbs} />
            
            <div className={styles.content}>
                <div className={styles.cardContainer}>
                    <div className={styles.cardHeader}>
                        <Text variant="h1" align="center" style={{ marginBottom: '0.5rem' }}>Welcome back</Text>
                        <Text variant="body" align="center" color="var(--text-color-secondary)">Sign in to your account</Text>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        {error && (
                            <div className={styles.errorBox}>
                                <Text variant="caption" color="var(--error-color)">{error}</Text>
                            </div>
                        )}

                        <div className={styles.buttonContainer}>
                            <div className={styles.fullWidthButton}>
                                <Button type="submit" isLoading={isLoading}>
                                    Sign in
                                </Button>
                            </div>
                        </div>
                    </form>

                    <div className={styles.footer}>
                        <Text variant="caption" align="center" color="var(--text-color-secondary)">
                            Don't have an account? <Link to="/register" className={styles.link}>Create account</Link>
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};
