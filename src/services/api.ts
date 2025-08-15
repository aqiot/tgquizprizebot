import axios from 'axios';
import { Quiz, QuizResult, Campaign } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const quizAPI = {
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get<Quiz[]>('/api/quizzes');
    return response.data;
  },

  getQuiz: async (id: string): Promise<Quiz> => {
    const response = await api.get<Quiz>(`/api/quizzes/${id}`);
    return response.data;
  },

  submitResult: async (result: QuizResult): Promise<void> => {
    await api.post('/api/result', result);
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get<Campaign[]>('/api/campaigns');
    return response.data;
  },

  getCampaignLink: async (campaignId: string): Promise<{ url: string }> => {
    const response = await api.get<{ url: string }>('/api/campaign-link', {
      params: { campaign_id: campaignId }
    });
    return response.data;
  }
};