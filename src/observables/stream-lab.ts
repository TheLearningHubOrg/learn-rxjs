import {
  Observable,
  Subject,
  BehaviorSubject,
  ReplaySubject,
  of,
  from,
  interval,
  timer,
  throwError,
  combineLatest,
  forkJoin
} from 'rxjs';
import {
  map,
  filter,
  scan,
  take,
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  catchError,
  retry,
  debounceTime,
  distinctUntilChanged,
  shareReplay
} from 'rxjs/operators';

/**
 * Reactive State Store built with BehaviorSubject.
 */
export class ReactiveStateStore<T> {
  private readonly _state$: BehaviorSubject<T>;
  public readonly state$: Observable<T>;

  constructor(initialState: T) {
    this._state$ = new BehaviorSubject<T>(initialState);
    this.state$ = this._state$.asObservable();
  }

  public get snapshot(): T {
    return this._state$.getValue();
  }

  public update(updater: (current: T) => T): void {
    const nextState = updater(this.snapshot);
    this._state$.next(nextState);
  }

  public select<K>(selector: (state: T) => K): Observable<K> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}

/**
 * Demonstrates Higher-Order Mapping strategies.
 */
export async function runHigherOrderPipeline(
  type: 'switch' | 'merge' | 'concat',
  inputs: number[]
): Promise<string[]> {
  const results: string[] = [];
  const source$ = from(inputs);

  const simulateAsyncWorker = (id: number) => {
    // Delay inversely proportional to id to showcase re-ordering / cancellation
    const delayMs = (4 - id) * 10;
    return timer(delayMs).pipe(
      map(() => `Item-${id}-Done`)
    );
  };

  let pipeline$: Observable<string>;

  switch (type) {
    case 'switch':
      pipeline$ = source$.pipe(switchMap(id => simulateAsyncWorker(id)));
      break;
    case 'merge':
      pipeline$ = source$.pipe(mergeMap(id => simulateAsyncWorker(id)));
      break;
    case 'concat':
      pipeline$ = source$.pipe(concatMap(id => simulateAsyncWorker(id)));
      break;
  }

  return new Promise((resolve) => {
    pipeline$.subscribe({
      next: (val) => results.push(val),
      complete: () => resolve(results)
    });
  });
}

/**
 * Resilient Retry Stream with Fallback.
 */
export async function executeResilientPipeline(failCount: number): Promise<{ success: boolean; data: string; attempts: number }> {
  let attempts = 0;

  const flakyStream$ = new Observable<string>((subscriber) => {
    attempts++;
    if (attempts <= failCount) {
      subscriber.error(new Error(`Simulated transient failure on attempt #${attempts}`));
    } else {
      subscriber.next(`Payload acquired on attempt #${attempts}`);
      subscriber.complete();
    }
  }).pipe(
    retry(2),
    catchError((err) => {
      return of(`Fallback payload activated due to: ${err.message}`);
    })
  );

  return new Promise((resolve) => {
    flakyStream$.subscribe({
      next: (data) => resolve({ success: true, data, attempts }),
      error: () => resolve({ success: false, data: 'Fatal Error', attempts })
    });
  });
}
