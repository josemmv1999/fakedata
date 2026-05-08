import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Languages,
  ListChecks,
  LUCIDE_ICONS,
  LucideIconProvider,
  Scale,
  Search,
  X,
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Check,
        ChevronDown,
        ChevronUp,
        FileSearch,
        Languages,
        ListChecks,
        Scale,
        Search,
        X,
      }),
    },
  ],
};
