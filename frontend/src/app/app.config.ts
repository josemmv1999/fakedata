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
  FlaskConical,
  Github,
  Info,
  Languages,
  ListChecks,
  LUCIDE_ICONS,
  LucideIconProvider,
  Monitor,
  Moon,
  Scale,
  Search,
  Server,
  Sun,
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
        FlaskConical,
        Github,
        Info,
        Languages,
        ListChecks,
        Monitor,
        Moon,
        Scale,
        Search,
        Server,
        Sun,
        X,
      }),
    },
  ],
};
