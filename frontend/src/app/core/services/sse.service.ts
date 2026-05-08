import { Injectable } from '@angular/core';

import type { VerificationEvent } from '../../models/verification.types';

@Injectable({ providedIn: 'root' })
export class SseService {
  /**
   * POSTea `body` a `url` y devuelve un async generator de eventos SSE
   * tipados. Usa fetch + ReadableStream porque EventSource solo soporta GET.
   */
  async *stream(
    url: string,
    body: unknown,
    signal?: AbortSignal,
  ): AsyncGenerator<VerificationEvent, void, void> {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${text || resp.statusText}`);
    }
    if (!resp.body) {
      throw new Error('Respuesta sin cuerpo');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const chunk = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const parsed = parseEventChunk(chunk);
        if (parsed) yield parsed;
      }
    }

    const tail = buffer.trim();
    if (tail) {
      const parsed = parseEventChunk(tail);
      if (parsed) yield parsed;
    }
  }
}

function parseEventChunk(chunk: string): VerificationEvent | null {
  let event = '';
  const dataLines: string[] = [];
  for (const line of chunk.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (!event) return null;
  const raw = dataLines.join('\n');
  try {
    const data: unknown = raw ? JSON.parse(raw) : {};
    return { event, data } as VerificationEvent;
  } catch {
    return null;
  }
}
