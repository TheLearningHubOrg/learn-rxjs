import { describe, expect, it } from 'vitest';
import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { runningStats } from '../src/stage3/running-stats.js';
import { typeahead } from '../src/stage3/typeahead.js';

const newScheduler = () => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('Stage 3: runningStats (scan)', () => {
  it('emits an updated snapshot for every value', () => {
    newScheduler().run(({ cold, expectObservable }) => {
      const values$ = cold('a-b-c|', { a: 2, b: 8, c: 5 });
      expectObservable(runningStats(values$)).toBe('x-y-z|', {
        x: { count: 1, sum: 2, min: 2, max: 2, mean: 2 },
        y: { count: 2, sum: 10, min: 2, max: 8, mean: 5 },
        z: { count: 3, sum: 15, min: 2, max: 8, mean: 5 },
      });
    });
  });
});

describe('Stage 3: typeahead pipeline', () => {
  it('debounces keystrokes and drops repeated queries', () => {
    newScheduler().run(({ hot, cold, expectObservable }) => {
      // Frames: a=0, b=2, c=4, d=15, e=26 (each "10ms" adds 10 frames, each letter 1).
      const input$ = hot('a-b-c 10ms d 10ms e', { a: 'r', b: 'rx', c: 'rxj', d: ' RXJ ', e: 'rxjs' });
      const search = (q: string) => cold('--r|', { r: [`${q}-result`] });
      const result$ = typeahead(input$, search, { debounceMs: 5, minLength: 2 });

      // c settles at 4 + 5 = 9, its response arrives 2 frames later at 11.
      // d normalises to "rxj" and is dropped by distinctUntilChanged.
      // e settles at 31, its response arrives at 33.
      expectObservable(result$).toBe('11ms x 21ms y', {
        x: { query: 'rxj', items: ['rxj-result'] },
        y: { query: 'rxjs', items: ['rxjs-result'] },
      });
    });
  });

  it('switchMap cancels a slow in-flight search when a newer query arrives', () => {
    newScheduler().run(({ hot, cold, expectObservable }) => {
      const input$ = hot('a 9ms b', { a: 'slow', b: 'fast' });
      const search = (q: string): Observable<string[]> =>
        q === 'slow' ? cold('20ms r|', { r: ['late'] }) : cold('r|', { r: ['quick'] });
      // b is at frame 10, settles at 11, and the "quick" response is synchronous.
      expectObservable(typeahead(input$, search, { debounceMs: 1 })).toBe('11ms y', {
        y: { query: 'fast', items: ['quick'] },
      });
    });
  });

  it('keeps the stream alive after a failed request', () => {
    newScheduler().run(({ hot, cold, expectObservable }) => {
      const input$ = hot('a 9ms b', { a: 'boom', b: 'ok' });
      const search = (q: string): Observable<string[]> =>
        q === 'boom' ? cold('#', undefined, new Error('503')) : cold('r|', { r: ['fine'] });
      expectObservable(typeahead(input$, search, { debounceMs: 1 })).toBe('1ms x 9ms y', {
        x: { query: 'boom', items: [], error: '503' },
        y: { query: 'ok', items: ['fine'] },
      });
    });
  });
});
