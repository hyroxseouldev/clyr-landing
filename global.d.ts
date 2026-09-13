import messages from './messages/ko.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'ko' | 'en';
    Messages: typeof messages;
  }
}
