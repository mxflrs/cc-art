import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import styles from './Auth.module.scss';

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
            await login(email, password);
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

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.title}>Welcome back</div>
                    <div className={styles.subtitle}>Sign in to your account</div>
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
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        Sign in
                    </Button>
                </form>

                <div className={styles.footer}>
                    Don't have an account? <Link to="/register" className={styles.link}>Create account</Link>
                </div>
            </div>
        </div>
    );
};
