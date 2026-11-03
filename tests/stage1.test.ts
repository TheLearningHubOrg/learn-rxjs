import { describe, expect, it } from 'vitest';
import { take } from 'rxjs';
import { countdown, createTicker, recordEmissionOrder } from '../src/stage1/observable-basics.js';

describe('Stage 1: the Observable contract', () => {
  it('countdown emits synchronously and completes', () => {
    const seen: (number | 'done')[] = [];
    countdown(3).subscribe({ next: (n) => seen.push(n), complete: () => seen.push('done') });
    expect(seen).toEqual([3, 2, 1, 'done']);
  });

  it('is cold: every subscriber runs its own producer', () => {
    const a: number[] = [];
    const b: number[] = [];
    const source$ = countdown(2);
    source$.subscribe((n) => a.push(n));
    source$.subscribe((n) => b.push(n));
    expect(a).toEqual([2, 1]);
    expect(b).toEqual([2, 1]);
  });

  it('stops producing once the subscriber closes', () => {
    const seen: number[] = [];
    countdown(1_000_000).pipe(take(2)).subscribe((n) => seen.push(n));
    expect(seen).toEqual([1_000_000, 999_999]);
  });

  it('runs the teardown on unsubscribe', () => {
    const ticker = createTicker(1_000);
    const sub = ticker.ticks$.subscribe();
    expect(ticker.activeTimers()).toBe(1);
    sub.unsubscribe();
    expect(ticker.activeTimers()).toBe(0);
    expect(sub.closed).toBe(true);
  });

  it('runs the teardown when an operator completes the stream', async () => {
    const ticker = createTicker(1);
    const values = await new Promise<number[]>((resolve) => {
      const out: number[] = [];
      ticker.ticks$.pipe(take(3)).subscribe({ next: (v) => out.push(v), complete: () => resolve(out) });
    });
    expect(values).toEqual([0, 1, 2]);
    expect(ticker.activeTimers()).toBe(0);
  });

  it('delivers sync values before subscribe() returns and async values later', async () => {
    expect(await recordEmissionOrder()).toEqual([
      'before subscribe',
      'sync value',
      'after subscribe',
      'async value',
      'complete',
    ]);
  });
});
