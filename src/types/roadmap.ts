/**
 * The Learning Hub - RxJS 7+ Reactive Architecture Roadmap
 */

export interface RoadmapStage {
  stageNumber: number;
  title: string;
  domainFocus: string;
  completed: boolean;
  keyTopics: string[];
}

export const RXJS_STAGES: RoadmapStage[] = [
  {
    stageNumber: 1,
    title: "Foundations of Reactive Streams & Push-Based Architecture",
    domainFocus: "Observer Pattern, Iterable vs Observable duality, cold vs hot observables, subscription lifecycle",
    completed: true,
    keyTopics: ["Observable Producer Contract", "Observer (next, error, complete)", "Subscription & Teardown Logic", "Unicast vs Multicast"]
  },
  {
    stageNumber: 2,
    title: "Creational Operators & Event Bridge Primitives",
    domainFocus: "of, from, fromEvent, interval, timer, defer, ajax, and webSocket streams",
    completed: true,
    keyTopics: ["fromEvent DOM/Node bindings", "defer Dynamic Generation", "from Promise Bridge", "interval/timer Scheduling"]
  },
  {
    stageNumber: 3,
    title: "Stream Transformation & Filtering Mechanics",
    domainFocus: "Pure functional pipelines: map, filter, scan, reduce, distinctUntilChanged, debounceTime, throttleTime",
    completed: true,
    keyTopics: ["scan State Accumulation", "distinctUntilChanged Deduplication", "debounceTime vs throttleTime", "takeUntil Declarative Unsubscription"]
  },
  {
    stageNumber: 4,
    title: "Higher-Order Observables & Flattening Strategies",
    domainFocus: "Inner stream concurrency control: switchMap, mergeMap, concatMap, exhaustMap",
    completed: true,
    keyTopics: ["switchMap Cancellation", "mergeMap Concurrent Processing", "concatMap Queued Sequential Execution", "exhaustMap Ignore Strategy"]
  },
  {
    stageNumber: 5,
    title: "Multicasting, State Containers & Subjects",
    domainFocus: "Subject, BehaviorSubject, ReplaySubject, AsyncSubject, shareReplay caching",
    completed: true,
    keyTopics: ["BehaviorSubject State Stores", "ReplaySubject Buffer Retention", "shareReplay(1) Request Deduplication", "AsyncSubject Completion Emission"]
  },
  {
    stageNumber: 6,
    title: "Combination, Error Resilience & Backpressure",
    domainFocus: "combineLatest, forkJoin, withLatestFrom, zip, catchError, retry, retryWhen",
    completed: true,
    keyTopics: ["combineLatest Tuple Synchronization", "forkJoin Parallel Completion", "Exponential Backoff Retries", "catchError Fallback Streams"]
  },
  {
    stageNumber: 7,
    title: "Staff Reactive Architect Interview Handbook",
    domainFocus: "40+ staff scenario Q&As, memory leak forensics, schedulers (Asap, Async, Queue), marble testing",
    completed: true,
    keyTopics: ["TestScheduler Marble Syntax", "Schedulers & Microtasks", "Long-lived Subscription Leaks Forensics", "Complex Stream State Machines"]
  }
];

export function getCompletedCount(): number {
  return RXJS_STAGES.filter(s => s.completed).length;
}

export function getProgressPercentage(): number {
  return Math.round((getCompletedCount() / RXJS_STAGES.length) * 100);
}
