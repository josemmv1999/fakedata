import { Injectable, computed, signal } from '@angular/core';

import { environment } from '../../../environments/environment';

export type ApiMode = 'real' | 'mock';

const STORAGE_KEY = 'verifier.apiMode';
const MOCK_API_URL = 'http://localhost:8001/api';

function readStored(): ApiMode {
  if (typeof window === 'undefined') return 'real';
  const v = window.localStorage?.getItem(STORAGE_KEY);
  return v === 'mock' ? 'mock' : 'real';
}

/**
 * Lets the UI swap between the real backend and the local mock backend at
 * runtime, persisted in localStorage. The mock runs on :8001 and emits the
 * same SSE events as the real API but never calls Anthropic.
 */
@Injectable({ providedIn: 'root' })
export class ApiModeService {
  private readonly _mode = signal<ApiMode>(readStored());

  readonly mode = this._mode.asReadonly();
  readonly apiUrl = computed(() =>
    this._mode() === 'mock' ? MOCK_API_URL : environment.apiUrl,
  );

  setMode(mode: ApiMode): void {
    this._mode.set(mode);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY, mode);
    }
  }

  toggle(): void {
    this.setMode(this._mode() === 'real' ? 'mock' : 'real');
  }
}
