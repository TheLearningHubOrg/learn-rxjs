import { describe, it, expect } from 'vitest';
import { ReactiveStateStore, runHigherOrderPipeline, executeResilientPipeline } from '../src/observables/stream-lab.js';
import { RXJS_STAGES, getStage, stagesWithCode } from '../src/types/roadmap.js';

describe('ReactiveStateStore', () => {
  it('initializes with default state and updates correctly', () => {
    const store = new ReactiveStateStore({ count: 10 });
    expect(store.snapshot).toEqual({ count: 10 });

    store.update(s => ({ count: s.count + 5 }));
    expect(store.snapshot).toEqual({ count: 15 });
  });

  it('emits changes via selector streams and deduplicates identical emissions', () => {
    const store = new ReactiveStateStore({ count: 1, name: 'Alice' });
    const emissions: number[] = [];

    const sub = store.select(s => s.count).subscribe(val => emissions.push(val));

    store.update(s => ({ ...s, name: 'Bob' })); // count unchanged
    store.update(s => ({ ...s, count: 2 }));
    store.update(s => ({ ...s, count: 2 })); // deduplicated
    store.update(s => ({ ...s, count: 3 }));
    sub.unsubscribe();

    expect(emissions).toEqual([1, 2, 3]);
  });
});

describe('Higher-Order Concurrency Pipelines', () => {
  it('switchMap cancels previous inner subscriptions and returns the latest', async () => {
    const results = await runHigherOrderPipeline('switch', [1, 2, 3]);
    // Since 1 and 2 are cancelled by subsequent emissions, only 3 completes
    expect(results).toEqual(['Item-3-Done']);
  });

  it('concatMap strictly buffers and preserves sequential order', async () => {
    const results = await runHigherOrderPipeline('concat', [1, 2, 3]);
    expect(results).toEqual(['Item-1-Done', 'Item-2-Done', 'Item-3-Done']);
  });

  it('mergeMap runs inners concurrently, so the shortest delay finishes first', async () => {
    const results = await runHigherOrderPipeline('merge', [1, 2, 3]);
    expect(results).toEqual(['Item-3-Done', 'Item-2-Done', 'Item-1-Done']);
  });
});

describe('Resilient Pipeline & Error Recovery', () => {
  it('succeeds after transient retry', async () => {
    const res = await executeResilientPipeline(1);
    expect(res.success).toBe(true);
    expect(res.attempts).toBe(2);
    expect(res.data).toContain('Payload acquired');
  });

  it('activates fallback stream when max retries exceeded', async () => {
    const res = await executeResilientPipeline(5);
    expect(res.success).toBe(true);
    expect(res.data).toContain('Fallback payload activated');
  });
});

describe('Roadmap metadata', () => {
  it('lists the seven stages in order', () => {
    expect(RXJS_STAGES.map((s) => s.stageNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getStage(3)?.codePath).toBe('src/stage3');
    expect(stagesWithCode().length).toBeGreaterThanOrEqual(3);
  });
});
