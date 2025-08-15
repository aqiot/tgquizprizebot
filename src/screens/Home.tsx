import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Quiz } from '../types';
import { quizAPI } from '../services/api';
import { QuizCardSkeleton } from '../components/Skeleton';
import { hapticFeedback } from '../utils/telegram';
import './Home.css';

interface HomeProps {
  onStartQuiz: (quiz: Quiz) => void;
}

const Home: React.FC<HomeProps> = ({ onStartQuiz }) => {
  const { t, language } = useLanguage();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizAPI.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError(t.home.error);
      hapticFeedback.notification('error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    hapticFeedback.impact('light');
    onStartQuiz(quiz);
  };

  if (isOffline) {
    return (
      <div className="home-container">
        <div className="error-state">
          <span className="error-icon">📡</span>
          <p>{t.common.offline}</p>
          <button className="retry-button" onClick={fetchQuizzes}>
            {t.common.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">{t.home.title}</h1>
        <p className="home-subtitle">{t.home.subtitle}</p>
      </div>

      <div className="quiz-list">
        {loading ? (
          <>
            <QuizCardSkeleton />
            <QuizCardSkeleton />
            <QuizCardSkeleton />
          </>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchQuizzes}>
              {t.common.retry}
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <p>{t.home.noQuizzes}</p>
          </div>
        ) : (
          quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.quizID}
              className="quiz-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="quiz-title">
                {language === 'ru' ? quiz.quizNameRU : quiz.quizName}
              </h3>
              <p className="quiz-info">
                {quiz.questions.length} {language === 'ru' ? 'вопросов' : 'questions'}
              </p>
              <button 
                className="start-button"
                onClick={() => handleStartQuiz(quiz)}
              >
                {t.home.startButton}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;