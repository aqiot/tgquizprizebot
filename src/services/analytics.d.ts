export interface UserAction {
  userId: string;
  campaignId: string | null;
  action: string;
  details?: any;
  timestamp: string;
  sessionId?: string;
  source?: string;
  medium?: string;
  referrer?: string;
}

export interface MarketingAttributes {
  campaignId: string | null;
  source?: string;
  medium?: string;
  term?: string;
  content?: string;
  referrer?: string;
}

declare class AnalyticsService {
  trackAction(action: string, details?: any): Promise<void>;
  trackQuizStart(quizId: string, quizName: string): void;
  trackQuizComplete(quizId: string, score: number, total: number): void;
  trackQuizQuestion(quizId: string, questionId: number, answer: number, isCorrect: boolean): void;
  trackPageView(page: string): void;
  trackButtonClick(buttonName: string, context?: any): void;
  getMarketingAttributes(): MarketingAttributes | null;
  getSessionId(): string;
  retryFailedEvents(): Promise<void>;
}

declare const analytics: AnalyticsService;
export default analytics;