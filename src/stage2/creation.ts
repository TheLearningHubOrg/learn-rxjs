import {
  Observable,
  OperatorFunction,
  bindNodeCallback,
  defer,
  filter,
  firstValueFrom,
  from,
  map,
  of,
  range,
} from 'rxjs';

/** A custom pipeable operator is just a function from Observable to Observable. */
export function multiplyBy(factor: number): OperatorFunction<number, number> {
  return (source$) => source$.pipe(map((n) => n * factor));
}

/** Squares of the even numbers in [1, count], built from range + filter + map. */
export function evenSquares(count: number): Observable<number> {
  return range(1, count).pipe(
    filter((n) => n % 2 === 0),
    map((n) => n * n),
  );
}

/**
 * defer() runs its factory on every subscribe, so each subscriber gets a fresh
 * value. Compare with of(factory()), which evaluates once at creation time.
 */
export function freshTimestamp(clock: () => number): Observable<number> {
  return defer(() => of(clock()));
}

/** from() adapts a Promise; the promise is already running when from() is called. */
export function fromPromiseFactory<T>(factory: () => Promise<T>): Observable<T> {
  // Wrapping in defer makes the promise lazy: nothing starts until subscribe.
  return defer(() => from(factory()));
}

// Same shape as Node's fs.readFile callback: the value is ignored when err is set.
type NodeCallback<T> = (err: Error | null, value: T) => void;

/** A Node-style async function (error-first callback) used to show bindNodeCallback. */
export function lookupUser(id: number, cb: NodeCallback<string>): void {
  setTimeout(() => {
    if (id <= 0) cb(new Error(`invalid id ${id}`), '');
    else cb(null, `user-${id}`);
  }, 0);
}

/** (id) => Observable<string>: emits the value then completes, or errors with err. */
export const lookupUser$ = bindNodeCallback(lookupUser);

/** Converting back to a Promise at the edge of the reactive world. */
export function firstUser(id: number): Promise<string> {
  return firstValueFrom(lookupUser$(id));
}
