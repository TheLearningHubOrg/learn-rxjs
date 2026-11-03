/**
 * The seven stages of this guide, mirrored from README.md so the demo runner
 * can print the learning path next to the code that belongs to each stage.
 */

export interface RoadmapStage {
  stageNumber: number;
  title: string;
  domainFocus: string;
  /** Folder in src/ that holds the runnable code for the stage, if any. */
  codePath?: string;
  keyTopics: string[];
}

export const RXJS_STAGES: RoadmapStage[] = [
  {
    stageNumber: 1,
    title: 'Reactive Foundations: Observables, Observers & Subscriptions',
    domainFocus: 'The Observable contract, observers, teardown, sync vs async delivery, cold vs hot',
    codePath: 'src/stage1',
    keyTopics: ['new Observable()', 'subscribe()', 'Subscription.unsubscribe()', 'teardown functions'],
  },
  {
    stageNumber: 2,
    title: 'Creation Operators & the pipe() Pipeline',
    domainFocus: 'of, from, range, interval, timer, defer, fromEvent, bindNodeCallback, firstValueFrom',
    codePath: 'src/stage2',
    keyTopics: ['pipe()', 'OperatorFunction', 'defer() laziness', 'Promise interop'],
  },
  {
    stageNumber: 3,
    title: 'Transformation, Filtering & Rate-Limiting Operators',
    domainFocus: 'map, scan, filter, distinctUntilChanged, takeUntil, debounceTime, throttleTime',
    codePath: 'src/stage3',
    keyTopics: ['scan state', 'debounceTime vs throttleTime', 'typeahead pipeline', 'switchMap preview'],
  },
  {
    stageNumber: 4,
    title: 'Higher-Order Mapping, Combination & Error Handling',
    domainFocus: 'switchMap, mergeMap, concatMap, exhaustMap, combineLatest, forkJoin, catchError, retry',
    codePath: 'src/observables',
    keyTopics: ['flattening strategies', 'join operators', 'retry with backoff', 'fallback streams'],
  },
  {
    stageNumber: 5,
    title: 'Subjects, Multicasting & Schedulers',
    domainFocus: 'Subject, BehaviorSubject, ReplaySubject, share, shareReplay, asyncScheduler',
    codePath: 'src/observables',
    keyTopics: ['BehaviorSubject store', 'shareReplay(1)', 'connectable', 'scheduler queues'],
  },
  {
    stageNumber: 6,
    title: 'Utility Operators, Testing & Performance',
    domainFocus: 'tap, delay, timeout, materialize, TestScheduler, leak prevention',
    keyTopics: ['marble testing', 'timeout config', 'memory leaks', 'bundle size'],
  },
  {
    stageNumber: 7,
    title: 'Staff RxJS Engineer Interview Handbook & Cheatsheet',
    domainFocus: '40+ interview questions, scenario debugging, staff cheatsheet',
    keyTopics: ['internals', 'failure modes', 'architecture trade-offs', 'migration strategy'],
  },
];

export function getStage(stageNumber: number): RoadmapStage | undefined {
  return RXJS_STAGES.find((s) => s.stageNumber === stageNumber);
}

export function stagesWithCode(): RoadmapStage[] {
  return RXJS_STAGES.filter((s) => s.codePath !== undefined);
}
