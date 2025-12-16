import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const authService = {
    async updateProfile(data: { firstName?: string; lastName?: string; email?: string }) {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/users/profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
