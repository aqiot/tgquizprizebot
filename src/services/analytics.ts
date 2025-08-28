import axios from 'axios';
import { getUserData, getCampaignId } from '../utils/telegram';

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
  source?: string;      // e.g., 'telegram', 'facebook', 'twitter'
  medium?: string;      // e.g., 'social', 'email', 'cpc'
  term?: string;        // Keywords for paid search campaigns
  content?: string;     // To differentiate similar content/links
  referrer?: string;    // The referring URL or channel
}

class AnalyticsService {
  private sessionId: string;
  private marketingAttributes: MarketingAttributes | null = null;
  private userId: string | null = null;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }
  
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private initializeTracking() {
    // Get user data
    const userData = getUserData();
    this.userId = userData?.id?.toString() || 'anonymous';
    
    // Parse campaign and marketing attributes
    const campaignId = getCampaignId();
    
    // Parse URL parameters for additional marketing attributes
    const urlParams = new URLSearchParams(window.location.search);
    
    this.marketingAttributes = {
      campaignId,
      source: urlParams.get('utm_source') || urlParams.get('source') || 'telegram',
      medium: urlParams.get('utm_medium') || urlParams.get('medium') || 'bot',
      term: urlParams.get('utm_term') || urlParams.get('term') || undefined,
      content: urlParams.get('utm_content') || urlParams.get('content') || undefined,
      referrer: document.referrer || undefined
    };
    
    // Log session start
    this.trackAction('session_start', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    });
  }
  
  public async trackAction(action: string, details?: any) {
    const userAction: UserAction = {
      userId: this.userId || 'anonymous',
      campaignId: this.marketingAttributes?.campaignId || null,
      action,
      details: {
        ...details,
        ...this.marketingAttributes
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      source: this.marketingAttributes?.source,
      medium: this.marketingAttributes?.medium,
      referrer: this.marketingAttributes?.referrer
    };
    
    try {
      // Send to backend API
      await this.sendToBackend(userAction);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', userAction);
      }
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }
  
  private async sendToBackend(userAction: UserAction) {
    try {
      await axios.post('/api/analytics/track', userAction);
    } catch (error) {
      console.error('Failed to send analytics to backend:', error);
      // Store in localStorage for retry
      this.storeForRetry(userAction);
    }
  }
  
  private storeForRetry(userAction: UserAction) {
    try {
      const stored = localStorage.getItem('analytics_queue') || '[]';
      const queue = JSON.parse(stored);
      queue.push(userAction);
      // Keep only last 50 events
      if (queue.length > 50) {
        queue.shift();
      }
      localStorage.setItem('analytics_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to store analytics for retry:', error);
    }
  }
  
  public async retryFailedEvents() {
    try {
      const stored = localStorage.getItem('analytics_queue');
      if (!stored) return;
      
      const queue = JSON.parse(stored);
      if (queue.length === 0) return;
      
      // Try to send all queued events
      const results = await Promise.allSettled(
        queue.map((event: UserAction) => this.sendToBackend(event))
      );
      
      // Keep only failed events
      const failedEvents = queue.filter((_: any, index: number) => 
        results[index].status === 'rejected'
      );
      
      if (failedEvents.length === 0) {
        localStorage.removeItem('analytics_queue');
      } else {
        localStorage.setItem('analytics_queue', JSON.stringify(failedEvents));
      }
    } catch (error) {
      console.error('Failed to retry analytics events:', error);
    }
  }
  
  // Specific tracking methods
  public trackQuizStart(quizId: string, quizName: string) {
    this.trackAction('quiz_start', { quizId, quizName });
  }
  
  public trackQuizComplete(quizId: string, score: number, total: number) {
    this.trackAction('quiz_complete', { 
      quizId, 
      score, 
      total, 
      percentage: Math.round((score / total) * 100) 
    });
  }
  
  public trackQuizQuestion(quizId: string, questionId: number, answer: number, isCorrect: boolean) {
    this.trackAction('quiz_question_answered', { 
      quizId, 
      questionId, 
      answer, 
      isCorrect 
    });
  }
  
  public trackPageView(page: string) {
    this.trackAction('page_view', { page });
  }
  
  public trackButtonClick(buttonName: string, context?: any) {
    this.trackAction('button_click', { buttonName, ...context });
  }
  
  public getMarketingAttributes(): MarketingAttributes | null {
    return this.marketingAttributes;
  }
  
  public getSessionId(): string {
    return this.sessionId;
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Retry failed events on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => analytics.retryFailedEvents(), 5000);
  });
}

export default analytics;