import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Quiz as QuizType, QuizState } from '../types';
import { saveQuizProgress, loadQuizProgress, clearQuizProgress } from '../utils/storage';
import { hapticFeedback } from '../utils/telegram';
import { QuestionSkeleton } from '../components/Skeleton';
import './Quiz.css';

interface QuizProps {
  quiz: QuizType;
  onComplete: (answers: number[]) => void;
  onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ quiz, onComplete, onBack }) => {
  const { t, language } = useLanguage();
  const [state, setState] = useState<QuizState>(() => {
    const saved = loadQuizProgress(quiz.quizID);
    if (saved) {
      return saved;
    }
    return {
      currentQuestionIndex: 0,
      answers: [],
      startTime: Date.now()
    };
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Limit to 6 questions
  const questions = quiz.questions.slice(0, 6);
  const currentQuestion = questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // Save progress on each answer
    if (state.answers.length > 0) {
      saveQuizProgress(quiz.quizID, state);
    }
  }, [state, quiz.quizID]);

  useEffect(() => {
    // Show back button in Telegram
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.show();
      window.Telegram.WebApp.BackButton.onClick(handleBack);
      
      return () => {
        window.Telegram.WebApp.BackButton.hide();
        window.Telegram.WebApp.BackButton.offClick(handleBack);
      };
    }
  }, []);

  const handleBack = () => {
    onBack();
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    hapticFeedback.selection();
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    hapticFeedback.impact('light');
    setIsTransitioning(true);

    const newAnswers = [...state.answers, selectedAnswer];
    
    if (state.currentQuestionIndex === questions.length - 1) {
      // Quiz completed
      clearQuizProgress();
      setTimeout(() => {
        onComplete(newAnswers);
      }, 200);
    } else {
      // Move to next question
      setTimeout(() => {
        setState({
          ...state,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          answers: newAnswers
        });
        setSelectedAnswer(null);
        setIsTransitioning(false);
      }, 200);
    }
  };

  if (!currentQuestion) {
    return <QuestionSkeleton />;
  }

  const questionText = language === 'ru' ? currentQuestion.questionRU : currentQuestion.question;
  const answers = [
    language === 'ru' ? currentQuestion.answer1RU : currentQuestion.answer1,
    language === 'ru' ? currentQuestion.answer2RU : currentQuestion.answer2,
    language === 'ru' ? currentQuestion.answer3RU : currentQuestion.answer3
  ];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="progress-text">
            {t.quiz.question} {state.currentQuestionIndex + 1} {t.quiz.of} {questions.length}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentQuestionIndex}
          className="question-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="question-text">{questionText}</h2>

          <div className="answers-container">
            {answers.map((answer, index) => (
              <motion.button
                key={index}
                className={`answer-button ${selectedAnswer === index + 1 ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(index + 1)}
                disabled={isTransitioning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="answer-number">{index + 1}</span>
                <span className="answer-text">{answer}</span>
              </motion.button>
            ))}
          </div>

          <motion.button
            className="next-button"
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || isTransitioning}
            initial={false}
            animate={{ opacity: selectedAnswer !== null ? 1 : 0.5 }}
            whileHover={selectedAnswer !== null ? { scale: 1.02 } : {}}
            whileTap={selectedAnswer !== null ? { scale: 0.98 } : {}}
          >
            {state.currentQuestionIndex === questions.length - 1 
              ? t.quiz.finish 
              : t.quiz.nextQuestion}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;