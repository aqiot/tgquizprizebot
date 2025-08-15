import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Home from './screens/Home';
import Quiz from './screens/Quiz';
import Result from './screens/Result';
import { Quiz as QuizType } from './types';
import { initTelegram } from './utils/telegram';
import './App.css';

type Screen = 'home' | 'quiz' | 'result';

// Page transition variants - optimized for smooth transitions
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 10,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.98,
    y: -10,
  }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.25
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegram();
    
    // Mark app as ready after a brief delay to ensure smooth initial render
    const timer = setTimeout(() => {
      setIsReady(true);
      document.querySelector('.app')?.classList.add('loaded');
    }, 100);
    
    return () => clearTimeout(timer);
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
      <MotionConfig reducedMotion="user">
        <div className={`app ${isReady ? 'loaded' : ''}`}>
          <Header />
          <main className="app-content">
            <AnimatePresence mode="wait" initial={false}>
              {currentScreen === 'home' && (
                <motion.div
                  key="home"
                  className="screen-container"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Home onStartQuiz={handleStartQuiz} />
                </motion.div>
              )}
              {currentScreen === 'quiz' && selectedQuiz && (
                <motion.div
                  key="quiz"
                  className="screen-container"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
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
                  className="screen-container"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
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
      </MotionConfig>
    </LanguageProvider>
  );
}

export default App;
