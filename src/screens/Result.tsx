import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Quiz } from '../types';
import { quizAPI } from '../services/api';
import { getUserData, getCampaignId, sendDataToBot, hapticFeedback } from '../utils/telegram';
import './Result.css';

interface ResultProps {
  quiz: Quiz;
  answers: number[];
  onTryAgain: () => void;
  onBackToHome: () => void;
}

const Result: React.FC<ResultProps> = ({ quiz, answers, onTryAgain, onBackToHome }) => {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate correct answers
  const questions = quiz.questions.slice(0, 6);
  const correctCount = answers.reduce((count, answer, index) => {
    return count + (answer === questions[index].correctAnswer ? 1 : 0);
  }, 0);
  
  const isWinner = correctCount >= 4;
  const userData = getUserData();
  const campaignId = getCampaignId();

  useEffect(() => {
    // Submit result to backend
    submitResult();
    
    // Haptic feedback based on result
    if (isWinner) {
      hapticFeedback.notification('success');
    } else {
      hapticFeedback.notification('warning');
    }
  }, []);

  const submitResult = async () => {
    try {
      const tgID = userData?.id?.toString() || 'anonymous';
      await quizAPI.submitResult({
        tgID,
        quizID: quiz.quizID,
        questionsAnswered: answers.length,
        campaignId: campaignId || undefined
      });
    } catch (err) {
      console.error('Failed to submit result:', err);
    }
  };

  const handleSendToBot = async () => {
    if (submitted) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const tgId = userData?.id?.toString() || 'anonymous';
      const data = {
        tgId,
        quizId: quiz.quizID,
        correct: correctCount,
        total: 6,
        ...(campaignId && { campaignId })
      };
      
      sendDataToBot(data);
      setSubmitted(true);
      hapticFeedback.notification('success');
      
      // Close the WebApp after a delay
      setTimeout(() => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to send data to bot:', err);
      setError(t.result.submitError);
      hapticFeedback.notification('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="result-container">
      <div className="result-content">
        <motion.div 
          className="result-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {isWinner ? '🎉' : '😔'}
        </motion.div>

        <h1 className="result-title">
          {isWinner ? t.result.congratulations : t.result.notEnough}
        </h1>

        <div className="score-display">
          <div className="score-circle">
            <span className="score-number">{correctCount}</span>
            <span className="score-divider">/</span>
            <span className="score-total">6</span>
          </div>
          <p className="score-text">
            {t.result.correctAnswers}
          </p>
        </div>

        <div className="result-actions">
          {isWinner ? (
            <>
              {!submitted ? (
                <button 
                  className="cta-button"
                  onClick={handleSendToBot}
                  disabled={submitting}
                >
                  {submitting ? t.result.submitting : t.result.congratulations}
                </button>
              ) : (
                <motion.div 
                  className="success-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="success-icon">✅</span>
                  <p>{t.result.submitted}</p>
                </motion.div>
              )}
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
            </>
          ) : (
            <button 
              className="try-again-button"
              onClick={onTryAgain}
            >
              {t.result.tryAgain}
            </button>
          )}
          
          <button 
            className="secondary-button"
            onClick={onBackToHome}
          >
            {t.result.backToHome}
          </button>
        </div>

        {/* Visual score breakdown */}
        <div className="answers-breakdown">
          {answers.map((answer, index) => {
            const isCorrect = answer === questions[index].correctAnswer;
            return (
              <motion.div 
                key={index}
                className={`answer-indicator ${isCorrect ? 'correct' : 'incorrect'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                title={`Question ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Result;