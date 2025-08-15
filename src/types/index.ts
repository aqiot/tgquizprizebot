export interface Question {
  questionID: number;
  question: string;
  questionRU: string;
  answer1: string;
  answer1RU: string;
  answer2: string;
  answer2RU: string;
  answer3: string;
  answer3RU: string;
  correctAnswer: number;
}

export interface Quiz {
  quizID: string;
  quizName: string;
  quizNameRU: string;
  questions: Question[];
}

export interface QuizResult {
  tgID: string;
  quizID: string;
  questionsAnswered: number;
}

export interface Campaign {
  campaign_id: string;
}

export type Language = 'en' | 'ru';

export interface QuizState {
  currentQuestionIndex: number;
  answers: number[];
  startTime: number;
}

export interface UserData {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}