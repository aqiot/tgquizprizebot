import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Home from './screens/Home';
import Quiz from './screens/Quiz';
import Result from './screens/Result';
import { Quiz as QuizType } from './types';
import { initTelegram } from './utils/telegram';
import './App.css';

type Screen = 'home' | 'quiz' | 'result';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: 0,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 0,
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegram();
  }, []);

  const handleStartQuiz = (quiz: QuizType) => {
    setSelectedQuiz(quiz);
    setCurrentScreen('quiz');
  };

  const handleQuizComplete = (answers: number[]) => {
    setQuizAnswers(answers);
    setCurrentScreen('result');
  };

  const handleTryAgain = () => {
    setQuizAnswers([]);
    setCurrentScreen('quiz');
  };

  const handleBackToHome = () => {
    setSelectedQuiz(null);
    setQuizAnswers([]);
    setCurrentScreen('home');
  };

  return (
    <LanguageProvider>
      <div className="app">
        <Header />
        <main className="app-content">
          <AnimatePresence mode="wait" initial={false}>
            {currentScreen === 'home' && (
              <motion.div
                key="home"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                style={{ width: '100%' }}
              >
                <Home onStartQuiz={handleStartQuiz} />
              </motion.div>
            )}
            {currentScreen === 'quiz' && selectedQuiz && (
              <motion.div
                key="quiz"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                style={{ width: '100%' }}
              >
                <Quiz
                  quiz={selectedQuiz}
                  onComplete={handleQuizComplete}
                  onBack={handleBackToHome}
                />
              </motion.div>
            )}
            {currentScreen === 'result' && selectedQuiz && (
              <motion.div
                key="result"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                style={{ width: '100%' }}
              >
                <Result
                  quiz={selectedQuiz}
                  answers={quizAnswers}
                  onTryAgain={handleTryAgain}
                  onBackToHome={handleBackToHome}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
