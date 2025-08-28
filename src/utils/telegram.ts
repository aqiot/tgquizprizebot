import { UserData } from '../types';

export const initTelegram = () => {
  if (window.Telegram?.WebApp) {
    const webapp = window.Telegram.WebApp;
    webapp.ready();
    webapp.expand();
    webapp.setHeaderColor('#229ED9');
    webapp.setBackgroundColor('#FFFFFF');
  }
};

export const getUserData = (): UserData | null => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url
    };
  }
  return null;
};

export const getCampaignId = (): string | null => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
    try {
      // The start_param is already Base64 encoded from the bot
      const decodedId = atob(window.Telegram.WebApp.initDataUnsafe.start_param);
      console.log('Campaign ID decoded:', decodedId);
      return decodedId;
    } catch (e) {
      console.error('Failed to decode campaign ID:', e);
      // If decoding fails, it might be a plain campaign ID (for backward compatibility)
      console.log('Using raw campaign ID:', window.Telegram.WebApp.initDataUnsafe.start_param);
      return window.Telegram.WebApp.initDataUnsafe.start_param;
    }
  }
  return null;
};

export const sendDataToBot = (data: any) => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  }
};

export const showAlert = (message: string) => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    alert(message);
  }
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    } else {
      resolve(window.confirm(message));
    }
  });
};

export const hapticFeedback = {
  impact: (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
  },
  selection: () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  }
};