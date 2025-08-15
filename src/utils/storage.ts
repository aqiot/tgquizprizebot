import { QuizState } from '../types';

const STORAGE_KEY = 'quiz_progress';

export const saveQuizProgress = (quizId: string, state: QuizState) => {
  try {
    const data = {
      quizId,
      state,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save quiz progress:', e);
  }
};

export const loadQuizProgress = (quizId: string): QuizState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Check if it's the same quiz and not expired (24 hours)
    if (data.quizId === quizId && 
        Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
      return data.state;
    }
    
    // Clear expired data
    clearQuizProgress();
    return null;
  } catch (e) {
    console.error('Failed to load quiz progress:', e);
    return null;
  }
};

export const clearQuizProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear quiz progress:', e);
  }
};