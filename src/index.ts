import { ReactiveStateStore, runHigherOrderPipeline, executeResilientPipeline } from './observables/stream-lab.js';
import { RXJS_STAGES, getCompletedCount, getProgressPercentage } from './types/roadmap.js';

async function main() {
  console.log('======================================================');
  console.log('  The Learning Hub - RxJS 7+ Reactive Architecture');
  console.log('======================================================');
  console.log('Paradigm: Asynchronous Functional Reactive Programming (FRP)');
  console.log('Core Abstractions: Observable, Observer, Operators, Schedulers\n');

  // 1. Reactive State Store Demo
  console.log('--- 1. BehaviorSubject Reactive State Store ---');
  interface AppState {
    user: string;
    theme: 'light' | 'dark';
    unreadAlerts: number;
  }

  const store = new ReactiveStateStore<AppState>({
    user: 'Alice',
    theme: 'dark',
    unreadAlerts: 0
  });

  const alertsSub = store.select(s => s.unreadAlerts).subscribe(alerts => {
    console.log(`  [State Stream] Unread alerts count updated: ${alerts}`);
  });

  store.update(s => ({ ...s, unreadAlerts: 3 }));
  store.update(s => ({ ...s, unreadAlerts: 7 }));
  alertsSub.unsubscribe();

  // 2. Higher-Order Concurrency Pipelines
  console.log('\n--- 2. Higher-Order Concurrency Operators Comparison ---');
  const items = [1, 2, 3];

  const switchResults = await runHigherOrderPipeline('switch', items);
  console.log(`  switchMap (cancellation): [${switchResults.join(', ')}]`);

  const concatResults = await runHigherOrderPipeline('concat', items);
  console.log(`  concatMap (queued in-order): [${concatResults.join(', ')}]`);

  const mergeResults = await runHigherOrderPipeline('merge', items);
  console.log(`  mergeMap (parallel emission): [${mergeResults.join(', ')}]`);

  // 3. Resilient Streams
  console.log('\n--- 3. Error Resilience, Retry & Fallbacks ---');
  const resilientRes = await executeResilientPipeline(1);
  console.log(`  Result: ${resilientRes.data} (attempts needed: ${resilientRes.attempts})\n`);

  // 4. 7-Stage Pedagogical Roadmap
  console.log('--- 4. 7-Stage RxJS Masterclass Roadmap ---');
  for (const stage of RXJS_STAGES) {
    const icon = stage.completed ? '[OK]' : '[..]';
    console.log(` ${icon} Stage ${stage.stageNumber}: ${stage.title}`);
    console.log(`      Focus: ${stage.domainFocus}`);
    console.log(`      Topics: ${stage.keyTopics.join(', ')}`);
  }

  const completed = getCompletedCount();
  const percent = getProgressPercentage();
  console.log('------------------------------------------------------');
  console.log(`Progress: ${completed}/7 Stages Complete (${percent}%)`);
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('Fatal error in learn-rxjs runner:', err);
  process.exit(1);
});
