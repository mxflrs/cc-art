import axios from 'axios';
import type { Topic, Style, Place, Item } from '../types/card';

const API_URL = 'http://localhost:3000/card';

export const cardService = {
  // Topic
  createTopic: async (name: string) => {
    const response = await axios.post<Topic>(`${API_URL}/topic`, { name });
    return response.data;
  },
  getTopics: async () => {
    const response = await axios.get<Topic[]>(`${API_URL}/topics`);
    return response.data;
  },
  deleteTopic: async (id: number) => {
    await axios.delete(`${API_URL}/topic/${id}`);
  },

  // Style
  createStyle: async (name: string, topicId: number) => {
    const response = await axios.post<Style>(`${API_URL}/style`, { name, topicId });
    return response.data;
  },

  // Place
  createPlace: async (name: string, styleId: number) => {
    const response = await axios.post<Place>(`${API_URL}/place`, { name, styleId });
    return response.data;
  },

  // Item
  createItem: async (formData: FormData) => {
    const response = await axios.post<Item>(`${API_URL}/item`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteItem: async (id: number) => {
      await axios.delete(`${API_URL}/item/${id}`);
  }
};
