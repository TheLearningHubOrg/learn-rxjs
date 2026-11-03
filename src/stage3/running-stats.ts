import { Observable, map, scan } from 'rxjs';

export interface Stats {
  count: number;
  sum: number;
  min: number;
  max: number;
  mean: number;
}

const EMPTY_STATS: Stats = { count: 0, sum: 0, min: Infinity, max: -Infinity, mean: 0 };

/**
 * scan keeps state between emissions and emits every intermediate result,
 * which suits live dashboards. reduce would emit once, on completion.
 */
export function runningStats(values$: Observable<number>): Observable<Stats> {
  return values$.pipe(
    scan(
      (acc, v) => ({
        count: acc.count + 1,
        sum: acc.sum + v,
        min: Math.min(acc.min, v),
        max: Math.max(acc.max, v),
        mean: 0,
      }),
      EMPTY_STATS,
    ),
    map((s) => ({ ...s, mean: s.sum / s.count })),
  );
}
