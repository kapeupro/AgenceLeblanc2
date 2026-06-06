import { treaty } from '@elysiajs/eden';
import type { App } from '../../../backend/src/index';

export const api = treaty<App>(
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
);
