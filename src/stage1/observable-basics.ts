import { Observable } from 'rxjs';

/**
 * Emits n, n-1, ..., 1 synchronously and then completes.
 * The producer runs once per subscriber (a cold, unicast Observable).
 */
export function countdown(start: number): Observable<number> {
  return new Observable<number>((subscriber) => {
    for (let i = start; i > 0 && !subscriber.closed; i--) {
      subscriber.next(i);
    }
    subscriber.complete();
  });
}

export interface TickerHandle {
  ticks$: Observable<number>;
  /** How many timers are currently running. Teardown must bring it back to 0. */
  activeTimers(): number;
}

/**
 * An interval built by hand so the teardown is visible.
 * Returning a function from the subscribe callback registers the teardown,
 * which RxJS runs on unsubscribe, error or complete.
 */
export function createTicker(periodMs: number): TickerHandle {
  let active = 0;
  const ticks$ = new Observable<number>((subscriber) => {
    let n = 0;
    active++;
    const id = setInterval(() => subscriber.next(n++), periodMs);
    return () => {
      clearInterval(id);
      active--;
    };
  });
  return { ticks$, activeTimers: () => active };
}

/**
 * Records the order in which synchronous and asynchronous notifications arrive
 * relative to the code around subscribe().
 */
export function recordEmissionOrder(): Promise<string[]> {
  const log: string[] = [];
  const source$ = new Observable<string>((subscriber) => {
    subscriber.next('sync value');
    setTimeout(() => {
      subscriber.next('async value');
      subscriber.complete();
    }, 0);
  });

  return new Promise((resolve) => {
    log.push('before subscribe');
    source$.subscribe({
      next: (v) => log.push(v),
      complete: () => {
        log.push('complete');
        resolve(log);
      },
    });
    log.push('after subscribe');
  });
}
