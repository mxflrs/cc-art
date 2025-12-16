import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import styles from './Auth.module.scss';

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

    const register = useAuthStore((state) => state.register);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register(formData.email, formData.password, formData.firstName, formData.lastName);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.title}>Create account</div>
                    <div className={styles.subtitle}>Start your journey with us today</div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
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
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                        Create account
                    </Button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};
