import { interval, map, of, take } from 'rxjs';
import { countdown, createTicker, recordEmissionOrder } from './stage1/observable-basics.js';
import { evenSquares, firstUser, multiplyBy } from './stage2/creation.js';
import { runningStats } from './stage3/running-stats.js';
import { typeahead } from './stage3/typeahead.js';
import { ReactiveStateStore, executeResilientPipeline, runHigherOrderPipeline } from './observables/stream-lab.js';
import { RXJS_STAGES } from './types/roadmap.js';

async function stage1(): Promise<void> {
  console.log('--- Stage 1: Observables, Observers, Subscriptions ---');
  const values: number[] = [];
  countdown(3).subscribe((n) => values.push(n));
  console.log(`  countdown(3): [${values.join(', ')}]`);
  console.log(`  emission order: ${(await recordEmissionOrder()).join(' -> ')}`);

  const ticker = createTicker(5);
  const sub = ticker.ticks$.subscribe();
  console.log(`  timers while subscribed: ${ticker.activeTimers()}`);
  sub.unsubscribe();
  console.log(`  timers after unsubscribe: ${ticker.activeTimers()}`);
}

async function stage2(): Promise<void> {
  console.log('\n--- Stage 2: Creation operators and pipe() ---');
  const squares: number[] = [];
  evenSquares(6).subscribe((n) => squares.push(n));
  console.log(`  evenSquares(6): [${squares.join(', ')}]`);
  const tripled: number[] = [];
  of(1, 2, 3).pipe(multiplyBy(3)).subscribe((n) => tripled.push(n));
  console.log(`  of(1,2,3).pipe(multiplyBy(3)): [${tripled.join(', ')}]`);
  console.log(`  firstValueFrom(lookupUser$(7)): ${await firstUser(7)}`);
}

async function stage3(): Promise<void> {
  console.log('\n--- Stage 3: Transformation and filtering ---');
  const last = await new Promise<string>((resolve) => {
    let out = '';
    runningStats(of(4, 8, 6)).subscribe({
      next: (s) => (out = `count=${s.count} min=${s.min} max=${s.max} mean=${s.mean}`),
      complete: () => resolve(out),
    });
  });
  console.log(`  runningStats(4, 8, 6): ${last}`);

  const keystrokes$ = interval(10).pipe(
    take(4),
    map((i) => ['r', 'rx', 'rxj', 'rxjs'][i]),
  );
  const catalogue = ['rxjs', 'rxjs-testing', 'react'];
  await new Promise<void>((resolve) => {
    typeahead(keystrokes$, (q) => of(catalogue.filter((c) => c.startsWith(q))), { debounceMs: 30 }).subscribe({
      next: (r) => console.log(`  typeahead "${r.query}": [${r.items.join(', ')}]`),
      complete: () => resolve(),
    });
  });
}

async function previews(): Promise<void> {
  console.log('\n--- Stages 4-5 preview: state store, flattening, retry ---');
  const store = new ReactiveStateStore({ unreadAlerts: 0 });
  const sub = store.select((s) => s.unreadAlerts).subscribe((n) => console.log(`  unreadAlerts: ${n}`));
  store.update((s) => ({ ...s, unreadAlerts: 3 }));
  sub.unsubscribe();

  for (const kind of ['switch', 'concat', 'merge'] as const) {
    const results = await runHigherOrderPipeline(kind, [1, 2, 3]);
    console.log(`  ${kind}Map: [${results.join(', ')}]`);
  }
  const resilient = await executeResilientPipeline(1);
  console.log(`  retry: ${resilient.data} (attempts: ${resilient.attempts})`);
}

async function main(): Promise<void> {
  console.log('learn-rxjs starter: runnable examples for the guide\n');
  await stage1();
  await stage2();
  await stage3();
  await previews();
  console.log('\nRoadmap:');
  for (const s of RXJS_STAGES) console.log(`  Stage ${s.stageNumber}: ${s.title}`);
}

main().catch((err: unknown) => {
  console.error('learn-rxjs demo failed:', err);
  process.exit(1);
});
